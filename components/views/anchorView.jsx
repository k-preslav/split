// AnchorView.js
import { View } from 'react-native';
import React from 'react';

const AnchorView = ({ children, style }) => {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

export default AnchorView;
