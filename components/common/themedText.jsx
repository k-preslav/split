import { Text, Animated, PixelRatio } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors } from '../themes/colors';

const ThemedText = ({ children: text, fontWeight, fontSize, color, style, onPress, animate=false, ...props }) => {
  const fontScale = PixelRatio.getFontScale();
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayedText, setDisplayedText] = useState(text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }

    if (text !== displayedText) {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }).start(() => {
        setDisplayedText(text);
        // Fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [text]);

  return (
    <Animated.Text
      style={[
        {
          fontFamily: `Satoshi-${fontWeight || 'Regular'}`,
          fontSize: (fontSize || 16) / fontScale,
          color: color || Colors.textLight,
          opacity,
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {displayedText}
    </Animated.Text>
  );
};

export default ThemedText;