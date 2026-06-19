import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDropStore } from '../store/useDropStore.js';

export default function CountdownTimer({ expiresAt }) {
  const clearMyReservation = useDropStore((s) => s.clearMyReservation);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        clearMyReservation();
        toast('Reservation expired.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, clearMyReservation]);

  return (
    <span className={`font-mono font-bold ${secondsLeft < 10 ? 'text-red-600' : 'text-gray-700'}`}>
      {secondsLeft}s
    </span>
  );
}
