import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ChangePassword() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/signin');
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">Reset Password</h2>
        <p className="text-white/60">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Email (Optional)</label>
          <Input type="email" placeholder="you@example.com" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">New Password</label>
          <Input type="password" placeholder="••••••••" required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Confirm Password</label>
          <Input type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full mt-6">
          Update Password
        </Button>
      </form>
    </Card>
  );
}
