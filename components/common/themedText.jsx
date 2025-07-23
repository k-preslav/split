import { View, Text, PixelRatio } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors';

const ThemedText = ({ children, fontWeight, fontSize, color, style, onPress, ...props }) => {
  const fontScale = PixelRatio.getFontScale();

  return (
    <Text 
      style={[{
        fontFamily: `Satoshi-${fontWeight || 'Regular'}`,
        fontSize: (fontSize || 16) / fontScale,
        color: color || Colors.textLight,
      }, style]} 
      onPress={onPress}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;