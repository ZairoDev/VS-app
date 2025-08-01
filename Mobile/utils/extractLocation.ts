// utils/locationParser.ts
export const extractLocationParts = (address: string) => {
  const parts = address.split(',').map(p => p.trim());
  const len = parts.length;
  
  return {
    city: len >= 3 ? parts[len - 3] : '',
    state: len >= 2 ? parts[len - 2] : '',
    country: len >= 1 ? parts[len - 1] : '',
  };
};
