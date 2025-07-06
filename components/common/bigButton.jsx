import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import * as Haptics from 'expo-haptics';
import { Colors } from '../themes/colors';

const BigButton = ({
  children,
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
  isPrimary = true,
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
    await _internalPress();

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
        styles.bigButton, 
        {backgroundColor: isPrimary ? Colors.buttonPrimary : Colors.buttonSecondary},
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
            style={styles.spinner}
            color={isPrimary ? Colors.textDark : Colors.textLight}
          />
        ) : (
          <>
            <Text style={[styles.buttonText, {color: isPrimary ? Colors.textDark : Colors.textLight}]}>{children}</Text>
            {icon && <>{React.cloneElement(icon, {
              color: isPrimary ? Colors.textDark : Colors.textLight,
            })}</>}
          </>
        )}
    </Pressable>
  );
};

export default BigButton;