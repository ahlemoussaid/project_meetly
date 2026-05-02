import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mic, FileText, Download, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RECENT_MEETINGS = [
  { id: 1, title: 'Product Sync: Q3 Roadmap', date: 'Today, 10:00 AM', duration: '45 min' },
  { id: 2, title: 'Design Review: Marketing Site', date: 'Yesterday, 2:30 PM', duration: '60 min' },
  { id: 3, title: 'Weekly Engineering Standup', date: 'Mon, 9:15 AM', duration: '15 min' },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-outfit font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Welcome back! Here's an overview of your recent meetings.</p>
      </header>

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
                <p className="text-3xl font-bold text-white">24</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-sm mb-1">Time Saved</p>
                <p className="text-3xl font-bold text-[#00E0FF]">12 hrs</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Meetings</h2>
          <Button variant="ghost" onClick={() => navigate('/history')}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECENT_MEETINGS.map((meeting) => (
            <Card key={meeting.id} className="p-5 hover:bg-white/[0.07] transition-colors cursor-pointer" onClick={() => navigate(`/summary/${meeting.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-[#7B61FF]/20">
                  <FileText className="text-[#7B61FF] w-5 h-5" />
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="font-bold text-white mb-2">{meeting.title}</h3>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {meeting.duration}</span>
                <span>{meeting.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
