import { ID } from "react-native-appwrite";
import { storage } from "./appwrite";

export async function uploadUserProfilePic(file, previousFileId = null) {
  if (!file) {
    throw new Error('File is required to upload the profile picture');
  }

  if (previousFileId) {
    await storage.deleteFile(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
      previousFileId
    );
  }

  return await storage.createFile(
    process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
    ID.unique(),
    {
      name: `profilePic_${ID.unique()}.jpg`,
      type: 'image/jpeg',
      size: 0,
      uri: file,
    },
  );
}

export async function getUserProfilePicUrl(fileId) {
  if (!fileId) {
    throw new Error('File ID is required to fetch the profile picture');
  }

  try {
    let fileUrl = await storage.getFileViewURL(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
      fileId
    );
    
    fileUrl += `?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    return fileUrl;
  } catch (error) {
    console.error('Error fetching user profile picture:', error);
    throw error;
  }
}