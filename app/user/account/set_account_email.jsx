import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Button, Keyboard, SafeAreaView, TextInput, TouchableWithoutFeedback, View } from 'react-native';
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

const SetAccountEmail = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const {setGesturesEnabled} = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine flipX text='Enter your email'/>
        <CurvedLine flipY flipX/>

        <FixedCenterView yOffset={260}>
          <InputField keyboard='email' placeholder='cutipie@gonners.com' value={email} onChangeText={setEmail}/>
        </FixedCenterView>

        <FixedBottomView>          
          <ThemedButton
            text='Next'
            icon={<ArrowRight strokeWidth={2.5} />}
            onPress={() => {
              userDetails._email = email;
              router.push('/user/account/set_account_password');
            }}
          />
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountEmail;