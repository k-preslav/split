import { ActivityIndicator, AppState, Button, Platform, Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, router } from 'expo-router'
import { styles } from '../components/themes/styles'
import { account } from '../lib/appwrite'
import { useUser } from '../hooks/useUser'
import * as Font from 'expo-font';
import ThemedModal from '../components/modals/themedModal'
import ThemedView from '../components/views/themedView'
import BigText from '../components/common/bigText'
import { deviceInfo, getDeviceInfo } from '../global/deviceInfo'
import { getUserProfilePicImg, getUserProfilePicUrl } from '../lib/userProfilePic'
import { getCurrencyFromLocale } from '../lib/getCurrencyFromLocale'
import { fetchUserProfile } from '../lib/getUser'
import { setColorScheme } from '../components/themes/colors'
import { createDataCollection, endUserSession, sessionStart, startUserSession, updateAppStartupDuration, updateAppVersionInfo, updateDeviceInfo, updateUiThemeInfo, updateUserLoginTime } from '../lib/dataCollection'
import { userDetails } from '../lib/userDetails'
import { isAppLaunchTracked, markAppLaunchTracked, unmarkAppLaunchTracked } from '../lib/appLaunch'

const Index = () => {
  const { setGesturesEnabled } = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const appStartTimestamp = Date.now();
  let startupDurationMs = 0;

  // Automatically set the color scheme based on the device settings
  const scheme = useColorScheme();

  useEffect(() => {
    if (scheme) setColorScheme(scheme);
  }, [scheme]);

  useEffect(() => {
    if (sessionStart) {
      return;
    }

    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startUserSession();
      } else if ( nextAppState === "background") {
        endUserSession();
        unmarkAppLaunchTracked();
      }
    });

    // Start session on mount (app open)
    startUserSession();

    return () => {
      appStateSub.remove();
      endUserSession();
    };
  }, [])

  const handleHomeScreen = async () => {
    // Get device info
    try {
      //deviceInfo.osVersion = DeviceInfo.getSystemVersion();
      getDeviceInfo();
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

        // router.navigate('/subscriptionPlayground');
        // return;

        if (profile) {
          router.navigate('/groups/groupsView');

          // Get the app startup duration
          if (!isAppLaunchTracked()) {
            const appReadyTimestamp = Date.now();
            startupDurationMs = appReadyTimestamp - appStartTimestamp;
          }
          
          // Handle data collection
          setTimeout(async() => {
            if (!userDetails.userProfile?.collectData) {
              console.log('Data collection is disabled for this user.');
              markAppLaunchTracked();
              return;
            }

            if (await createDataCollection()) { // Create only if it doesn't exist
              await fetchUserProfile(user.$id);
            }
            
            setTimeout(async() => {
              if (!isAppLaunchTracked()) {
                await updateDeviceInfo();
                await updateUserLoginTime();
                await updateAppStartupDuration(startupDurationMs);
                await updateAppVersionInfo();
                await updateUiThemeInfo();
              }

              markAppLaunchTracked();
            }, 250);
          }, 1000);

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