import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Share2, CheckCircle2, List, Play } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export function Summary() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Product Sync: Q3 Roadmap</h1>
          <p className="text-white/60 flex items-center gap-2">
            October 25, 2023 &bull; 45 minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <List className="text-[#7B61FF] w-5 h-5" /> Executive Summary
            </h2>
            <p className="text-white/80 leading-relaxed mb-6">
              The team aligned on the primary objectives for Q3, focusing on improving user retention and launching the new analytics dashboard. Marketing requested a 2-week lead time before the official release to prepare campaign materials. Engineering confirmed that the backend infrastructure scaling is 80% complete and will be ready by the end of the sprint.
            </p>

            <h3 className="text-lg font-bold text-white mb-3">Key Takeaways</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/80">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#00E0FF] shrink-0" />
                <span><strong>Analytics Dashboard:</strong> Development is on track. Beta release scheduled for mid-August.</span>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#00E0FF] shrink-0" />
                <span><strong>Infrastructure:</strong> Database migration requires a 2-hour maintenance window this weekend.</span>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#00E0FF] shrink-0" />
                <span><strong>Marketing:</strong> Needs all assets by August 1st for the promotional push.</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-[#7B61FF]/20 bg-gradient-to-br from-[#7B61FF]/5 to-transparent">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-[#7B61FF] w-5 h-5" /> Action Items
            </h2>
            <div className="space-y-3">
              {[
                { task: 'Schedule maintenance window and notify users', owner: 'Alex M.', status: 'Pending' },
                { task: 'Send finalized UI mockups to Marketing', owner: 'Sarah J.', status: 'In Progress' },
                { task: 'Review Q3 budget allocation for cloud services', owner: 'David K.', status: 'Pending' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-white/30" />
                    <span className="text-white/90">{item.task}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/50">{item.owner}</span>
                    <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-white mb-4">Recording</h3>
            <div className="aspect-video bg-[#0B0F1A] rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#00E0FF]/10 to-[#7B61FF]/10"></div>
               <Button variant="secondary" size="icon" className="w-12 h-12 rounded-full relative z-10 group-hover:scale-110 transition-transform">
                 <Play className="w-5 h-5 ml-1" />
               </Button>
               {/* Decorative waveform */}
               <div className="absolute bottom-4 left-4 right-4 h-8 flex items-end gap-1 opacity-30">
                 {Array.from({length: 20}).map((_, i) => (
                   <div key={i} className="flex-1 bg-white rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
                 ))}
               </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-bold text-white mb-4">Participants</h3>
            <div className="flex flex-col gap-3">
               {['Alex M.', 'Sarah J.', 'David K.', 'Emma T.'].map((name, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E0FF]/40 to-[#7B61FF]/40 flex items-center justify-center text-xs font-bold text-white">
                     {name.charAt(0)}
                   </div>
                   <span className="text-white/80 text-sm">{name}</span>
                 </div>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
