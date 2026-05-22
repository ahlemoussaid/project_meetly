import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export function History() {
  const navigate = useNavigate();
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
        setError(err.message || 'Failed to load meetings history');
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadText = (meeting) => {
    const content = `Meetly AI Summary: ${meeting.title}\nDate: ${new Date(meeting.createdAt || meeting.date).toLocaleDateString()}\nDuration: ${meeting.duration}\n\nSummary:\n${meeting.summary || 'No summary available.'}\n\nTranscript:\n${meeting.transcript || 'No transcript available.'}`;
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

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Meeting History</h1>
          <p className="text-white/60">Access all your past meeting summaries and recordings.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-12 h-12 text-[#00E0FF] animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-12 text-center bg-white/5 border-white/10 text-white/50">
          No meetings recorded yet.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="min-w-full divide-y divide-white/10">
            <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-white/60">
              <div className="col-span-5">Meeting Title</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {meetings.map((meeting) => (
                <div 
                  key={meeting._id} 
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00E0FF]/10">
                      <FileText className="text-[#00E0FF] w-4 h-4" />
                    </div>
                    <span 
                      className="font-medium text-white cursor-pointer hover:text-[#00E0FF] transition-colors truncate block"
                      onClick={() => navigate(`/summary/${meeting._id}`)}
                    >
                      {meeting.title}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-sm text-white/70">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {formatDate(meeting.createdAt || meeting.date)}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-white/70">
                    <Clock className="w-4 h-4 opacity-50" />
                    {meeting.duration}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/summary/${meeting._id}`)}>
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleDownloadText(meeting)}
                    >
                      <Download className="w-4 h-4" /> Export
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

