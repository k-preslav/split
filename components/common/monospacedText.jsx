import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '../themes/styles';
import { Colors } from '../themes/colors';

const MonospacedText = ({ children, fontSize, color, style, ...props }) => {
  return (
    <Text style={[{
      fontFamily: 'GeistMono',
      fontSize: fontSize || 16,
      color: color || Colors.textLight,
      letterSpacing: 8,
      textAlign: 'center',
    }, style]} {...props}>
      {children}
    </Text>
  );
};

export default MonospacedText;