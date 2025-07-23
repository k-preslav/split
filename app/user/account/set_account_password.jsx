import React, { useRef, useEffect, useState, use, useCallback } from 'react';
import { Alert, Animated, Button, Keyboard, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
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
import ThemedButton from '../../../components/common/themedButton';
import { ArrowLeft, ArrowRight, StepBack } from 'lucide-react-native';
import InputField from '../../../components/common/inputField';
import HorizontalView from '../../../components/views/horizontalView';
import ActionButton from '../../../components/common/actionButton';
import { updateUserShouldBeLoggedOut } from '../../../lib/updateUser';
import ThemedText from '../../../components/common/themedText';
import { Colors } from '../../../components/themes/colors';
import { sendChangePassword } from '../../../lib/appwrite';

const SetAccountPassword = () => {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [invalidCred, setInvalidCred] = useState(false);

  const { user, login, logout, setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(true);
  }, []))

  const handleSubmit = async () => {
    setLoading(true);

    await logout();

    const exists = await doesUserExistByEmail(userDetails._email);
    console.log("User exists:", exists);

    userDetails._isNewProfile = !exists;

    if (exists) {
      await login(userDetails._email, userDetails._password).then(async (res) =>{
        if (!res.code) { // If there is no error code, the login was successful
          updateUserShouldBeLoggedOut(false);
          router.push('/user/account/get_account_code')
        }
        else {
          setPassword('');
          
          switch (res.code) {
            case 400:
              Alert.alert("Invalid password", "Password must be at least 8 characters long.");
              break;
            case 401:
              Alert.alert("Invalid credentials", "Incorrect email or password.");
              setInvalidCred(true);
              break;
            default:
              Alert.alert("Error",  res.message);
              console.log("Login error occurred: " + res.message + " (Code: " + res.code + ")");
              break;
          }
        }
      });
    }
    else { // User does not exits
      // Check password length
      if (password.length < 8) {
        Alert.alert("Invalid password", "Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }

      if (userDetails._email.length < 1) {
        Alert.alert("Invalid email", "Email can not be empty.");
        setInvalidCred(true);
        setLoading(false);
        return;
      }

      router.push('/user/account/set_account_profilePic');
      return;
    }
    
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine text='Enter your pass'/>
        <CurvedLine flipY/>

        <FixedCenterView yOffset={260}>
          <InputField keyboard='password' placeholder='•••••••••' value={password} onChangeText={setPassword}/>
          <ThemedText
            fontSize={14}
            color={Colors.textGray}
            style={{
              textDecorationLine: 'underline',
              marginTop: 10,
            }}
            onPress={() => {
              Alert.alert(
                "Forgot Password?",
                "If you forgot your password, you can reset it from your email",
                [
                  {
                    text: "Send reset email",
                    style: "default",
                    onPress: async () => {
                      await sendChangePassword(userDetails._email);
                      Alert.alert("Password change email sent", "Please check your inbox and follow the instructions to change your password.");
                    }
                  },
                  {
                    text: "No",
                  }
                ]
              )
            }}
          >Forgot password?</ThemedText>
        </FixedCenterView>

        <FixedBottomView>
          <HorizontalView style={{gap: 10, width: '85%', paddingRight: 20,}}>
            <ActionButton 
              size={65}
              icon={<StepBack strokeWidth={2.5} />}
              isPrimary={invalidCred}
              onPress={() => {
                router.back();
            }}/>            
            <ThemedButton
              text='Next'
              icon={<ArrowRight strokeWidth={2.5} />}
              loadingOnPress={true}
              onPress={async () => {
                userDetails._password = password;
                userDetails._isAfterPasswordChange = false;
                await handleSubmit();
              }}
            />
          </HorizontalView>
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountPassword;

export const options = {
  gestureEnabled: true,
}