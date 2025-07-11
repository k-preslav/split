import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../themes/colors';
import { styles } from '../themes/styles';

const ActionButton = ({
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
  isLoading: propIsLoading = false,
  isPrimary = true,
  extraLightWhenSecondary = false,
  isRound = true,
  size = 60,
  overrideIconSize = null,
  showStroke = true,
  disablePrimaryGlow = false,
  overrideBackgroundColor = null,
  icon = null,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(iconScaleAnim, {
      toValue: 0.8,
      useNativeDriver: true,
      speed: 5,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(iconScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePress = async () => {
    Keyboard.dismiss();

    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (loadingOnPress) {
      setInternalLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    try {
      await onPress?.();
    } finally {
      if (loadingOnPress) {
        setTimeout(() => {
          setInternalLoading(false);
        }, 150);
      }
    }
  };

  const showLoading = propIsLoading || internalLoading;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.actionButton,
        {
          backgroundColor: overrideBackgroundColor ? overrideBackgroundColor : 
            isPrimary
            ? Colors.buttonPrimary
            : extraLightWhenSecondary
            ? Colors.buttonSecondaryLighter
            : Colors.buttonSecondary,
          borderRadius: isRound ? size / 2 : 15,
          width: size,
          height: size,
        },
        (isPrimary && !disablePrimaryGlow) && {
          shadowColor: overrideBackgroundColor ? overrideBackgroundColor : Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.125,
          shadowRadius: 20,
          elevation: 10,
        },
        showStroke && {
          borderWidth: 1,
          borderColor: isPrimary ? Colors.primary : extraLightWhenSecondary ? Colors.lighterGray : Colors.lightGray,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: iconScaleAnim }],
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {showLoading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? Colors.textDark : Colors.textLight}
          />
        ) : (
          icon &&
          React.cloneElement(icon, {
            color: isPrimary ? Colors.textDark : Colors.textLight,
            size: overrideIconSize ? overrideIconSize : size * 0.43,
          })
        )}
      </Animated.View>
    </Pressable>
  );
};

export default ActionButton;
