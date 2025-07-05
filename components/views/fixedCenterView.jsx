import { View } from 'react-native';
import React from 'react';

const FixedCenterView = ({ yOffset = 0, style, ...props }) => {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  return (
    <View
      onLayout={({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        setOffset({ x: width / 2, y: height / 2 });
      }}
      style={[
        {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -offset.x },
            { translateY: -offset.y + yOffset },
          ],
        },
        style, // allow additional styles to be passed
      ]}
      {...props}
    />
  );
};

export default FixedCenterView;
