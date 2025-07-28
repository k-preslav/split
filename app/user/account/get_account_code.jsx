import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, Button, Dimensions, SafeAreaView, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userDetails } from '../../../lib/userDetails';
import { useUser } from '../../../hooks/useUser';
import ThemedView from '../../../components/views/themedView';
import CurvedLine from '../../../components/special/curveLine';
import FixedCenterView from '../../../components/views/fixedCenterView';
import BigText from '../../../components/common/bigText';
import FixedBottomView from '../../../components/views/fixedBottomView';
import { ArrowRight, ShareIcon } from 'lucide-react-native';
import VerticalView from '../../../components/views/verticalView';
import HorizontalView from '../../../components/views/horizontalView';
import ActionButton from '../../../components/common/actionButton';
import ConfettiCannon from 'react-native-confetti-cannon';
import ThemedText from '../../../components/common/themedText';
import ShareUserCodeModal from '../../../components/modals/shareUserCodeModal';
import { deviceInfo } from '../../../global/deviceInfo';
import ThemedButton from '../../../components/common/themedButton';
import UserCodeShare from '../../../components/user/userCodeShare';
import { fetchUserProfile } from '../../../lib/getUser';

const GetAccountCode = () => {
  const userCode = userDetails.userProfile.userCode;

  const {setGesturesEnabled} = useUser();
  const [shareModalVisible, setShareModalVisible] = React.useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [confettiCount, setConfettiCount] = React.useState(100);

  useEffect(() => {
    if (deviceInfo.devicePlatform === 'android') {
      const ver = parseFloat(deviceInfo.devicePlatformVersion);
      if (ver == 10) {
        setConfettiCount(50);
      }
      if (ver < 10) {
        setConfettiCount(25);
      }
      if (ver <= 8) {
        setConfettiCount(7);
      }
    }
  }, [])

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
  }, []))

  return (
    <ThemedView>
      <FixedCenterView yOffset={260}>
        <VerticalView style={{gap: 20}}>
            <BigText>{userDetails._isNewProfile ? "Done 🎉" : "You’re back! 😎"}</BigText>
            <ThemedText fontSize={24}>Your code:</ThemedText>
          </VerticalView>
          <UserCodeShare userCode={userCode} onShare={async() => setShareModalVisible(true)}/>
      </FixedCenterView>

      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: useSafeAreaInsets().bottom,
      }}>
        <ThemedButton
          text='Got it!'
          loadingOnPress={true}
          style={{width: '95%'}}
          onPress={async () => {
            await fetchUserProfile(userDetails.userProfile.userId);
            router.navigate('/groups/groupsView');
          }}
        />        
      </View>

      <ShareUserCodeModal 
        userCode={userCode} 
        visible={shareModalVisible} 
        onClose={() => setShareModalVisible(false)}
      />

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <ConfettiCannon
          count={confettiCount}
          origin={{x: screenWidth / 2, y: screenHeight}}
          fadeOut={true}
          explosionSpeed={200}
          fallSpeed={2000}
          autoStart={true}
          autoStartDelay={100}
        />
      </View>
    </ThemedView>
  );
};

export default GetAccountCode;