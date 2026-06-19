import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { socket } from '../socket.js';
import { useDropStore } from '../store/useDropStore.js';

export function useSocket() {
  const updateDropStock = useDropStore((s) => s.updateDropStock);
  const updateDropPurchasers = useDropStore((s) => s.updateDropPurchasers);
  const addDrop = useDropStore((s) => s.addDrop);
  const myReservation = useDropStore((s) => s.myReservation);
  const clearMyReservation = useDropStore((s) => s.clearMyReservation);

  useEffect(() => {
    function onStockUpdated({ dropId, newStock }) {
      updateDropStock(dropId, newStock);
    }

    function onPurchaseCompleted({ dropId, purchasers }) {
      updateDropPurchasers(dropId, purchasers);
      toast.success('Purchase completed!');
    }

    function onReservationExpired({ reservationId }) {
      if (myReservation?.reservationId === reservationId) {
        clearMyReservation();
        toast('Reservation expired.', { icon: 'i' });
      }
    }

    function onDropCreated({ drop }) {
      addDrop(drop);
    }

    socket.on('stock:updated', onStockUpdated);
    socket.on('purchase:completed', onPurchaseCompleted);
    socket.on('reservation:expired', onReservationExpired);
    socket.on('drop:created', onDropCreated);

    return () => {
      socket.off('stock:updated', onStockUpdated);
      socket.off('purchase:completed', onPurchaseCompleted);
      socket.off('reservation:expired', onReservationExpired);
      socket.off('drop:created', onDropCreated);
    };
  }, [updateDropStock, updateDropPurchasers, addDrop, myReservation, clearMyReservation]);
}
