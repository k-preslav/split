import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

export async function selectImage() {
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

      return compressedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Failed to compress the image.');

      return null;
    }
  }
}