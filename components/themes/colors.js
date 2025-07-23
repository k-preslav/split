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

export function setColorScheme(scheme) {
  console.log(`Setting color scheme to: ${scheme}`);

  Colors.background = scheme === 'dark' ? '#212121' : '#F1F1E8';
  Colors.backgroundSecondary = scheme === 'dark' ? '#2D2D2D' : '#FFFFFF';

  Colors.light = scheme === 'dark' ? '#F1F1E8' : '#212121';
  Colors.lightGray = scheme === 'dark' ? '#373737' : '#E0E0E0';
  Colors.lighterGray = scheme === 'dark' ? '#414141' : '#B0B0B0';

  Colors.textLight = scheme === 'dark' ? '#F1F1E8' : '#000000';
  Colors.textDark = scheme === 'dark' ? '#000000' : '#F1F1E8';
  Colors.textGray = scheme === 'dark' ? '#555555' : '#888888';

  Colors.buttonSecondary = scheme === 'dark' ? '#2D2D2D' : '#F1F1E8';
  Colors.buttonSecondaryLighter = scheme === 'dark' ? '#373737' : '#E0E0E0';
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