import React, { useCallback, useState } from 'react';
import {
  View,
  Keyboard,
  Image,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import ThemedView from '../../../components/views/themedView';
import CurvedLine from '../../../components/special/curveLine';
import FixedCenterView from '../../../components/views/fixedCenterView';
import FixedBottomView from '../../../components/views/fixedBottomView';
import ThemedButton from '../../../components/common/themedButton';
import ActionButton from '../../../components/common/actionButton';

import { Upload, ArrowRight } from 'lucide-react-native';
import { useUser } from '../../../hooks/useUser';
import { userDetails } from '../../../lib/userDetails';
import { storage } from '../../../lib/appwrite';
import { ID } from 'react-native-appwrite';
import { uploadUserProfilePic } from '../../../lib/userProfilePic';
import { selectImage } from '../../../lib/imageSelect';

const SetAccountProfilePic = () => {
  const [accountImage, setAccountImage] = useState(null);
  const { setGesturesEnabled } = useUser();

  useFocusEffect(
    useCallback(() => {
      setGesturesEnabled(false);
    }, [])
  );

  const handleImageSelect = async () => {
    const img = await selectImage();
    if (img) setAccountImage(img);
  };

  const handleSubmit = async () => {
    const result = await uploadUserProfilePic(accountImage);
    if (result) {
      userDetails._profilePicId = result.$id;
      router.push('/user/account/set_account_name');
    } else {
      Alert.alert('Failed to upload profile picture.', 'Please try again.');
    }
  }

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
          <ThemedButton
            text={accountImage ? 'Next' : 'Skip'}
            icon={<ArrowRight strokeWidth={2.5} />}
            loadingOnPress={true}
            onPress={handleSubmit}
            isPrimary={accountImage !== null}
          />
        </FixedBottomView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default SetAccountProfilePic;
