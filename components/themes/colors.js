export const Colors = {
  background: '#212121',
  backgroundSecondary: '#2D2D2D',

  primary: "#EBFF57",
  light: "#F1F1E8",
  lightGray: "#373737",
  lighterGray: "#414141",
  
  textLight: '#F1F1E8',
  textDark: '#000000',
  textGray:"#555555",

  buttonPrimary: '#EBFF57',
  buttonSecondary: '#2D2D2D',
  buttonSecondaryLighter: '#373737',

  red: '#c92222',
  
}

export const getRandomColor = () => {
  const getComponent = () => Math.floor(Math.random() * 156) + 100; // 100–255
  const r = getComponent();
  const g = getComponent();
  const b = getComponent();
  return `#${[r, g, b]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
};