import { Button, Dimensions, SafeAreaView, Text, View, Animated, Easing } from 'react-native'
import { styles } from '../../components/themes/styles'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '../../hooks/useUser';
import ThemedView from '../../components/views/themedView';
import CurvedLine from '../../components/special/curveLine';
import FixedCenterView from '../../components/views/fixedCenterView';
import BigText from '../../components/common/bigText';
import FixedBottomView from '../../components/views/fixedBottomView';
import ThemedButton from '../../components/common/themedButton';
import { ArrowRight } from 'lucide-react-native';

const UserWelcome = () => {
  const insets = useSafeAreaInsets();
  const { setGesturesEnabled, setDoPushAnimation, logout } = useUser();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => {
    setGesturesEnabled(false);
    setDoPushAnimation(true);
  }, []))

  useEffect(() => {
    logout();
    
    // Start the shake animation
    startShakeAnimation();
  }, [])

  const startShakeAnimation = () => {
    // Reset animations
    shakeAnimation.setValue(0);
    scaleAnimation.setValue(1);
    
    // Create a more natural waving motion
    Animated.parallel([
      // Waving motion
      Animated.sequence([
        // First wave
        Animated.timing(shakeAnimation, {
          toValue: 0.8,
          duration: 250,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -0.3,
          duration: 200,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }),
        // Second wave
        Animated.timing(shakeAnimation, {
          toValue: 0.8,
          duration: 250,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -0.2,
          duration: 200,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }),
        // Settle back to center
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }),
      ]),
      
      // Subtle pulsing effect
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
      ])
    ]).start();
  };

  // Interpolate rotation for the wave effect
  const rotateInterpolate = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <ThemedView>
      <CurvedLine/>
      <CurvedLine flipY/>

      <FixedCenterView yOffset={260}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BigText>Welcome </BigText>
          <Animated.Text
            style={{
              fontSize: 32,
              transform: [
                { rotate: rotateInterpolate },
                { scale: scaleAnimation },
                { translateY: Animated.multiply(shakeAnimation, -5) }, // Slight up/down movement
              ],
            }}
            onPress={startShakeAnimation}
          >
            👋
          </Animated.Text>
        </View>
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
          text="Let's go"
          icon={<ArrowRight strokeWidth={2.5} />}
          style={{ width: "95%" }}
          onPress={() => {
            router.push('/user/account/set_account_email');
          }}
        />
      </View>
    </ThemedView>
  )
}

export default UserWelcome;