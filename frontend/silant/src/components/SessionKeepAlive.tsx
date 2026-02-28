import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionKeepAlive = () => {
  const intervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<null | number>(null);

  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const sendKeepAlive = async () => {
      if (!isAuthenticated) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      try {
        const response = await fetch('/keep-alive', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Session updated at:', data.timestamp);
      } catch (error) {
        console.error('Keep‑alive failed:', error);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    if (isAuthenticated && !loading) {
      intervalRef.current = setInterval(sendKeepAlive, 300000);

      const handleActivity = () => {
        const now = Date.now();
        if (!lastActivityRef.current || now - lastActivityRef.current > 60000) {
          lastActivityRef.current = now;
          sendKeepAlive();
        }
      };

      const activityEvents = ['click', 'mousemove', 'keypress', 'scroll', 'wheel'];
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity);
      });

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [isAuthenticated, loading]);

  return null;
};

export default SessionKeepAlive;
