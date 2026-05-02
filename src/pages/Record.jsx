import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/ui/Button';

export function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartStop = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/summary/new');
      }, 2000);
    } else {
      setTime(0);
      setIsRecording(true);
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

      <div className="relative">
        {/* Animated rings for recording state */}
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
