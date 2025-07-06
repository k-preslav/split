import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '../themes/styles';
import { Colors } from '../themes/colors';

const ThemedText = ({ children, fontWeight, fontSize, color, style, ...props }) => {
  return (
    <Text style={[{
      fontFamily: `Satoshi-${fontWeight || 'Regular'}`,
      fontSize: fontSize || 16,
      color: color || Colors.textLight,
    }, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemedText;