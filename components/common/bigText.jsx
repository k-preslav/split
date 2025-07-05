import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '../themes/styles';

const BigText = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.bigText, style]} {...props}>
      {children}
    </Text>
  );
};

export default BigText