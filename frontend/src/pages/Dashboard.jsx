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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', file.name.split('.').slice(0, -1).join('.') || 'Uploaded Meeting');
    formData.append('duration', 'Uploaded Audio');

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          navigate(`/summary/${response.data._id}`);
        } else {
          setUploadError(response.message || 'Failed to upload audio file.');
        }
      } catch (err) {
        setUploadError('Failed to parse server response.');
      }
    });

    xhr.addEventListener('error', () => {
      setUploading(false);
      setUploadError('Network error during upload.');
    });

    xhr.open('POST', 'http://localhost:5000/api/meetings/process-meeting');
    
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  };

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
            <Card className="flex flex-col p-6 bg-gradient-to-br from-[#00E0FF]/10 to-transparent border-[#00E0FF]/20 justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#00E0FF]/20 flex items-center justify-center mb-3">
                  <Mic className="text-[#00E0FF] w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">New Meeting</h3>
                <p className="text-white/60 text-sm mb-4">Record live audio or upload a pre-recorded file.</p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => navigate('/record')} className="w-full gap-2 justify-center">
                  Start Live Recording
                </Button>
                
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-xs text-white/30 uppercase">Or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {uploading ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Uploading meeting...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#00E0FF] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="audio-upload"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="secondary" 
                      className="w-full gap-2 justify-center"
                      onClick={() => document.getElementById('audio-upload').click()}
                    >
                      <Download className="w-4 h-4 rotate-180" /> Upload Audio File
                    </Button>
                  </div>
                )}
                
                {uploadError && (
                  <p className="text-red-400 text-xs mt-1 text-center">{uploadError}</p>
                )}
              </div>
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

