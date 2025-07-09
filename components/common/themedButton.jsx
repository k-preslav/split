import React, { useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  PixelRatio,
  Keyboard,
  Pressable,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { styles } from '../themes/styles';
import { Colors } from '../themes/colors';

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
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fontScale = PixelRatio.getFontScale();
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(iconScaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 15,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.themedButton,
        {
          backgroundColor: isPrimary
            ? Colors.buttonPrimary
            : extraLightWhenSecondary
            ? Colors.buttonSecondaryLighter
            : Colors.buttonSecondary,
        },
        sizeX && sizeY && { width: sizeX, height: sizeY },
        { borderRadius: isRound ? (sizeX ? sizeX / 2 : 30) : 15 },
        (isPrimary && !disablePrimaryGlow) && {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.125,
          shadowRadius: 20,
          elevation: 10,
        },
        showStroke && {
          borderWidth: 1,
          borderColor: isPrimary
            ? Colors.primary
            : extraLightWhenSecondary
            ? Colors.lighterGray
            : Colors.lightGray,
        },
        style,
      ]}
    >
      {isLoading ? (
        <Animated.View
          style={[{
            transform: [{ scale: iconScaleAnim }],
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }]}
        >
          <ActivityIndicator
            size="small"
            color={isPrimary ? Colors.textDark : Colors.textLight}
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
          <Text
            style={[
              styles.buttonText,
              {
                color: isPrimary ? Colors.textDark : Colors.textLight,
                fontSize: fontSize / fontScale,
                fontFamily: `Satoshi-${fontWeight}`,
              },
            ]}
          >
            {text}
          </Text>
          {icon &&
            React.cloneElement(icon, {
              color: isPrimary ? Colors.textDark : Colors.textLight,
              size: sizeY ? sizeY * 0.43 : undefined,
            })}
        </Animated.View>
      )}
    </Pressable>
  );
};

export default ThemedButton;
