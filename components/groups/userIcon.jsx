import { View, Text, Image, TouchableWithoutFeedback, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import NameBar from '../common/nameBar';
import { getUserProfileByCode } from '../../lib/getUser';
import { getUserProfilePicUrl } from '../../lib/userProfilePic';
import { Colors } from '../themes/colors';

const UserIcon = ({ friend, nameBarPosition = 'bottom' }) => {
  const [showNamebar, setShowNamebar] = React.useState(true);
  const [profileImageUrl, setProfileImageUrl] = React.useState('');
  const [userDetails, setUserDetails] = React.useState(null);

  const toggleNamebar = () => {
    setShowNamebar(true);
    // setTimeout(() => {
    //   setShowNamebar(false);
    // }, 2000);
  };

  const fetchProfileData = async () => {
    try {
      const userDetails = await getUserProfileByCode(friend.userCode);
      if (!userDetails) {
        console.error('User details not found for userCode:', friend.userCode);
        return;
      }

      setUserDetails(userDetails);

      const url = await getUserProfilePicUrl(userDetails.profilePicId);
      setProfileImageUrl(url);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [friend]);

  return (
    <TouchableWithoutFeedback onPress={toggleNamebar}>
      <View style={friendIconStyles.container}>
        {nameBarPosition === 'top' && showNamebar && (
          <NameBar
            fontSize={12}
            name={userDetails?.name || 'No name'}
            style={{
              paddingVertical: 2,
              paddingHorizontal: 5,
              position: 'absolute',
              top: -30,
              zIndex: 2,
            }}
          />
        )}

        {!profileImageUrl ? (
          <ActivityIndicator
            color={Colors.light}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 1,
            }}
          />
        ) : (
          <Image
            source={{ uri: profileImageUrl }}
            style={friendIconStyles.profileImage}
          />
        )}

        {nameBarPosition === 'bottom' && showNamebar && (
          <NameBar
            fontSize={12}
            name={userDetails?.name || 'No name'}
            style={{
              paddingVertical: 2,
              paddingHorizontal: 7,
              position: 'absolute',
              bottom: -30,
              zIndex: 2,
            }}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserIcon;

const friendIconStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
  },
  nameBarTop: {
    position: 'absolute',
    top: -20,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});
