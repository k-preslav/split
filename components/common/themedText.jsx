import { View, Text, PixelRatio } from 'react-native'
import React from 'react'
import { styles } from '../themes/styles';
import { Colors } from '../themes/colors';

const ThemedText = ({ children, fontWeight, fontSize, color, style, ...props }) => {
  const fontScale = PixelRatio.getFontScale();

  return (
    <Text style={[{
      fontFamily: `Satoshi-${fontWeight || 'Regular'}`,
      fontSize: fontSize / fontScale || 16 / fontScale,
      color: color || Colors.textLight,
    }, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemedText;