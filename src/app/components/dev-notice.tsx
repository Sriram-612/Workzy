import { AlertCircle, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ENV } from '../config/env';

export function DevNotice() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the notice
    return !localStorage.getItem('devNoticeDismissed');
  });
  
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check backend connectivity
    const checkBackend = async () => {
      try {
        const baseUrl = ENV.API_URL ? ENV.API_URL.replace(/\/api\/?$/, '') : '';
        const healthUrl = baseUrl ? `${baseUrl}/health` : '/health';
        const response = await fetch(healthUrl);
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('devNoticeDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isProduction = typeof import.meta !== 'undefined' && !import.meta.env?.DEV;

  const getNoticeContent = () => {
    switch (backendStatus) {
      case 'checking':
        return {
          color: 'amber',
          icon: AlertCircle,
          message: 'Checking backend connection...'
        };
      case 'connected':
        return {
          color: 'green',
          icon: CheckCircle,
          message: 'Connected to PostgreSQL database. Full functionality enabled!'
        };
      case 'disconnected':
        return {
          color: 'amber',
          icon: AlertCircle,
          message: isProduction
            ? 'Backend API is not connected. Deploy your backend service and set VITE_API_URL in Vercel project settings.'
            : 'Backend disconnected. Run "npm run dev:backend" or "npm run dev:all" to connect to your local database.'
        };
    }
  };

  const notice = getNoticeContent();
  const isConnected = backendStatus === 'connected';

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-4">
      <Alert className={`${
        isConnected 
          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
          : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
      }`}>
        <notice.icon className={`h-4 w-4 ${
          isConnected 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-amber-600 dark:text-amber-400'
        }`} />
        <AlertDescription className={`${
          isConnected 
            ? 'text-green-800 dark:text-green-200' 
            : 'text-amber-800 dark:text-amber-200'
        } pr-8`}>
          <strong>{isConnected ? 'Database Connected:' : 'Backend Status:'}</strong> {notice.message}
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className={`absolute top-2 right-2 h-6 w-6 p-0 ${
            isConnected 
              ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
              : 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200'
          }`}
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  );
}
