import { View, Text } from 'react-native'
import React from 'react'
import { getStyles } from '../themes/styles';

const BigText = ({ children, style, ...props }) => {
  const styles = getStyles();

  return (
    <Text style={[styles.bigText, style]} {...props}>
      {children}
    </Text>
  );
};

export default BigText