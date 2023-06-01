export const generateRandomColors = (deviceListLength) => {
  const colors = [];

  for (let i = 0; i < deviceListLength; i++) {
    // Generate a random hue value between 0 and 360
    const hue = Math.floor(Math.random() * 361);

    // Calculate the complementary hue by adding 180 and wrapping around if necessary
    const complementaryHue = (hue + 180) % 360;

    // Generate a random saturation and lightness value for the dark shade
    const saturation = Math.floor(Math.random() * 51) + 50; // Range: 50-100
    const lightness = Math.floor(Math.random() * 26) + 25; // Range: 25-50

    // Convert the HSL values to RGB values
    const color = `hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`;

    colors.push(color);
  }

  return colors;
};
