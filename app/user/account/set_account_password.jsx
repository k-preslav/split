import React, { useRef, useEffect, useState, use, useCallback } from 'react';
import { Animated, Button, Keyboard, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { styles } from '../../../components/themes/styles';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';
import { doesUserExistByEmail } from '../../../lib/getUser';

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
      <SafeAreaView style={styles.container}>
        <View style={styles.almostCenter}>
          <TextInput
            style={styles.input}
            placeholder="password"
            keyboardType='default'
            secureTextEntry={true}
            autoCapitalize='none'
            value={password}
            onChangeText={setPassword}
          />

          { isLoading && (
            <Text>{'Plase wait...'}</Text>
          )}
          { failedToLogin && (
            <View>
              <Text style={{ color: 'red' }}>{failedToLogin}</Text>
              <Button title="Back" onPress={() => {
                router.back();
              }} />
            </View>
          )}
        </View>

        <View style={{
          position: 'absolute',
          bottom: insets.bottom + 130,
        }}>
          <Button title="Next" onPress={() => {
            userDetails.password = password;
            handleSubmit();
          }} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountPassword;

export const options = {
  gestureEnabled: true,
}