import { ActivityIndicator, Button, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, router } from 'expo-router'
import { styles } from '../components/themes/styles'
import { account } from '../lib/appwrite'
import { useUser } from '../hooks/useUser'
import * as Font from 'expo-font';

const Index = () => {
  const { fetchUserProfile, setGesturesEnabled } = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const handleHomeScreen = async () => {

    // THIS IS TEMPORARY!!!!

    setTimeout(() => {
      router.navigate('/themePlayground')
    }, 100)

    //  try {

    //    const user = await account.get();

    //    if (user) {
    //      const profile = await fetchUserProfile(user.$id);
    //      if (profile) {
    //        router.replace('/groups/groupsView');
    //      }
    //      else router.replace('/user/user_welcome');
    //    }
    //  } catch (err) {
    //    router.replace('/user/user_welcome');
    //  }
  };

  useEffect(() => {
    Font.loadAsync({
      'Satoshi-Light': require('../assets/fonts/Satoshi-Light.otf'),
      'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
      'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
      'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
      'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),

      'Satoshi-LightItalic': require('../assets/fonts/Satoshi-LightItalic.otf'),
      'Satoshi-Italic': require('../assets/fonts/Satoshi-Italic.otf'),
      'Satoshi-MediumItalic': require('../assets/fonts/Satoshi-MediumItalic.otf'),
      'Satoshi-BoldItalic': require('../assets/fonts/Satoshi-BoldItalic.otf'),
      'Satoshi-BlackItalic': require('../assets/fonts/Satoshi-BlackItalic.otf'),
    }).then(() => {
      setFontsLoaded(true)
      handleHomeScreen();
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large'></ActivityIndicator>
    </View>
  )
}

export default Index