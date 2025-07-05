import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const PrimaryButton = ({
  children,
  onPress,
  style,
  enableHaptic = true,
  loadingOnPress = false,
  icon = null, 
}) => {

  const scale = useSharedValue(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 1 }); // shrink a bit
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1); // bounce back
  };
  
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.buttonContainer}
    >
      <Animated.View style={[styles.primaryButton, animatedStyle, style]}>
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.spinner} />
        ) : (
          <>
            <Text style={styles.buttonTextPrimary}>{children}</Text>
            {icon && <>{icon}</>}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default PrimaryButton;