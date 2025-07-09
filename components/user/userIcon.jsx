import { View, Text, Image, TouchableWithoutFeedback, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import NameBar from '../common/nameBar';
import { getUserProfileByCode } from '../../lib/getUser';
import { getUserProfilePicUrl } from '../../lib/userProfilePic';
import { Colors } from '../themes/colors';
import ThemedText from '../common/themedText';
import { selectImage } from '../../lib/imageSelect';
import { Upload } from 'lucide-react-native';

const UserIcon = ({ user, enableSelectImage = false, onImageSelected, nameBarPosition = 'bottom' }) => {
  const [showNamebar, setShowNamebar] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iconSize, setIconSize] = useState({ width: 0, height: 0 });

  const onPressed = async () => {
    if (enableSelectImage) {
      setIsLoading(true);
      const imageSelect = await selectImage();
      setProfileImageUrl(imageSelect);
      if (imageSelect) {
        onImageSelected?.(imageSelect);
      }
      setIsLoading(false);
    }
  };

  const getInitials = (fullName) =>
    fullName
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('');

  const fetchProfileData = async () => {
    setIsLoading(true);
    
    try {
      const userDetails = await getUserProfileByCode(user.userCode);
      if (!userDetails) {
        console.warn('User details not found for userCode:', user.userCode);
        return;
      }

      setUserDetails(userDetails);
      if (!userDetails.profilePicId) {
        setIsLoading(false);
        return;
      }

      const url = await getUserProfilePicUrl(userDetails.profilePicId);
      setProfileImageUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const calculatedFontSize =
    iconSize.width && iconSize.height
      ? Math.min(iconSize.width, iconSize.height) * 0.5
      : 36;

  return (
    <TouchableWithoutFeedback onPress={onPressed}>
      <View
        style={friendIconStyles.container}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setIconSize({ width, height });
        }}
      >
        {nameBarPosition === 'top' && showNamebar && (
          <NameBar
            fontSize={12}
            name={userDetails?.name.split(' ')[0] || '-'}
            style={{
              paddingVertical: 2,
              paddingHorizontal: 5,
              position: 'absolute',
              top: -30,
              zIndex: 2,
            }}
          />
        )}

        {!isLoading ? (
          !profileImageUrl ? (
            <View
              style={[
                {
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                friendIconStyles.profileImagePlaceholder,
              ]}
            >
              <ThemedText
                fontSize={calculatedFontSize}
                fontWeight="BlackItalic"
                color={userDetails?.profileImgPlaceholderColor || Colors.primary}
                style={{
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {userDetails?.name ? getInitials(userDetails.name) : '?'}
              </ThemedText>
              {enableSelectImage && (
                <View style={friendIconStyles.uploadOverlay}>
                  <Upload size={36} strokeWidth={2.25} color={Colors.light} opacity={0.8} />
                </View>
              )}
            </View>
          ) : (
            <View style={friendIconStyles.container}>
              <Image
                source={{ uri: profileImageUrl }}
                style={friendIconStyles.profileImage}
              />
              {enableSelectImage && (
                <View style={friendIconStyles.uploadOverlay}>
                  <Upload size={36} strokeWidth={2.5} color={Colors.light} />
                </View>
              )}
            </View>
          )
        ) : (
          <View style={[friendIconStyles.container, friendIconStyles.profileImagePlaceholder]}>
            <ActivityIndicator color={Colors.light} />
          </View>
        )}

        {nameBarPosition === 'bottom' && showNamebar && (
          <NameBar
            fontSize={12}
            name={userDetails?.name || '-'}
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
  profileImagePlaceholder: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 99,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 99,
    zIndex: 3,
  },
});