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
      style={[
        styles.bigButton, 
        {backgroundColor: isPrimary ? Colors.buttonPrimary : Colors.buttonSecondary},
        style
      ]}
    >
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.spinner} />
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