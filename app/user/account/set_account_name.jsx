import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Button, SafeAreaView, TextInput, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { styles } from '../../../components/themes/styles';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';

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

    await register(userDetails.username, userDetails.email, userDetails.password).then(async(res) => {
      if (res.code) { // If there is an error code, the registration failed
        console.log(res.message);
      }
    });

    setLoading(false);
    router.push('/user/account/get_account_code');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.almostCenter}>
          <TextInput
            style={styles.input}
            placeholder="username"
            keyboardType='default'
            autoCapitalize='none'
            value={accountName}
            onChangeText={setAccountName}
          />

          { isLoading && (
            <Text>{'Please me...'}</Text>
          )}  
        </View>

        <View style={{
          position: 'absolute',
          bottom: insets.bottom + 130,
        }}>
          <Button title="Next" onPress={() => {
            userDetails.username = accountName;
            handleSubmit();
          }} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountName;