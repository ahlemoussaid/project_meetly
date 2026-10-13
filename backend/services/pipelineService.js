const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Meeting = require('../models/Meeting');
const { generateSummary } = require('./summarizationService');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/**
 * Converts any input audio file to a normalized 16kHz mono WAV format for PyAnnote and Whisper.
 */
const convertAudioToWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', outputPath];
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', (error) => {
      reject(new Error(`Unable to start FFmpeg (${ffmpegPath}): ${error.message}`));
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg audio conversion failed (code ${code}): ${stderr}`));
      }
    });
  });
};

/**
 * Runs the complete AI Pipeline asynchronously in the background.
 */
const startMeetingProcessing = async (meetingId, uploadedFilePath) => {
  const absoluteInputPath = path.resolve(uploadedFilePath);
  const normalizedWavPath = path.join(tempDir, `normalized-${meetingId}-${Date.now()}.wav`);
  
  try {
    // 1. Update status to 'diarization'
    await Meeting.findByIdAndUpdate(meetingId, { status: 'diarization', error: null });
    
    console.log(`[Pipeline] Converting audio to normalized WAV: ${absoluteInputPath} -> ${normalizedWavPath}`);
    await convertAudioToWav(absoluteInputPath, normalizedWavPath);
    console.log('[Pipeline] Audio conversion successful.');
    
    // 2. Spawn python pipeline script
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const modelPath = process.env.CUSTOM_MODEL_PATH
      || path.resolve(__dirname, '../../models/whisper-darja-lora-v2');
    const hfToken = process.env.HF_TOKEN;
    const device = process.env.DEVICE || 'cpu';
    const scriptPath = path.join(__dirname, 'pipeline.py');
    
    const args = [
      scriptPath,
      '--audio', normalizedWavPath,
      '--model_path', modelPath,
      '--device', device
    ];
    
    if (hfToken) {
      args.push('--hf_token', hfToken);
    }
    
    console.log(`[Pipeline] Spawning Python script: ${pythonPath} with device ${device}`);
    const pyProcess = spawn(pythonPath, args);
    
    let stdoutData = '';
    let stderrData = '';
    let processError = null;

    pyProcess.on('error', (error) => {
      processError = error;
    });
    
    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pyProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      stderrData += msg;
      
      // Parse state updates streamed from Python stderr
      if (msg.includes('STATE: transcribing')) {
        console.log('[Pipeline] Python state changed: transcribing');
        Meeting.findByIdAndUpdate(meetingId, { status: 'transcribing' }).catch(err => console.error(err));
      } else if (msg.includes('STATE: diarization')) {
        console.log('[Pipeline] Python state changed: diarization');
        Meeting.findByIdAndUpdate(meetingId, { status: 'diarization' }).catch(err => console.error(err));
      }
    });
    
    pyProcess.on('close', async (code) => {
      // Always cleanup normalized WAV temp file on python exit
      try {
        if (fs.existsSync(normalizedWavPath)) {
          fs.unlinkSync(normalizedWavPath);
          console.log('[Pipeline] Cleaned up temp normalized WAV.');
        }
      } catch (err) {
        console.error('[Pipeline] Failed to delete temp normalized WAV:', err);
      }
      
      if (code !== 0) {
        const failureDetails = processError
          ? `Unable to start Python (${pythonPath}): ${processError.message}`
          : stderrData;
        console.error(`[Pipeline] Python process failed with code ${code}. ${failureDetails}`);
        await Meeting.findByIdAndUpdate(meetingId, { 
          status: 'failed', 
          error: `Inference pipeline failed: ${failureDetails.slice(0, 300)}`
        });
        return;
      }
      
      try {
        // Parse final transcript from stdout
        const stdoutTrimmed = stdoutData.trim();
        const jsonStartIndex = stdoutTrimmed.lastIndexOf('['); // locate JSON start in stdout
        if (jsonStartIndex === -1) {
          throw new Error('Could not find transcript JSON array in Python output.');
        }
        
        const transcriptJson = stdoutTrimmed.slice(jsonStartIndex);
        const transcript = JSON.parse(transcriptJson);
        
        // 3. Update status to 'summarizing'
        console.log('[Pipeline] Transcription finished. Starting summarization...');
        await Meeting.findByIdAndUpdate(meetingId, { 
          status: 'summarizing', 
          transcript: transcript 
        });
        
        // 4. Run Qwen summarization
        const summaryData = await generateSummary(transcript);
        
        // Format the summary nicely as Markdown so the frontend displays a premium-looking report
        let formattedSummaryMarkdown = `### Résumé Exécutif\n${summaryData.summary}\n\n`;
        
        if (summaryData.key_points && summaryData.key_points.length > 0) {
          formattedSummaryMarkdown += `### Points Clés\n`;
          summaryData.key_points.forEach(point => {
            formattedSummaryMarkdown += `- ${point}\n`;
          });
          formattedSummaryMarkdown += `\n`;
        }
        
        if (summaryData.decisions && summaryData.decisions.length > 0) {
          formattedSummaryMarkdown += `### Décisions Prises\n`;
          summaryData.decisions.forEach(decision => {
            formattedSummaryMarkdown += `- ${decision}\n`;
          });
          formattedSummaryMarkdown += `\n`;
        }
        
        if (summaryData.action_items && summaryData.action_items.length > 0) {
          formattedSummaryMarkdown += `### Actions & Prochaines Étapes\n`;
          summaryData.action_items.forEach(action => {
            formattedSummaryMarkdown += `- ${action}\n`;
          });
        }
        
        // 5. Update status to 'completed'
        console.log('[Pipeline] Summarization complete. Saving results.');
        await Meeting.findByIdAndUpdate(meetingId, {
          status: 'completed',
          summary: formattedSummaryMarkdown.trim()
        });
        
      } catch (err) {
        console.error('[Pipeline] Error in transcript post-processing / summarization:', err);
        await Meeting.findByIdAndUpdate(meetingId, { 
          status: 'failed', 
          error: `Post-processing failed: ${err.message}` 
        });
      }
    });
    
  } catch (err) {
    console.error('[Pipeline] Critical pipeline error:', err);
    // Cleanup WAV if created
    try {
      if (fs.existsSync(normalizedWavPath)) {
        fs.unlinkSync(normalizedWavPath);
      }
    } catch (_) {}
    
    await Meeting.findByIdAndUpdate(meetingId, { 
      status: 'failed', 
      error: `Pipeline failed: ${err.message}` 
    });
  }
};

module.exports = { startMeetingProcessing };
