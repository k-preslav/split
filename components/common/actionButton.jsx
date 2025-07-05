import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import * as Haptics from 'expo-haptics';

const ActionButton = ({
  children,
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
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
      style={styles.primaryButton}
    >
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.spinner} />
        ) : (
          <>
            <Text style={styles.buttonTextPrimary}>{children}</Text>
            {icon && <>{icon}</>}
          </>
        )}
    </Pressable>
  );
};

export default ActionButton;