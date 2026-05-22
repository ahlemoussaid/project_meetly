import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mic, FileText, Download, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await apiFetch('/meetings');
        if (res.success) {
          setMeetings(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load meetings');
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const calculateTimeSaved = (meetingsList) => {
    let totalSeconds = 0;
    meetingsList.forEach(m => {
      if (!m.duration) return;
      const parts = m.duration.split(':');
      if (parts.length === 2) {
        totalSeconds += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        const num = parseInt(m.duration, 10);
        if (!isNaN(num)) totalSeconds += num * 60;
      }
    });
    const totalHours = ((totalSeconds * 1.5) / 3600).toFixed(1);
    return `${totalHours} hrs`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-outfit font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Welcome back, {user?.email}! Here's an overview of your recent meetings.</p>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-12 h-12 text-[#00E0FF] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#00E0FF]/10 to-transparent border-[#00E0FF]/20">
              <div className="w-16 h-16 rounded-full bg-[#00E0FF]/20 flex items-center justify-center mb-4">
                <Mic className="text-[#00E0FF] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">New Meeting</h3>
              <p className="text-white/60 text-center text-sm mb-6">Start a new recording to generate an AI summary.</p>
              <Button onClick={() => navigate('/record')} className="w-full">
                Start Recording
              </Button>
            </Card>

            <Card className="col-span-1 lg:col-span-2 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Meetings Recorded</p>
                    <p className="text-3xl font-bold text-white">{meetings.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Estimated Time Saved</p>
                    <p className="text-3xl font-bold text-[#00E0FF]">{calculateTimeSaved(meetings)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Meetings</h2>
              {meetings.length > 0 && (
                <Button variant="ghost" onClick={() => navigate('/history')}>
                  View All
                </Button>
              )}
            </div>

            {meetings.length === 0 ? (
              <Card className="p-8 text-center bg-white/5 border-white/10 text-white/50">
                No meetings recorded yet. Start recording your first meeting!
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.slice(0, 3).map((meeting) => (
                  <Card 
                    key={meeting._id} 
                    className="p-5 hover:bg-white/[0.07] transition-colors cursor-pointer" 
                    onClick={() => navigate(`/summary/${meeting._id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-[#7B61FF]/20">
                        <FileText className="text-[#7B61FF] w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-2 truncate">{meeting.title}</h3>
                    <div className="flex flex-col gap-1 text-sm text-white/50">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {meeting.duration}</span>
                      <span>{formatDate(meeting.createdAt || meeting.date)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

