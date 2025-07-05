import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Button, Keyboard, SafeAreaView, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { styles } from '../../../components/themes/styles';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';

const SetAccountEmail = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const {setGesturesEnabled} = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.almostCenter}>
          <TextInput
            style={styles.input}
            placeholder="email"
            keyboardType='email-address'
            autoCapitalize='none'
            value={email}
            onChangeText={setEmail}
          />

          <Button
            title = "Autofill"
            onPress={() => {
              setEmail(userDetails.email);
            }}
          />
        </View>

        <View style={{
          position: 'absolute',
          bottom: insets.bottom + 130,
        }}>
          <Button title="Next" onPress={() => {
            router.push('/user/account/set_account_password')
            userDetails.email = email;
          }} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountEmail;