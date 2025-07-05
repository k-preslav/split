import React, { useRef, useEffect, useState, use, useCallback } from 'react';
import { Animated, Button, Keyboard, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { styles } from '../../../components/themes/styles';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';
import { doesUserExistByEmail } from '../../../lib/getUser';
import ThemedView from '../../../components/views/themedView';
import CurvedLine from '../../../components/special/curveLine';
import FixedCenterView from '../../../components/views/fixedCenterView';
import BigText from '../../../components/common/bigText';
import FixedBottomView from '../../../components/views/fixedBottomView';
import BigButton from '../../../components/common/bigButton';
import { ArrowRight } from 'lucide-react-native';
import InputField from '../../../components/common/inputField';

const SetAccountPassword = () => {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [failedToLogin, setFailedToLogin] = useState(null);

  const { user, login, logout, setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(true);
  }, []))

  const handleSubmit = async () => {
    setLoading(true);
    setFailedToLogin(null);

    await logout();

    const exists = await doesUserExistByEmail(userDetails.email);
    console.log("User exists:", exists);

    userDetails.isNewProfile = !exists;

    if (exists) {
      await login(userDetails.email, userDetails.password).then(async (res) =>{
        if (!res.code) { // If there is no error code, the login was successful
          router.push('/user/account/get_account_code')
        }
        else {
          setPassword('');

          switch (res.code) {
            case 400:
              setFailedToLogin("Password must be at least 8 characters long.");
              break;
            case 401:
              setFailedToLogin("Incorrect email or password.");
              break;
            default:
              setFailedToLogin("An error occurred: " + res.message + " (Code: " + res.code + ")");
              break;
          }
        }
      });
    }
    else { // User does not exits
      // Check password length
      if (password.length < 8) {
        setFailedToLogin("Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }

      router.push('/user/account/set_account_name');
      return;
    }
    
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine text='Enter your pass'/>
        <CurvedLine flipY/>

        <FixedCenterView yOffset={-95}>
          <InputField keyboard='password' placeholder='•••••••••' value={password} onChangeText={setPassword}/>
        </FixedCenterView>

        <FixedBottomView>
          <BigButton
            icon={<ArrowRight strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={async () => {
              userDetails.password = password;
              await handleSubmit();
            }}
          >Next</BigButton>
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountPassword;

export const options = {
  gestureEnabled: true,
}