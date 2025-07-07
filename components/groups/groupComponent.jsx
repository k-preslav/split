import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Button } from 'react-native';
import { Colors } from '../themes/colors';
import OrbitingFriendIcon from './orbitingFriendsIcon';
import NameBar from '../common/nameBar';
import { useUser } from '../../hooks/useUser';

const GroupComponent = ({group, isActive}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const orbitRef = useRef();

  const { logout } = useUser();

  useEffect(() => {
    if (isActive && orbitRef.current) {
      orbitRef.current.startAnimation();
    }
  }, [isActive]);

  const handleStartAnimation = () => {
    if (orbitRef.current) {
      orbitRef.current.startAnimation();
    }
  };

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
          source={{
            uri: 'https://images.icon-icons.com/2699/PNG/512/netflix_logo_icon_170919.png',
          }}
          style={groupStyles.groupIcon}
          resizeMode="contain"
        />

        {/* Orbiting Friends */}
        <OrbitingFriendIcon
          ref={orbitRef}
          friends={group.members}
          centerX={layout.width / 2}
          centerY={layout.height / 2}
        />
      </View>

      {/* <NameBar name={'Netflix split'} /> */}
      <Button
        title="Logout"
        onPress={logout}
        color={Colors.primary} />
    </View>

  );
};

export default GroupComponent;

const groupStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
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
