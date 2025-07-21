// import { create } from 'zustand';

// interface Traveller {
//   id: string;
//   name: string;
//   age: string;
//   gender: string;
//   nationality: string;
//   type: 'adult' | 'child' | 'infant';
//   selected: boolean;
// }

// interface TravellerState {
//   travellers: Traveller[];
//   setTravellers: (travellers: Traveller[]) => void;
//   addTraveller: (traveller: Traveller) => void;
//   toggleTravellerSelect: (id: string) => void;
//   clearTravellers: () => void;
// }

// export const useTravellerStore = create<TravellerState>((set) => ({
//   travellers: [],
//   setTravellers: (travellers) => set({ travellers }),
//   addTraveller: (traveller) =>
//     set((state) => ({ travellers: [...state.travellers, traveller] })),
//   toggleTravellerSelect: (id) =>
//     set((state) => ({
//       travellers: state.travellers.map((t) =>
//         t.id === id ? { ...t, selected: !t.selected } : t
//       ),
//     })),
//   clearTravellers: () => set({ travellers: [] }),
// }));

// stores/travellerStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Traveller {
  id: string;
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  type: 'adult' | 'child' | 'infant';
}

interface TravellerState {
  travellers: Traveller[];
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  bookingId: string;
  setLimits: (adults: number, children: number, infants: number, bookingId: string) => void;
  addTraveller: (traveller: Omit<Traveller, 'id'>) => void;
  removeTraveller: (id: string) => void;
  clearTravellers: () => void;
}

export const useTravellerStore = create<TravellerState>()(
  persist(
    (set) => ({
      travellers: [],
      maxAdults: 1,
      maxChildren: 0,
      maxInfants: 0,
      bookingId: '',

      setLimits: (adults, children, infants, bookingId) =>
        set({
          maxAdults: Math.max(0, adults),
          maxChildren: Math.max(0, children),
          maxInfants: Math.max(0, infants),
          bookingId,
        }),

      addTraveller: (traveller) =>
        set((state) => ({
          travellers: [...state.travellers, { ...traveller, id: Date.now().toString() }],
        })),

      removeTraveller: (id) =>
        set((state) => ({
          travellers: state.travellers.filter((t) => t.id !== id),
        })),

      clearTravellers: () =>
        set({
          travellers: [],
          maxAdults: 1,
          maxChildren: 0,
          maxInfants: 0,
          bookingId: '',
        }),
    }),
    {
      name: 'traveller-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
