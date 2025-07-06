import { ID } from "react-native-appwrite";
import { storage } from "./appwrite";

export async function uploadUserProfilePic(file) {
  if (!file) {
    throw new Error('File is required to upload the profile picture');
  }
  
  return await storage.createFile(
    process.env.EXPO_PUBLIC_APPWRITE_STORAGE_PROFILEPIC_ID,
    ID.unique(),
    {
      name: `${ID.unique()}_profilePic.jpg`,
      type: 'image/jpeg',
      size: 0, // Size will be set by the server
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
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_PROFILEPIC_ID,
      fileId
    );
    
    fileUrl += `?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    return fileUrl;
  } catch (error) {
    console.error('Error fetching user profile picture:', error);
    throw error;
  }
}

export async function getUserProfilePicImg(url) {
  if (!url) {
    throw new Error('URL is required to fetch the profile picture image');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch profile picture image');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching user profile picture image:', error);
    throw error;
  }
}