import { Query } from "react-native-appwrite";
import { databases } from "./appwrite";

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
  try {
    const existing = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      [Query.equal('userCode', code)]
    );
      
    if (existing.total > 0) {
      print(existing.documents[0]);
      return existing.documents[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('Failed to query user_profiles by code:', err);
    return null;
  }
}