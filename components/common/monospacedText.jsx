import { View, TouchableOpacity, PixelRatio } from 'react-native';
import React from 'react';
import { Colors } from '../themes/colors';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Text } from 'react-native';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';

const MonospacedText = ({ userCode = '', fontSize=16, ...props }) => {
  const fontScale = PixelRatio.getFontScale();

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (userCode) {
      Clipboard.setStringAsync(userCode.trim());
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.primary,
          borderRadius: 12,
          padding: 6,
          alignSelf: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 25,
          ...props.style,
        }}
      >
        {userCode.trim().split('').map((char, idx) => (
          <Text
            key={idx}
            style={{
              fontFamily: 'GeistMono',
              fontSize: fontSize / fontScale,
              color: "#000000",
              width: moderateScale(18),
              textAlign: 'center',
              transform: [{ translateY: moderateVerticalScale(-2) }],
            }}
          >
            {char}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default MonospacedText;