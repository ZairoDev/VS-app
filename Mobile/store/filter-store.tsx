import { create } from "zustand";

export interface FilterStore {
  isEnabled: boolean;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  priceRange: number;
  isFilterChanged: boolean;
  modalVisible: boolean;
  allowCooking: boolean;
  allowParty: boolean;
  allowPets: boolean;

  toggleSwitch: () => void;
  handleCount: (type: 'BEDROOMS' | 'BATHROOMS' | 'BEDS', operation: 'INCREMENT' | 'DECREMENT') => void;
  handleAllowCooking: () => void;
  handleAllowParty: () => void;
  handleAllowPets: () => void;

  applyFilters: () => void;

  clearFilters: () => void;
  updatePriceRange: (value: number) => void;
  setModalVisible: (visible: boolean) => void;
}

const useStore = create<FilterStore>((set) => ({
  isEnabled: false,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  priceRange: 10,
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
    } else if (type === 'BATHROOMS') {
      newCount = Math.max(1, state.bathrooms + (operation === 'INCREMENT' ? 1 : -1));
    } else if (type === 'BEDS') {
      newCount = Math.max(1, state.beds + (operation === 'INCREMENT' ? 1 : -1));
    }
    return { [type.toLowerCase()]: newCount, isFilterChanged: true };
  }),

  handleAllowCooking: () => set((state) => ({ allowCooking: !state.allowCooking, isFilterChanged: true })),
  handleAllowParty: () => set((state) => ({ allowParty: !state.allowParty, isFilterChanged: true })),
  handleAllowPets: () => set((state) => ({ allowPets: !state.allowPets, isFilterChanged: true })),

  updatePriceRange: (value) => set(() => ({ priceRange: value, isFilterChanged: true })),

  setModalVisible: (visible: boolean) => set(() => ({ modalVisible: visible })),

  clearFilters: () => set(() => ({
    isEnabled: false,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
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