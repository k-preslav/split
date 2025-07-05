import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, Button, SafeAreaView, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';
import { styles } from '../../../components/themes/styles';

const GetAccountCode = () => {
  const insets = useSafeAreaInsets();
  const userCode = userDetails.userProfile.userCode;

  const {logout, setGesturesEnabled} = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.almostCenter}>
        <Text style={styles.text}>Done 🎉</Text>
        <Text>Your code: {userCode}</Text>
      </View>

      <View style={{
          position: 'absolute',
          bottom: insets.bottom + 130,
      }}>
          <Button title="Got it!" onPress={() => {
              router.navigate('/groups/groupsView')
          }} />

          <Button title="Log out" onPress={async() => {
              await logout();
              router.replace('/')
          }} />
      </View>
    </SafeAreaView>
  );
};

export default GetAccountCode;