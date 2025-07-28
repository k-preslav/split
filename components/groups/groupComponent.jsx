import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Colors } from '../themes/colors';
import OrbitingFriendIcon from './orbitingFriendsIcon';
import { Calendar, RefreshCcw } from 'lucide-react-native';

const GroupComponent = ({ group, isActive }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const orbitRef = useRef();
  const popupAnim = useRef(new Animated.Value(0)).current;

  const groupStyles = getGroupStyles(Colors);

  useEffect(() => {
    Animated.spring(popupAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 20,
    }).start();
  }, []);

  useEffect(() => {
    if (isActive && orbitRef.current) {
      orbitRef.current.startAnimation();
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        groupStyles.container,
        {
          transform: [
            {
              scale: popupAnim,
            },
          ],
        },
      ]}
    >
      <View
        style={groupStyles.groupIconContainer}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          setLayout({ width, height });
        }}
      >
        <View>
          <Image
            source={{ uri: group.groupImageUrl }}
            style={groupStyles.groupIcon}
            resizeMode="contain"
          />
        </View>

        <OrbitingFriendIcon
          ref={orbitRef}
          friends={group.membersProfiles || []}
          centerX={layout.width / 2}
          centerY={layout.height / 2}
        />
      </View>
    </Animated.View>
  );
};

export default GroupComponent;

export const getGroupStyles = (Colors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupIconContainer: {
      width: 145,
      height: 145,
      borderRadius: 99,
      backgroundColor: Colors.backgroundSecondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    groupIcon: {
      width: 96,
      height: 96,
      borderRadius: 99,
    },
  }
);