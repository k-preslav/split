import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Button } from 'react-native';
import { Colors } from '../themes/colors';
import OrbitingFriendIcon from './orbitingFriendsIcon';
import NameBar from '../common/nameBar';
import { useUser } from '../../hooks/useUser';
import { getUserProfileByCode } from '../../lib/getUser';
import { userDetails } from '../../lib/userDetails';
import { getGroupImageUrl } from '../../lib/groupsApi';
import { Calendar, RefreshCcw } from 'lucide-react-native';

const GroupComponent = ({ group, shouldAnimate, isActive }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const orbitRef = useRef();

  const groupStyles = getGroupStyles(Colors);

  useEffect(() => {
    if (isActive && orbitRef.current) {
      orbitRef.current.startAnimation();
    }
  }, [isActive]);

  return (
    <View style={groupStyles.container}>
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

        {group.isSubscription && (
          <View style={{
            position: 'absolute',
            right: 5,
            bottom: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.lightGray,
            borderRadius: 99,
            padding: 8,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}>
            <Calendar
              strokeWidth={2}
              color={Colors.textLight}
              size={18}
              />
          </View>
        )}

        <OrbitingFriendIcon
          ref={orbitRef}
          friends={group.membersProfiles || []}
          centerX={layout.width / 2}
          centerY={layout.height / 2}
        />
      </View>
    </View>
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
    },
  }
);