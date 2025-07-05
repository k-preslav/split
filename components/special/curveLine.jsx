import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text, TextPath, Defs } from 'react-native-svg';
import { Colors } from '../themes/colors';
import { styles } from '../themes/styles';

const CurvedLine = ({
  height = 389,
  stroke = Colors.backgroundSecondary,
  strokeWidth = 17,
  flipX = false,
  flipY = false,
  curve = 'M3 381 C197 312.5 440 229 505.5 3',
  text = '',
  textYOffset = -25,
  style = {},
}) => {
  const zoomedViewBox = {
    x: flipX ? -20 : 20,
    y: 0,
    width: 470,
    height: 340,
  };

  const translateX = flipX ? zoomedViewBox.width : 0;
  const translateY = flipY ? zoomedViewBox.height : 0;
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;

  const viewBoxWidth = zoomedViewBox.width;

  const textTransform = flipX
    ? `translate(0, ${textYOffset || 0}) rotate(55, 240, 315)`
    : `translate(0, ${textYOffset || 0})`;


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
        <Defs>
          <Path id="curvedTextPath" d={curve} />
        </Defs>

        <Path
          d={curve}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          transform={transform}
        />

        {/* Text along the curve */}
        {text ? (
          <Text
            style={styles.bigText}
            fill={Colors.textLight}
            textAnchor="middle"
            transform={textTransform}
          >
            <TextPath href="#curvedTextPath" startOffset="35%" >
              {text}
            </TextPath>
          </Text>
        ) : null}
      </Svg>
    </View>
  );
};

export default CurvedLine;