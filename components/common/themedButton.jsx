import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  PixelRatio,
  Keyboard,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { getStyles } from '../themes/styles';
import { Colors } from '../themes/colors';
import ThemedText from './themedText';

const ThemedButton = ({
  text = 'Themed button',
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
  isPrimary = true,
  icon = null,
  isRound = true,
  sizeX = null,
  sizeY = null,
  fontSize = 21,
  fontWeight = 'Bold',
  extraLightWhenSecondary = false,
  showStroke = true,
  disablePrimaryGlow = false,
  overrideIconSize = null,
  isDisabled = false,
  animateText = false,
  animateBackground = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fontScale = PixelRatio.getFontScale();
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Add background animation values
  const backgroundAnim = useRef(new Animated.Value(isPrimary ? 1 : 0)).current;
  
  // Update animation when isPrimary changes
  useEffect(() => {
    if (!animateBackground) {
      backgroundAnim.setValue(isPrimary ? 1 : 0);
      return;
    }

    // Animate the background change
    Animated.timing(backgroundAnim, {
      toValue: isPrimary ? 1 : 0,
      duration: 135,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isPrimary, extraLightWhenSecondary]);

  // Create animated shadow opacity for glow effect
  const shadowOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.125]
  });

  const styles = getStyles();

  const handlePressIn = () => {
    if (isDisabled) return;

    Animated.spring(iconScaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 15,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;

    Animated.spring(iconScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const _internalPress = async () => {
    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Keyboard.dismiss();

    if (loadingOnPress) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  };

  const handlePress = async () => {
    if (isDisabled || isLoading) return;

    await _internalPress();

    try {
      await onPress?.();
    } finally {
      if (loadingOnPress) {
        setTimeout(() => {
          setIsLoading(false);
        }, 150);
      }
    }
  };

  // Create interpolated background and border colors
  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      extraLightWhenSecondary ? Colors.buttonSecondaryLighter : Colors.buttonSecondary,
      Colors.buttonPrimary
    ]
  });
  
  const borderColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      extraLightWhenSecondary ? Colors.lighterGray : Colors.lightGray,
      Colors.primary
    ]
  });
  
  const textColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textLight, "#000000"]
  });

  return (
    <Animated.View style={[
      styles.themedButton,
      {
        backgroundColor: backgroundColor,
      },
      sizeX && sizeY && { width: sizeX, height: sizeY },
      {
        minWidth: 80, // Ensures a minimum width
        minHeight: 40, // Ensures a minimum height
        paddingHorizontal: 10, // Adds horizontal padding
        paddingVertical: 5, // Adds vertical padding
      },
      { borderRadius: isRound ? (sizeX ? sizeX / 2 : 30) : 15 },
      // Animated glow effect
      !disablePrimaryGlow && {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: shadowOpacity, // Use the animated value
        shadowRadius: 20,
      },
      showStroke && {
        borderWidth: 1,
        borderColor: borderColor,
      },
      style,
    ]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        {isLoading ? (
          <Animated.View
            style={[{
              transform: [{ scale: iconScaleAnim }],
              justifyContent: 'center',
              alignItems: 'center',
            }]}
          >
            <ActivityIndicator
              size="small"
              color={isPrimary ? "#000000" : Colors.textLight}
              style={{
                transform: [
                  { scaleX: sizeY ? sizeY * 0.025 : 1.5 },
                  { scaleY: sizeY ? sizeY * 0.025 : 1.5 },
                ],
              }}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              transform: [{ scale: iconScaleAnim }],
            }}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: !isDisabled ? textColor : Colors.textGray,
                  fontSize: Math.min(fontSize / fontScale, sizeY ? sizeY * 0.4 : fontSize), // Adjust font size dynamically
                  fontFamily: `Satoshi-${fontWeight}`,
                },
              ]}
              numberOfLines={1} // Prevents text wrapping
              ellipsizeMode="tail" // Adds ellipsis if text overflows
              animate={animateText}
            >
              {text}
            </ThemedText>
            {icon &&
              React.cloneElement(icon, {
                color: isPrimary ? "#000000": Colors.textLight,
                size: overrideIconSize ? overrideIconSize : sizeY ? sizeY * 0.43 : undefined,
              })}
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default ThemedButton;
