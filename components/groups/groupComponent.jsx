import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Button } from 'react-native';
import { Colors } from '../themes/colors';
import OrbitingFriendIcon from './orbitingFriendsIcon';
import NameBar from '../common/nameBar';
import { useUser } from '../../hooks/useUser';
import { getUserProfileByCode } from '../../lib/getUser';
import { userDetails } from '../../lib/userDetails';
import { getGroupImageUrl } from '../../lib/groupsApi';

const GroupComponent = ({ group, isActive }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const orbitRef = useRef();

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
        <Image
          source={{ uri: group.groupImageUrl }}
          style={groupStyles.groupIcon}
          resizeMode="contain"
        />

        <OrbitingFriendIcon
          ref={orbitRef}
          friends={group.friendProfiles}
          centerX={layout.width / 2}
          centerY={layout.height / 2}
        />
      </View>
    </View>
  );
};


export default GroupComponent;

const groupStyles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    bottom: 50,
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
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  groupIcon: {
    width: 96,
    height: 96,
  },
});
