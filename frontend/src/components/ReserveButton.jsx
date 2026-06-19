import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { useDropStore } from '../store/useDropStore.js';

export default function ReserveButton({ dropId, userId, stock }) {
  const [status, setStatus] = useState('idle');
  const setMyReservation = useDropStore((s) => s.setMyReservation);

  const disabled = stock <= 0 || status === 'loading';

  async function handleReserve() {
    setStatus('loading');
    try {
      const { data } = await api.post('/api/reservations', { userId, dropId });
      setMyReservation({
        reservationId: data.reservation.id,
        dropId,
        expiresAt: data.reservation.expiresAt,
      });
      setStatus('reserved');
      toast.success('Reserved! Complete checkout within 60 seconds.');
    } catch (err) {
      setStatus('idle');
      const message = err.response?.data?.error || 'Something went wrong';
      toast.error(message);
    }
  }

  return (
    <button
      onClick={handleReserve}
      disabled={disabled}
      className="w-full py-2 rounded-lg font-semibold text-white bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {status === 'loading' && (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {stock <= 0 ? 'Out of Stock' : status === 'loading' ? 'Reserving...' : 'Reserve'}
    </button>
  );
}
