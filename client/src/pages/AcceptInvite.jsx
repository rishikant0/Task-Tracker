import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acceptInvitation } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore  from '../store/useAuthStore';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const processInvite = async () => {
      if (!user) {
        // Redirect to login but store the invite link maybe, or just redirect
        toast.error('Please login to accept the invitation');
        navigate('/login', { state: { returnTo: `/invite/${token}` } });
        return;
      }

      try {
        await acceptInvitation(token);
        setSuccess(true);
        toast.success('Successfully joined the team!');
        setTimeout(() => {
          navigate('/team');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to accept invitation');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token, navigate, user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Processing Invitation...</h2>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-danger mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invitation Failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-success mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Success!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">You have joined the team.</p>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AcceptInvite;
