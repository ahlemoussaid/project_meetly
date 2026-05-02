import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Calendar, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MEETINGS_HISTORY = [
  { id: 1, title: 'Product Sync: Q3 Roadmap', date: '2023-10-25', time: '10:00 AM', duration: '45 min' },
  { id: 2, title: 'Design Review: Marketing Site', date: '2023-10-24', time: '02:30 PM', duration: '60 min' },
  { id: 3, title: 'Weekly Engineering Standup', date: '2023-10-23', time: '09:15 AM', duration: '15 min' },
  { id: 4, title: 'Client Onboarding: TechCorp', date: '2023-10-20', time: '11:00 AM', duration: '30 min' },
  { id: 5, title: 'Sprint Planning', date: '2023-10-18', time: '01:00 PM', duration: '90 min' },
];

export function History() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Meeting History</h1>
          <p className="text-white/60">Access all your past meeting summaries and recordings.</p>
        </div>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="min-w-full divide-y divide-white/10">
          <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-white/60">
            <div className="col-span-5">Meeting Title</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {MEETINGS_HISTORY.map((meeting) => (
              <div 
                key={meeting.id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00E0FF]/10">
                    <FileText className="text-[#00E0FF] w-4 h-4" />
                  </div>
                  <span 
                    className="font-medium text-white cursor-pointer hover:text-[#00E0FF] transition-colors"
                    onClick={() => navigate(`/summary/${meeting.id}`)}
                  >
                    {meeting.title}
                  </span>
                </div>
                <div className="col-span-3 flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="w-4 h-4 opacity-50" />
                  {meeting.date}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm text-white/70">
                  <Clock className="w-4 h-4 opacity-50" />
                  {meeting.duration}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/summary/${meeting.id}`)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
