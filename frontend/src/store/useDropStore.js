import { create } from 'zustand';

export const useDropStore = create((set) => ({
  drops: [],
  myReservation: null,

  setDrops: (drops) => set({ drops }),

  updateDropStock: (dropId, newStock) =>
    set((state) => ({
      drops: state.drops.map((d) => (d.id === dropId ? { ...d, stock: newStock } : d)),
    })),

  updateDropPurchasers: (dropId, purchasers) =>
    set((state) => ({
      drops: state.drops.map((d) => (d.id === dropId ? { ...d, purchasers } : d)),
    })),

  addDrop: (drop) => set((state) => ({ drops: [...state.drops, drop] })),

  setMyReservation: (reservation) => set({ myReservation: reservation }),

  clearMyReservation: () => set({ myReservation: null }),
}));
