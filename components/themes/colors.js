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

export let colorScheme;

export function setColorScheme(scheme) {
  console.log(`Setting color scheme to: ${scheme}`);
  colorScheme = scheme;

  Colors.background = scheme === 'dark' ? '#212121' : '#D8D6D6';
  Colors.backgroundSecondary = scheme === 'dark' ? '#2D2D2D' : '#E5E5E5';

  Colors.light = scheme === 'dark' ? '#F1F1E8' : '#212121';
  Colors.lightGray = scheme === 'dark' ? '#373737' : '#E9E9E9';
  Colors.lighterGray = scheme === 'dark' ? '#414141' : '#F1F1F1';

  Colors.textLight = scheme === 'dark' ? '#F1F1E8' : '#000000';
  Colors.textDark = scheme === 'dark' ? '#000000' : '#E5E5E5';
  Colors.textGray = scheme === 'dark' ? '#797979' : '#AEAEAE';

  Colors.buttonSecondary = scheme === 'dark' ? '#2D2D2D' : '#E5E5E5';
  Colors.buttonSecondaryLighter = scheme === 'dark' ? '#373737' : '#F3F3F3';
}

export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') {
    console.warn('Invalid hex input');
    return `rgba(0,0,0,${alpha})`;
  }

  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }

  const result = hex.match(/.{2}/g);

  if (!result || result.length < 3) {
    console.warn('Failed to parse hex');
    return `rgba(0,0,0,${alpha})`;
  }

  const [r, g, b] = result.map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const getGradientColors = () => [
  hexToRgba(Colors.background, 0),      
  hexToRgba(Colors.background, 0.7),    
  Colors.background  
];

export const getGradientColorsSecondary = () => [
  hexToRgba(Colors.backgroundSecondary, 0),
  hexToRgba(Colors.backgroundSecondary, 0.7),
  Colors.backgroundSecondary
];


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