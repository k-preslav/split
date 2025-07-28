// OrbitingFriendIcon.js
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import UserIcon from '../user/userIcon';
import { Colors } from '../themes/colors';
import { Check, Clock, Crown } from 'lucide-react-native';
import { deviceInfo } from '../../global/deviceInfo';
import { BlurView } from 'expo-blur';

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomStartRotation() {
  if (Math.random() < 0.5) {
    return getRandomInRange(-1.8, -1.6);
  } else {
    return getRandomInRange(1.6, 1.8);
  }
}

function getRandomEndRotation(startRotation) {
  if (startRotation < 1) {
    return getRandomInRange(-2, startRotation - 0.1);
  } else {
    return getRandomInRange(startRotation + 0.1, 2);
  }
}

const OrbitingFriendIcon = forwardRef(({ friends = [], centerX = 80, centerY = 80 }, ref) => {
  const [rotation, setRotation] = useState(getRandomStartRotation());
  const radius = 135;

  const badgeScales = useRef(friends.map(() => new Animated.Value(0))).current;
  const animationFrameRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const startAnimation = () => {
    if (isAnimatingRef.current) {
      // Prevent starting a new animation while one is running
      return;
    }

    // Cancel any previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (deviceInfo.devicePlatform === 'android' && deviceInfo.devicePlatformVersion < 12) {
      const newRotation = getRandomStartRotation();
      const targetRotation = getRandomEndRotation(newRotation);

      setRotation(targetRotation);
      return;
    }

    isAnimatingRef.current = true;

    // Badges animation
    if (deviceInfo.devicePlatform === 'android') {
      badgeScales.forEach(anim => anim.setValue(1));
    } else {
      badgeScales.forEach(anim => anim.setValue(0));
      const badgeAnimations = badgeScales.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 75,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, badgeAnimations).start();
    }

    const newRotation = getRandomStartRotation();
    setRotation(newRotation);
    const target = getRandomEndRotation(newRotation);
    const lerpFactor = 0.05;

    const animate = () => {
      setRotation(prev => {
        const next = prev + (target - prev) * lerpFactor;

        if (Math.abs(next - target) < 0.001) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
          isAnimatingRef.current = false;
          return target;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
        return next;
      });
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useImperativeHandle(ref, () => ({
    startAnimation,
  }));

  useEffect(() => {
    // Remove this:
    // startAnimation();

    // Cleanup remains
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isAnimatingRef.current = false; 
    };
  }, []); // only run on mount/unmount


  return (
    <>
      {friends.map((friend, i) => {
        const phaseOffset = (2 * Math.PI * i) / friends.length;
        const angle = rotation + phaseOffset - Math.PI / 2;

        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const badgeRadius = 42;
        const badgeX = badgeRadius * Math.cos(angle + Math.PI);
        const badgeY = badgeRadius * Math.sin(angle + Math.PI);

        return (
          <View
            key={i + friend.userCode || i}
            style={[
              friendIconStyles.orbitingIcon,
              {
                position: 'absolute',
                left: centerX + x - (85 / 2),
                top: centerY + y - (85 / 2),
              },
            ]}
          >
            <UserIcon 
              user={friend} 
              nameBarPosition={y < 0 ? 'top' : 'bottom'}
            />

            <Animated.View
              style={[
                friendIconStyles.badge,
                {
                  position: 'absolute',
                  left: 45 + badgeX - 12,
                  top: 45 + badgeY - 12,
                  transform: [{ scale: badgeScales[i] }],
                  borderRadius: 14,
                  overflow: 'hidden',
                  width: 24,
                  height: 24,
                  backgroundColor: friend.owner || friend.paid ? 'rgba(235, 255, 87, 0.95)' : 'rgba(65, 65, 65, 0.77)',
                },
              ]}
            >
              <BlurView
                intensity={friend.owner || friend.paid ? 3 : 7}
                tint={'regular'}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 99,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {friend.owner ? (
                  <Crown width={18} strokeWidth={2.5} />
                ) : friend.paid ? (
                  <Check width={18} strokeWidth={3} />
                ) : (
                  <Clock width={18} strokeWidth={2.25} color={"#F1F1E8"} />
                )}
              </BlurView>
            </Animated.View>
          </View>
        );
      })}
    </>
  );
});

export default OrbitingFriendIcon;

export const friendIconStyles = StyleSheet.create({
  orbitingIcon: {
    width: 85,
    height: 85,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
