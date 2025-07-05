import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import * as Haptics from 'expo-haptics';

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
  
  const _internalPress = () => {
    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (loadingOnPress) {
      setIsLoading(true);
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
      style={isPrimary ? styles.primaryButton : styles.secondaryButton}
    >
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.spinner} />
        ) : (
          <>
            <Text style={isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary}>{children}</Text>
            {icon && <>{React.cloneElement(icon, {
              color: isPrimary ? 'black' : 'white',
            })}</>}
          </>
        )}
    </Pressable>
  );
};

export default BigButton;