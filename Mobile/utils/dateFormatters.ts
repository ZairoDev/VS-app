// utils/dateFormatters.ts

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

export const formatFullDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};
