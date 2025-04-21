import { create } from 'zustand';

export type Traveller = {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  type: 'adult' | 'child' | 'infant';
  selected: boolean;
};

type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

type GuestStore = {
  guests: GuestCounts;
  travellers: Traveller[];

  setGuests: (guests: GuestCounts) => void;
  addTraveller: (traveller: Traveller) => void;
  updateTraveller: (id: string, updated: Partial<Traveller>) => void;
  removeTraveller: (id: string) => void;
  resetTravellers: () => void;

  getRemainingSlots: () => {
    adults: number;
    children: number;
    infants: number;
  };
};

export const useGuestStore = create<GuestStore>((set, get) => ({
  guests: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  travellers: [],

  setGuests: (guests) => {
    set({ guests });
    // Reset travellers on guest change to prevent mismatch
    set({ travellers: [] });
  },

  addTraveller: (traveller) => {
    const current = get().travellers;
    set({ travellers: [...current, traveller] });
  },

  updateTraveller: (id, updated) => {
    const updatedTravellers = get().travellers.map((traveller) =>
      traveller.id === id ? { ...traveller, ...updated } : traveller
    );
    set({ travellers: updatedTravellers });
  },

  removeTraveller: (id) => {
    set({
      travellers: get().travellers.filter((t) => t.id !== id),
    });
  },

  resetTravellers: () => {
    set({ travellers: [] });
  },

  getRemainingSlots: () => {
    const { guests, travellers } = get();

    const countByType = {
      adult: travellers.filter((t) => t.type === 'adult').length,
      child: travellers.filter((t) => t.type === 'child').length,
      infant: travellers.filter((t) => t.type === 'infant').length,
    };

    return {
      adults: guests.adults - countByType.adult,
      children: guests.children - countByType.child,
      infants: guests.infants - countByType.infant,
    };
  },
}));
