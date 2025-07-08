import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../contexts/userContext';
import { useUser } from '../hooks/useUser';
import { Colors } from '../components/themes/colors';

// This component is now a child of UserProvider, so it can use the hook.
function RootLayoutNav() {
  const { areGesturesEnabled } = useUser();

  return (
    <>
      <StatusBar value='auto' />
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
  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}
