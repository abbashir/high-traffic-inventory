import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { useDropStore } from '../store/useDropStore.js';
import StockBadge from './StockBadge.jsx';
import ReserveButton from './ReserveButton.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import ActivityFeed from './ActivityFeed.jsx';

export default function DropCard({ drop, userId }) {
  const myReservation = useDropStore((s) => s.myReservation);
  const clearMyReservation = useDropStore((s) => s.clearMyReservation);
  const [purchasing, setPurchasing] = useState(false);

  const isMine = myReservation?.dropId === drop.id;

  async function handlePurchase() {
    setPurchasing(true);
    try {
      await api.post(`/api/reservations/${myReservation.reservationId}/purchase`, { userId });
      clearMyReservation();
      toast.success('Purchase complete!');
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong';
      toast.error(message);
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3">
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {drop.imageUrl ? (
          <img src={drop.imageUrl} alt={drop.name} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg">{drop.name}</h3>
        <span className="font-bold">${Number(drop.price).toFixed(2)}</span>
      </div>

      <StockBadge stock={drop.stock} totalStock={drop.totalStock} />

      {isMine ? (
        <div className="flex items-center justify-between gap-3 border border-black rounded-lg p-2">
          <CountdownTimer expiresAt={myReservation.expiresAt} />
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="flex-1 py-2 rounded-lg font-semibold text-white bg-green-600 disabled:bg-gray-300 transition-colors"
          >
            {purchasing ? 'Completing...' : 'Complete Purchase'}
          </button>
        </div>
      ) : (
        <ReserveButton dropId={drop.id} userId={userId} stock={drop.stock} />
      )}

      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Recent purchases</h4>
        <ActivityFeed purchasers={drop.purchasers} />
      </div>
    </div>
  );
}
