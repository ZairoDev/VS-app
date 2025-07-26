 import {create} from 'zustand';
 
 interface Place {
    name:string;
    address:string;
 }

 interface SearchStore {
    selectedPlace : Place | null;
    setSelectedPlace: (place: Place | null) => void;
    clearSelectedPlace: () => void;
}

const useSearchStore = create<SearchStore>((set)=>({
    selectedPlace:null,
    setSelectedPlace: (place) => set({ selectedPlace: place }), 
    clearSelectedPlace: () => set({ selectedPlace: null }),
}))
 

export default useSearchStore;