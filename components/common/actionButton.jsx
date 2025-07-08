import React from 'react';
import { ActivityIndicator, Keyboard, Pressable } from 'react-native';
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
  icon = null,
}) => {
  const [internalLoading, setInternalLoading] = React.useState(false);

  const handlePress = async () => {
    Keyboard.dismiss();

    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (loadingOnPress) {
      setInternalLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 5)); // Allow UI to update
    }

    try {
      await onPress?.();
    } finally {
      if (loadingOnPress) {
        setTimeout(() => {
          setInternalLoading(false);
        }, 350);
      }
    }
  };

  // Show loading if either prop or internal loading state is true
  const showLoading = propIsLoading || internalLoading;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.actionButton,
        {
          backgroundColor: isPrimary
            ? Colors.buttonPrimary
            : extraLightWhenSecondary
            ? Colors.buttonSecondaryLighter
            : Colors.buttonSecondary,
          borderRadius: isRound ? size / 2 : 15,
          width: size,
          height: size,
        },
        isPrimary && {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.125,
          shadowRadius: 20,
          elevation: 10,
        },
        style,
      ]}
    >
      {showLoading ? (
        <ActivityIndicator
          size="small"
          style={{
            transform: [{ scaleX: size * 0.02 }, { scaleY: size * 0.02 }],
          }}
          color={isPrimary ? Colors.textDark : Colors.textLight}
        />
      ) : (
        icon &&
        React.cloneElement(icon, {
          color: isPrimary ? Colors.textDark : Colors.textLight,
          size: size * 0.43,
        })
      )}
    </Pressable>
  );
};

export default ActionButton;
