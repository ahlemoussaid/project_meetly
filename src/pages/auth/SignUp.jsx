import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SignUp() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/60">Start summarizing your meetings today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Full Name</label>
          <Input type="text" placeholder="John Doe" required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Email</label>
          <Input type="email" placeholder="you@example.com" required />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Password</label>
          <Input type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" className="w-full mt-6">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/signin" className="text-[#00E0FF] hover:text-[#00E0FF]/80 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
