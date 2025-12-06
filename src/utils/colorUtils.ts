
/**
 * Generates a random pastel color from a predefined palette
 */
export const generateRandomColor = () => {
  const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff", "#fffffc"];
  return colors[Math.floor(Math.random() * colors.length)];
};
