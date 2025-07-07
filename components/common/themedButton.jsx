import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Pressable } from 'react-native';
import { styles } from '../themes/styles';
import * as Haptics from 'expo-haptics';
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
        }, 150);
      }
    }
  };

  return (    
    <Pressable
      onPress={handlePress}
      style={[
        styles.themedButton,
        { backgroundColor: isPrimary ? Colors.buttonPrimary : Colors.buttonSecondary },
        (sizeX && sizeY) && { width: sizeX, height: sizeY },
        { borderRadius: isRound ? (sizeX ? sizeX / 2 : 30) : 15 },
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text 
            style={[styles.buttonText, 
            { 
              color: isPrimary ? Colors.textDark : Colors.textLight ,
              fontSize: fontSize,
              fontFamily: `Satoshi-${fontWeight}`,
            }]}>
            {text}
          </Text>
          {icon &&
            React.cloneElement(icon, {
              color: isPrimary ? Colors.textDark : Colors.textLight,
              size: sizeX ? sizeX * 0.43 : undefined,
            })}
        </View>
      )}
    </Pressable>

  );
};

export default ThemedButton;