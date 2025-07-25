import { Alert, TouchableOpacity, View } from 'react-native';
import React, { use } from 'react';
import MonospacedText from '../common/monospacedText';
import { Colors } from '../themes/colors';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const UserCode = ({ userCode, fontSize, ...props }) => {
  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    if (userCode) {
      Clipboard.setStringAsync(userCode.trim());
    } else {
      Alert.alert('No user code provided!');
    }
  }
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={{
          width: 150,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 15,
          backgroundColor: Colors.primary,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          ...props.style,
        }}
      >
        <MonospacedText
          fontSize={fontSize}
          color={Colors.textDark}
          userCode={userCode}
        >
        </MonospacedText>

      </View>
    </TouchableOpacity>
  );
};

export default UserCode;
