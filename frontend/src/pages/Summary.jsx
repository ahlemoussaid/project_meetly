import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Share2, Play, Pause, FileText, List, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

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
    async function fetchMeetingDetails() {
      try {
        const res = await apiFetch(`/meetings/${id}`);
        if (res.success) {
          setMeeting(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    }
    fetchMeetingDetails();
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

  const audioUrl = meeting.audioFileUrl 
    ? `http://localhost:5000${meeting.audioFileUrl}`
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
              <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {meeting.transcript}
                </p>
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

