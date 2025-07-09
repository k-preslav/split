import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Button, SafeAreaView, TextInput, Text, View, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { styles } from '../../../components/themes/styles';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';
import ThemedView from '../../../components/views/themedView';
import CurvedLine from '../../../components/special/curveLine';
import FixedCenterView from '../../../components/views/fixedCenterView';
import BigText from '../../../components/common/bigText';
import FixedBottomView from '../../../components/views/fixedBottomView';
import ThemedButton from '../../../components/common/themedButton';
import { ArrowRight } from 'lucide-react-native';
import InputField from '../../../components/common/inputField';

const SetAccountName = () => {
  const insets = useSafeAreaInsets();
  const [accountName, setAccountName] = useState('');
  const { register, setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  const handleSubmit = async () => {
    userDetails._name = accountName;
    
    await register(userDetails._name, userDetails._email, userDetails._password).then(async(res) => {
      if (res.code === 400) { // If there is an error code, the registration failed
        userDetails._name = '';
        userDetails._email = '';
        userDetails._password = '';
        
        Alert.alert("Invalid email")
        router.push('/user/account/set_account_email');
      }
      
      if (!res.code) {
        router.push('/user/account/get_account_code');
      }
      else console.error("Register error:", res, res.code);
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine text='Enter your name'/>
        <CurvedLine flipY/>

        <FixedCenterView yOffset={260}>
          <InputField autoCapitalize='words' placeholder='John' value={accountName} onChangeText={setAccountName}/>
        </FixedCenterView>

        <FixedBottomView>
          <ThemedButton
            text='Next'
            icon={<ArrowRight strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={async () => {
              await handleSubmit();
            }}
          />
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountName;