import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/60">Sign in to access your meeting summaries.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Email</label>
          <Input type="email" placeholder="you@example.com" required />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white/80">Password</label>
            <Link to="/change-password" className="text-xs text-[#00E0FF] hover:text-[#00E0FF]/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full mt-6">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#7B61FF] hover:text-[#7B61FF]/80 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
