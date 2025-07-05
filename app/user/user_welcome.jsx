import { Button, SafeAreaView, Text, View } from 'react-native'
import { styles } from '../../components/themes/styles'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { useUser } from '../../hooks/useUser';

const UserWelcome = () => {
  const insets = useSafeAreaInsets();
  const { setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.almostCenter}>
        <Text style={styles.text}>Welcome 👋</Text>
      </View>

      <View style={{
        position: 'absolute',
        bottom: insets.bottom + 130,
      }}>
        <Button
          title="Next"
          onPress={() => router.push('/user/account/set_account_email')}
        />
      </View>
    </SafeAreaView>
  )
}

export default UserWelcome;