import { View } from 'react-native';
import React from 'react';
import { Colors } from '../themes/colors';

const Separator = ({ style }) => {
  return (
    <View
      style={[
        {
          height: 1.65,
          width: '98%',
          backgroundColor: Colors.lightGray,
          opacity: 1,
          marginVertical: 8,
        },
        style,
      ]}
    />
  );
};

export default Separator;
