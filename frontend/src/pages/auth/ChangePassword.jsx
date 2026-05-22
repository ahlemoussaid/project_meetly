import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err.message || 'Error updating password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto mt-10">
      <div className="mb-8">
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">Change Password</h2>
        <p className="text-white/60">Enter your details below to update your password.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Current Password</label>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">New Password</label>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required 
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Confirm New Password</label>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </Card>
  );
}

