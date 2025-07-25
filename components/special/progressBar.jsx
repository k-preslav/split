import { View, Text, Animated, Easing } from 'react-native'
import React from 'react'
import { Colors } from '../themes/colors';

const ProgressBar = ({ progress = 0, style }) => {
  const animatedValue = React.useRef(new Animated.Value(progress)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.max(0, Math.min(progress, 1)),
      duration: 250,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[{ width: '100%', height: 16, position: 'relative' }, style]}>
      {/* Glow/shadow layer */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: widthInterpolate,
          height: '100%',
          backgroundColor: Colors.primary,
          borderRadius: 99,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.225,
          shadowRadius: 15,
          zIndex: 0,
        }}
      />

      {/* Progress bar fill (clipped) */}
      <View style={{
        width: '100%',
        height: 16,
        backgroundColor: Colors.lightGray,
        borderRadius: 99,
        overflow: 'hidden',
        borderColor: Colors.lighterGray,
        borderWidth: 1,
        zIndex: 1,
      }}>
        <Animated.View
          style={{
            width: widthInterpolate,
            height: '100%',
            backgroundColor: Colors.primary,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
}

export default ProgressBar