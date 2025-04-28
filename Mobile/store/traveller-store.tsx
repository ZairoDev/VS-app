import { create } from 'zustand';

interface Traveller {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  type: 'adult' | 'child' | 'infant';
  selected: boolean;
}

interface TravellerState {
  travellers: Traveller[];
  setTravellers: (travellers: Traveller[]) => void;
  addTraveller: (traveller: Traveller) => void;
  toggleTravellerSelect: (id: string) => void;
  clearTravellers: () => void;
}

export const useTravellerStore = create<TravellerState>((set) => ({
  travellers: [],
  setTravellers: (travellers) => set({ travellers }),
  addTraveller: (traveller) =>
    set((state) => ({ travellers: [...state.travellers, traveller] })),
  toggleTravellerSelect: (id) =>
    set((state) => ({
      travellers: state.travellers.map((t) =>
        t.id === id ? { ...t, selected: !t.selected } : t
      ),
    })),
  clearTravellers: () => set({ travellers: [] }),
}));
