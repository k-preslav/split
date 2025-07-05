import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Button, SafeAreaView, TextInput, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
import BigButton from '../../../components/common/bigButton';
import { ArrowRight } from 'lucide-react-native';
import InputField from '../../../components/common/inputField';

const SetAccountName = () => {
  const insets = useSafeAreaInsets();
  const [accountName, setAccountName] = useState('');
  const { user, register, setGesturesEnabled } = useUser();

  const [isLoading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  const handleSubmit = async () => {
    setLoading(true);

    await register(userDetails.name, userDetails.email, userDetails.password).then(async(res) => {
      if (res.code) { // If there is an error code, the registration failed
        console.log(res.message);
      }
    });

    setLoading(false);
    router.push('/user/account/get_account_code');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine flipX text='Enter your name'/>
        <CurvedLine flipX flipY/>

        <FixedCenterView yOffset={-95}>
          <InputField placeholder='John' value={accountName} onChangeText={setAccountName}/>
        </FixedCenterView>

        <FixedBottomView>
          <BigButton
            icon={<ArrowRight strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={async () => {
              userDetails.name = accountName;
              await handleSubmit();
            }}
          >Next</BigButton>
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountName;