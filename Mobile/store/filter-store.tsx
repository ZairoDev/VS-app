import { create } from "zustand";

export interface FilterStore {
  isEnabled: boolean;
  bedrooms: number;
  beds: number;
  bathroom: number;
  minPrice: number;
  maxPrice: number;
  isFilterChanged: boolean;
  modalVisible: boolean;
  allowCooking: boolean;
  allowParty: boolean;
  allowPets: boolean;

  toggleSwitch: () => void;
  handleCount: (type: 'BEDROOMS' | 'BATHROOM' | 'BEDS', operation: 'INCREMENT' | 'DECREMENT') => void;
  handleAllowCooking: () => void;
  handleAllowParty: () => void;
  handleAllowPets: () => void;

  applyFilters: () => void;

  clearFilters: () => void;
  updateMinPrice: (value: string)=> void;
  updateMaxPrice: (value: string)=> void;
  setModalVisible: (visible: boolean) => void;
}

const useStore = create<FilterStore>((set) => ({
  isEnabled: false,
  bedrooms: 0,
  beds: 0,
  bathroom: 0,
  minPrice: 10,
  maxPrice: 5000,
  isFilterChanged: false,
  modalVisible: false,
  allowCooking: false,
  allowParty: false,
  allowPets: false,


  toggleSwitch: () =>set((state) => ({ isEnabled: !state.isEnabled, isFilterChanged: true })),

  handleCount: (type, operation) => set((state) => {
    let newCount = 1;
    if (type === 'BEDROOMS') {
      newCount = Math.max(1, state.bedrooms + (operation === 'INCREMENT' ? 1 : -1));
    } else if (type === 'BATHROOM') {
      newCount = Math.max(1, state.bathroom + (operation === 'INCREMENT' ? 1 : -1));
    } else if (type === 'BEDS') {
      newCount = Math.max(1, state.beds + (operation === 'INCREMENT' ? 1 : -1));
    }
    return { [type.toLowerCase()]: newCount, isFilterChanged: true };
  }),

  handleAllowCooking: () => set((state) => ({ allowCooking: !state.allowCooking, isFilterChanged: true })),
  handleAllowParty: () => set((state) => ({ allowParty: !state.allowParty, isFilterChanged: true })),
  handleAllowPets: () => set((state) => ({ allowPets: !state.allowPets, isFilterChanged: true })),

  updateMinPrice: (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      set({ minPrice: Math.max(10, numValue) }); // Ensure minPrice is at least 10
    }
  },

  updateMaxPrice: (value: string) =>{
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      set({ maxPrice: Math.min(5000, numValue) }); // Ensure maxPrice is at most 5000
    } 
  },  

  setModalVisible: (visible: boolean) => set(() => ({ modalVisible: visible })),

  clearFilters: () => set(() => ({
    isEnabled: false,
    bedrooms: 0,
    beds: 0,
    bathroom: 0,
    priceRange: 10,
    isFilterChanged: false,
    modalVisible: false,
    allowCooking: false,
    allowParty: false,
    allowPets: false,
  })),


  applyFilters: () => set((state) => {
    return { modalVisible: false, isFilterChanged: false };
  }),
}));


export default useStore;