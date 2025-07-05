import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../themes/colors';

const CurvedLine = ({
  height = 389,
  stroke = Colors.backgroundSecondary,
  strokeWidth = 17,
  flipX = false,
  flipY = false,
  curve = 'M3 381 C197 312.5 440 229 505.5 3',
  style = {},
}) => {
  // viewBox used for zooming and flipping
  const zoomedViewBox = {
    x: flipX ? -20 : 20,
    y: 0,
    width: 470,
    height: 340,
  };

  // calculate transforms
  const translateX = flipX ? zoomedViewBox.width : 0;
  const translateY = flipY ? zoomedViewBox.height : 0;
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;

  const transform = (flipX || flipY)
    ? `translate(${translateX}, ${translateY}) scale(${scaleX}, ${scaleY})`
    : undefined;

  const topOffset = flipY ? 285 : -105;

  return (
    <View style={[{ position: 'absolute', top: topOffset, left: 0, right: 0 }, style]}>
      <Svg
        height={height}
        width="100%"
        viewBox={`${zoomedViewBox.x} ${zoomedViewBox.y} ${zoomedViewBox.width} ${zoomedViewBox.height}`}
      >
        <Path
          d={curve}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          transform={transform}
        />
      </Svg>
    </View>
  );
};

export default CurvedLine;
