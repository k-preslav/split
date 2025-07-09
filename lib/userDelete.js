import { Account, Query } from "react-native-appwrite";
import { checkPassword, client, databases, storage } from "./appwrite";
import { userDetails } from "./userDetails";

export const DELETE_USER_RES_CODES = {
  NO_USER_ID: 100,
  INCORRECT_PASSWORD: 101,
  SUCCESS: 0,
  UNKNOWN_ERROR: 102,
};


export async function deleteUser(password) {
  const userProfile = userDetails.userProfile;
  if (!userProfile || !userProfile.$id) {
    console.warn('No userId found in userDetails, cannot delete user.');
    return DELETE_USER_RES_CODES.NO_USER_ID;
  }

  const isPasswordCorrect = await checkPassword(userProfile.email, password);
  if (!isPasswordCorrect) {
    console.warn('Incorrect password provided for user deletion.');
    return DELETE_USER_RES_CODES.INCORRECT_PASSWORD;
  }

  // Delete user profile document
  try {
    const response = await databases.deleteDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userProfile.$id
    );

    console.log('User profile deleted document successfully:', response);
  } catch (error) {
    console.error('Error deleting user profile document:', error);
  }

  // Delete user groups
  try {
    const groups = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [Query.equal('ownerId', userProfile.userId)]
    );

    for (const group of groups.documents) {
      await databases.deleteDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        group.$id
      );
    }

    console.log('User groups deleted successfully.');
  } catch (error) {
    console.error('Error deleting user groups:', error);
  }

  // Delete user profile image if it exists
  if (userProfile.profilePicId) {
    try {
      await storage.deleteFile(
        process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
        userProfile.profilePicId
      );
      console.log('User profile image deleted successfully.');
    } catch (error) {
      console.error('Error deleting user profile image:', error);
    }
  }
  
  console.log('User profile and associated data deleted successfully.');
  return DELETE_USER_RES_CODES.SUCCESS;
}