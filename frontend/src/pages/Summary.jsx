import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Share2, Play, Pause, FileText, List, Loader2, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ORIGIN, apiFetch } from '../utils/api';

export function Summary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'transcript'
  const audioRef = useRef(null);

  useEffect(() => {
    let intervalId = null;

    async function fetchMeetingDetails(showLoader = true) {
      if (showLoader) setLoading(true);
      try {
        const res = await apiFetch(`/meetings/${id}`);
        if (res.success) {
          setMeeting(res.data);
          
          const currentStatus = res.data.status;
          if (currentStatus !== 'completed' && currentStatus !== 'failed' && currentStatus !== undefined) {
            if (!intervalId) {
              intervalId = setInterval(() => {
                fetchMeetingDetails(false);
              }, 2000);
            }
          } else {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load meeting details');
      } finally {
        if (showLoader) setLoading(false);
      }
    }

    fetchMeetingDetails(true);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error('Audio playback error:', err));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [meeting]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    if (!meeting) return;
    const content = `Meetly AI Summary: ${meeting.title}\nDate: ${new Date(meeting.createdAt || meeting.date).toLocaleDateString()}\nDuration: ${meeting.duration}\n\nSummary:\n${meeting.summary}\n\nTranscript:\n${meeting.transcript}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/\s+/g, '_')}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-[#00E0FF] animate-spin" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        {error || 'Meeting not found'}
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (meeting.status === 'failed') {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 max-w-xl mx-auto mt-10 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h2 className="text-lg font-bold text-white">Processing Failed</h2>
        </div>
        <p className="text-sm text-white/70">
          The AI pipeline encountered an error while processing your meeting:
        </p>
        <div className="p-3 bg-black/30 rounded border border-white/5 font-mono text-xs overflow-x-auto text-red-300">
          {meeting.error || 'Unknown error'}
        </div>
        <div className="pt-2 flex gap-3">
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>Retry Check</Button>
        </div>
      </div>
    );
  }

  const isProcessing = meeting.status !== 'completed' && meeting.status !== undefined;

  if (isProcessing) {
    const getStatusMessage = (status) => {
      switch (status) {
        case 'pending': return 'File uploaded. Starting processing...';
        case 'diarization': return 'Detecting speakers... (Running PyAnnote Diarization)';
        case 'transcribing': return 'Transcribing audio... (Running custom Darija Whisper model)';
        case 'summarizing': return 'Generating summary... (Running Qwen LLM)';
        default: return 'Processing meeting...';
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Card className="p-8 max-w-md w-full border-[#00E0FF]/30 bg-gradient-to-b from-[#00E0FF]/5 to-transparent flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-[#00E0FF] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
            <div className="w-20 h-20 rounded-full bg-[#00E0FF]/15 flex items-center justify-center border border-[#00E0FF]/30 relative z-10">
              <Loader2 className="w-10 h-10 text-[#00E0FF] animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">AI Pipeline Active</h2>
            <p className="text-[#00E0FF] font-medium text-sm animate-pulse">{getStatusMessage(meeting.status)}</p>
          </div>
          <p className="text-white/40 text-xs px-4">
            This might take a few minutes as we run speaker diarization, transcribe segments using your custom model, and summarize dialogue.
          </p>
        </Card>
      </div>
    );
  }

  const audioUrl = meeting.audioFileUrl 
    ? `${API_ORIGIN}${meeting.audioFileUrl}`
    : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
              &larr; Back
            </Button>
            <span className="text-[#00E0FF] text-sm font-medium border border-[#00E0FF]/30 bg-[#00E0FF]/10 px-2 py-0.5 rounded">
              AI Generated
            </span>
          </div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">{meeting.title}</h1>
          <p className="text-white/60 flex items-center gap-2">
            {formatDate(meeting.createdAt || meeting.date)} &bull; {meeting.duration}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Meeting link copied to clipboard!');
          }}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Export text
          </Button>
        </div>
      </header>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-white/10 mb-4">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'summary' 
                  ? 'border-[#00E0FF] text-[#00E0FF]' 
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'transcript' 
                  ? 'border-[#00E0FF] text-[#00E0FF]' 
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Transcript
            </button>
          </div>

          {activeTab === 'summary' ? (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <List className="text-[#7B61FF] w-5 h-5" /> Executive Summary
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {meeting.summary}
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-[#00E0FF] w-5 h-5" /> Full Transcript
              </h2>
              <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
                {Array.isArray(meeting.transcript) ? (
                  <div className="space-y-4">
                    {meeting.transcript.map((seg, idx) => (
                      <div 
                        key={idx} 
                        className="flex flex-col space-y-1.5 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#00E0FF]">{seg.speaker}</span>
                          <span className="text-white/40 bg-white/5 px-2 py-0.5 rounded text-[10px] tracking-wider font-mono">
                            {seg.start} &rarr; {seg.end}
                          </span>
                        </div>
                        <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                    {meeting.transcript}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {audioUrl && (
            <Card className="p-6">
              <h3 className="font-bold text-white mb-4">Recording</h3>
              <div className="aspect-video bg-[#0B0F1A] rounded-lg flex flex-col items-center justify-center border border-white/10 relative overflow-hidden group p-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00E0FF]/10 to-[#7B61FF]/10 pointer-events-none"></div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full relative z-10 hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-white fill-current" />
                  ) : (
                    <Play className="w-7 h-7 text-white fill-current ml-1" />
                  )}
                </Button>
                
                <span className="text-xs text-white/50 mt-4 relative z-10">
                  {isPlaying ? 'Playing Meeting Audio' : 'Click to Play Recording'}
                </span>
                
                {/* Decorative audio waves */}
                {isPlaying && (
                  <div className="absolute bottom-4 left-4 right-4 h-8 flex items-end gap-1 opacity-40 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-[#00E0FF] rounded-t-sm animate-pulse" 
                        style={{ 
                          height: `${Math.max(15, Math.random() * 95)}%`,
                          animationDelay: `${i * 50}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-bold text-white mb-4">Meeting Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Duration:</span>
                <span className="text-white/80 font-medium">{meeting.duration}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Recorded:</span>
                <span className="text-white/80 font-medium">{formatDate(meeting.createdAt || meeting.date)}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/40">Audio Status:</span>
                <span className={`font-medium ${audioUrl ? 'text-[#00E0FF]' : 'text-white/40'}`}>
                  {audioUrl ? 'Available' : 'None'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
