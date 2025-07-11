import { ActivityIndicator, Button, Platform, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, router } from 'expo-router'
import { styles } from '../components/themes/styles'
import { account } from '../lib/appwrite'
import { useUser } from '../hooks/useUser'
import * as Font from 'expo-font';
import ThemedModal from '../components/modals/themedModal'
import ThemedView from '../components/views/themedView'
import BigText from '../components/common/bigText'
import { deviceInfo } from '../global/deviceInfo'
import { getUserProfilePicImg, getUserProfilePicUrl } from '../lib/userProfilePic'
import { guessPreferredCurrency } from '../lib/getCurrencyFromLocale'
import { fetchUserProfile } from '../lib/getUser'

const Index = () => {
  const { setGesturesEnabled } = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const handleHomeScreen = async () => {
    // Get device info
    try {
      //deviceInfo.osVersion = DeviceInfo.getSystemVersion();
      deviceInfo.platform = Platform.OS;
      if (deviceInfo.platform === 'android') 
        deviceInfo.osVersion = Platform.constants.Release;
      else if (deviceInfo.platform === 'ios')
        deviceInfo.osVersion = Platform.Version;

      console.log('Device Info:', deviceInfo);
    }
    catch (err) {
      console.error('Error fetching device info:', err);
    }

    // router.navigate('user/account/set_account_password');
    // return;

    // Get user info and redirect
    try {
      const user = await account.get();
      if (user) {
        const profile = await fetchUserProfile(user.$id);

        if (profile) {
          router.navigate('/groups/groupsView');
        }
        else {
          router.navigate('/user/user_welcome');
        } 
      }
    } catch (err) {
      router.navigate('/user/user_welcome');
    }
  }

  useEffect(() => {
    if (!fontsLoaded) {
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

        'GeistMono': require('../assets/fonts/GeistMono.ttf'),
      }).then(() => {
        setFontsLoaded(true)
        handleHomeScreen();
      });
    }
  }, [fontsLoaded]);

  return (
    <ThemedView>
      <ActivityIndicator size='small' color='white'></ActivityIndicator>
    </ThemedView>
  )
}

export default Index