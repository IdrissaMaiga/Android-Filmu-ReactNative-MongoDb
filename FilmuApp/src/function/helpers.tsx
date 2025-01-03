export const minutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

export const ratingToPercentage = (rating: number): string => {
  return (rating * 10).toFixed(0);
};


export const resolveRatingColor = (rating: number): string => {
  if (rating >= 9) {
    return "hsl(120, 50%, 45%)"; // Deep green
  } else if (rating >= 8) {
    return "hsl(120, 44%, 60%)"; // Medium green
  } else if (rating >= 7) {
    return "hsl(120, 40%, 75%)"; // Light green
  } else if (rating >= 6) {
    return "hsl(60, 50%, 70%)"; // Yellow-green
  } else if (rating >= 5) {
    return "hsl(38, 50%, 65%)"; // Light orange
  } else if (rating >= 4) {
    return "hsl(20, 60%, 55%)"; // Deep orange
  } else if (rating >= 3) {
    return "hsl(0, 60%, 55%)"; // Light red
  } else {
    return "hsl(0, 50%, 45%)"; // Deep red
  }
};

