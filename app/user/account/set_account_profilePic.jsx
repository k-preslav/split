import React, { useCallback, useState } from 'react';
import {
  View,
  Keyboard,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import ThemedView from '../../../components/views/themedView';
import CurvedLine from '../../../components/special/curveLine';
import FixedCenterView from '../../../components/views/fixedCenterView';
import FixedBottomView from '../../../components/views/fixedBottomView';
import BigButton from '../../../components/common/bigButton';
import ActionButton from '../../../components/common/actionButton';

import { Upload, ArrowRight } from 'lucide-react-native';
import { useUser } from '../../../hooks/useUser';
import { userDetails } from '../../../lib/userDetails';
import { storage } from '../../../lib/appwrite';
import { ID } from 'react-native-appwrite';
import { uploadUserProfilePic } from '../../../lib/userProfilePic';

const SetAccountProfilePic = () => {
  const [accountImage, setAccountImage] = useState(null);
  const { setGesturesEnabled } = useUser();

  useFocusEffect(
    useCallback(() => {
      setGesturesEnabled(false);
    }, [])
  );

  const handleImageSelect = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [
            { resize: { width: 256, height: 256 } },
          ],
          {
            compress: 0.4,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        setAccountImage(compressedImage.uri);
      } catch (error) {
        console.error('Error compressing image:', error);
        Alert.alert('Error', 'Failed to compress the image.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!accountImage) {
      Alert.alert('Please select an image first.');
      return;
    }
    try {
      const file = await uploadUserProfilePic(accountImage);
      userDetails._profilePicId = file.$id;

      router.push('/user/account/set_account_name');
    } catch (error) {
      console.error('Error during image upload:', error);
      Alert.alert('Something went wrong');
      return;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView>
        <CurvedLine flipX text="Select your picture" />
        <CurvedLine flipX flipY />

        <FixedCenterView yOffset={220}>
          <ActionButton
            isPrimary={false}
            icon={
              accountImage ? (
                <Image
                  source={{ uri: accountImage }}
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: 65,
                  }}
                />
              ) : (
                <Upload strokeWidth={2.5} />
              )
            }
            size={130}
            onPress={handleImageSelect}
          />
        </FixedCenterView>

        <FixedBottomView>
          <BigButton
            icon={<ArrowRight strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={handleSubmit}
          >
            Next
          </BigButton>
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountProfilePic;
