import { View, Dimensions } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FixedCenterView = ({ yOffset = 250, style, ...props }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const insets = useSafeAreaInsets();
  
  const internalOffset = insets.bottom === 0 ? 10 : 0;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: screenHeight / 2 + yOffset - internalOffset,
          left: screenWidth / 2,
          transform: [
            { translateX: -screenWidth / 2 },
            { translateY: -screenHeight / 2 },
          ],
          width: '100%',
          alignItems: 'center',
        },
        style,
      ]}
      {...props}
    />
  );
};

export default FixedCenterView;
