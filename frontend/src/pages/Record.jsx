import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/ui/Button';
import { apiFetch } from '../utils/api';

export function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);

          // 1. Upload audio
          const uploadRes = await apiFetch('/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.success) {
            // 2. Create meeting metadata
            const meetingTitle = `Meeting - ${new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`;

            const meetingRes = await apiFetch('/meetings', {
              method: 'POST',
              body: JSON.stringify({
                title: meetingTitle,
                duration: formatTime(time),
                audioFileUrl: uploadRes.data.fileUrl,
              }),
            });

            if (meetingRes.success) {
              navigate(`/summary/${meetingRes.data._id}`);
            }
          }
        } catch (err) {
          setError(err.message || 'Error processing and saving recording.');
          setIsProcessing(false);
        }
      };

      setTime(0);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions or use a different browser.');
      
      // Fallback to simulated flow if denied
      setError('Microphone denied. Running in demo mode (simulating recording)...');
      setTime(0);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Demo mode fallback
      setIsRecording(false);
      setIsProcessing(true);
      
      setTimeout(async () => {
        try {
          const meetingTitle = `Demo Meeting - ${new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`;

          const meetingRes = await apiFetch('/meetings', {
            method: 'POST',
            body: JSON.stringify({
              title: meetingTitle,
              duration: formatTime(time),
              audioFileUrl: '', // empty in demo mode
            }),
          });

          if (meetingRes.success) {
            navigate(`/summary/${meetingRes.data._id}`);
          }
        } catch (err) {
          setError(err.message || 'Error saving demo meeting.');
          setIsProcessing(false);
        }
      }, 2000);
    }
  };

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center pt-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-outfit font-bold text-white mb-4">
          {isRecording ? 'Recording in progress...' : 'Ready to record?'}
        </h1>
        <p className="text-white/60">
          Capture your meeting and let AI generate a comprehensive summary.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-2 max-w-md">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] opacity-20"></div>
          </>
        )}
        
        <button
          onClick={handleStartStop}
          disabled={isProcessing}
          className={cn(
            "relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300",
            isRecording 
              ? "bg-red-500/10 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]" 
              : "bg-[#00E0FF]/10 border-4 border-[#00E0FF] shadow-[0_0_50px_rgba(0,224,255,0.2)] hover:bg-[#00E0FF]/20 hover:shadow-[0_0_60px_rgba(0,224,255,0.4)]"
          )}
        >
          {isProcessing ? (
             <Loader2 className="w-16 h-16 text-[#00E0FF] animate-spin" />
          ) : isRecording ? (
             <Square className="w-16 h-16 text-red-500 fill-current" />
          ) : (
             <Mic className="w-16 h-16 text-[#00E0FF]" />
          )}
        </button>
      </div>

      <div className="mt-12 text-center">
        <div className="text-6xl font-outfit font-light text-white tracking-widest tabular-nums mb-8 text-glow">
          {formatTime(time)}
        </div>
        
        {isProcessing && (
          <p className="text-[#00E0FF] animate-pulse font-medium text-lg">
            Generating AI Summary...
          </p>
        )}
      </div>
    </div>
  );
}

