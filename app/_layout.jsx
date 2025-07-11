import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../contexts/userContext';
import { useUser } from '../hooks/useUser';
import { Colors } from '../components/themes/colors';
import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { userDetails } from '../lib/userDetails';
import { fetchUserProfile } from '../lib/getUser';

// This component is now a child of UserProvider, so it can use the hook.
function RootLayoutNav() {
  const { areGesturesEnabled } = useUser();

  return (
    <>
      <StatusBar style='auto' />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: areGesturesEnabled,
          animation: 'slide_from_right',
          animationTypeForReplace: 'push',
          animationDuration: 400,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </>
  );
}

export default function Layout() {
  const segments = useSegments();
  const previous = useRef('');

  const handleShouldLogOut = async() => {
    if (userDetails.userProfile?.userId === undefined) {
      return;
    }

    await fetchUserProfile(userDetails.userProfile.userId);
    
    const shouldLogOut = userDetails.userProfile?.shouldBeLoggedOut || false;
    if (shouldLogOut) {
      router.navigate('/user/user_welcome');
    }
  }

  useEffect(() => {
    const current = segments.join('/');
    if (previous.current !== current) {
      handleShouldLogOut();

      previous.current = current;
    }
  }, [segments]);

  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}