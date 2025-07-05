import { Button, Dimensions, SafeAreaView, Text, View } from 'react-native'
import { styles } from '../../components/themes/styles'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useRef } from 'react';
import { useUser } from '../../hooks/useUser';
import ThemedView from '../../components/views/themedView';
import CurvedLine from '../../components/special/curveLine';
import FixedCenterView from '../../components/views/fixedCenterView';
import BigText from '../../components/common/bigText';
import FixedBottomView from '../../components/views/fixedBottomView';
import BigButton from '../../components/common/bigButton';
import { ArrowRight } from 'lucide-react-native';

const UserWelcome = () => {
  const insets = useSafeAreaInsets();
  const { setGesturesEnabled } = useUser();

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <ThemedView>
      <CurvedLine/>
      <CurvedLine flipY/>

      <FixedCenterView yOffset={-95}>
        <BigText>Welcome 👋</BigText>
      </FixedCenterView>

      <FixedBottomView>
        <BigButton
          icon={<ArrowRight strokeWidth={2.5} />}
          onPress={() => {
            router.push('/user/account/set_account_email');
          }}
        >Let's go</BigButton>
      </FixedBottomView>
    </ThemedView>
  )
}

export default UserWelcome;