import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import * as Haptics from 'expo-haptics';
import { Colors } from '../themes/colors';
import { scale } from 'react-native-size-matters';

const ActionButton = ({
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
  isPrimary = true,
  extraLightWhenSecondary = false,
  isRound = true,
  size = 60,
  icon = null,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const _internalPress = async () => {
    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (loadingOnPress) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 5)); // Give time for the ui to update
    }
  };
  
  const handlePress = async () => {
    _internalPress();

    try {
      await onPress?.();
    } finally {
      if (loadingOnPress) {
        setTimeout(() => {
          setIsLoading(false);
        }, 350);
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.actionButton, 
        {backgroundColor: isPrimary ? Colors.buttonPrimary : (extraLightWhenSecondary ? Colors.buttonSecondaryLighter : Colors.buttonSecondary)},
        { borderRadius: isRound ? size / 2: 15 },
        { width: size, height: size },
        isPrimary && {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.125,
          shadowRadius: 20,

          elevation: 10,
        },
        style
      ]}
    >
        {isLoading ? (
          <ActivityIndicator 
            size="small"
            style={[styles.spinner, {
              transform: [{ scaleX: size * 0.02  }, { scaleY: size * 0.02 }],
            }]}
            color={isPrimary ? Colors.textDark : Colors.textLight}
          />        ) : (
            icon && React.cloneElement(icon, {
              color: isPrimary ? Colors.textDark : Colors.textLight,
              size: size * 0.43,
            })
        )}
    </Pressable>
  );
};

export default ActionButton;