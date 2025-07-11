import { Query } from "react-native-appwrite";
import { databases } from "./appwrite";
import { userDetails } from "./userDetails";

export async function fetchUserProfile(userId) {
  try {
    const response = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      const result = response.documents[0];

      console.log("User profile fetched.");
      
      userDetails.userProfile = result;
      return result;
    } else {
      console.log("No user profile found for userId:", userId);
      return null;
    }
  }
  catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function doesUserExistByEmail(email) {
  try {
    const result = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    return result.total > 0;
  } catch (err) {
    console.error('Failed to query user_profiles:', err);
    return false;
  }
}

export async function getUserProfileByCode(code) {
  if (!code) {
    console.warn('No user code provided, cannot fetch user profile by code.');
    return null;
  }

  try {
    const existing = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      [Query.equal('userCode', code)]
    );
      
    if (existing.total > 0) {
      return existing.documents[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Failed to query user_profiles collection by code:', err);
    return null;
  }
}

export async function getUserProfileById(userId) {
  if (!userId) {
    console.warn('No userId provided, cannot fetch user profile by id.');
    return null;
  }

  try {
    const result = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );

    if (result.total > 0) {
      return result.documents[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Failed to fetch user_profile by userId:', err);
    return null;
  }
}