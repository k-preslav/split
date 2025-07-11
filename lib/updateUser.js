import { account, databases, storage } from "./appwrite";
import { userDetails } from "./userDetails";

export async function updateUserName(newName) {
  if (!newName || typeof newName !== 'string') {
    console.error('Invalid name provided');
    return false;
  }

  try {
    await account.updateName(newName);

    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { name: newName }
    );

    if (user) {
      console.log('User name updated successfully:', user.name);
      return true;
    } else {
      console.error('Failed to update user name');
      return false;
    }
  } catch (error) {
    console.error('Failed to update user name:', error, error.code);
    return error;
  }
}

export async function updateUserEmail(newEmail, password) {
  if (!newEmail || typeof newEmail !== 'string') {
    console.error('Invalid email provided');
    return false;
  }

  try {
    await account.updateEmail(newEmail, password);

    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { email: newEmail }
    );

    if (user) {
      console.log('User email updated successfully:', user.email);
    } else {
      console.error('Failed to update user email');
    }
  } catch (error) {
    console.error('Failed to update user email:', error, error.code);
    return error;
  }
}

export async function updateUserProfilePic(picId) {
  if (!picId || typeof picId !== 'string') {
    console.error('Invalid profile picture ID provided');
    return false;
  }

  try {
    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { profilePicId: picId }
    );

    if (user) {
      console.log('User profile picture updated successfully:', user.profilePicId);
      return true;
    } else {
      console.error('Failed to update user profile picture');
      return false;
    }
  } catch (error) {
    console.error('Failed to update user profile picture:', error);
    return false;
  }
}

export async function updateUserPreferredCurrency(currency) {
  if (!currency || typeof currency !== 'string') {
    console.error('Invalid currency provided');
    return false;
  }

  try {
    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { preferredCurrency: currency }
    );

    if (user) {
      console.log('User preferred currency updated successfully:', user.preferredCurrency);
      return true;
    } else {
      console.error('Failed to update user preferred currency');
      return false;
    }
  } catch (error) {
    console.error('Failed to update user preferred currency:', error, error.code);
    return error;
  }
}

export async function updateUserCollectData(value) {
  if (typeof value !== 'boolean') {
    console.error('Invalid value provided for collect data');
    return false;
  }

  try {
    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { collectData: value }
    );

    if (user) {
      console.log('User collect data preference updated successfully:', user.collectData);
      return true;
    } else {
      console.error('Failed to update user collect data preference');
      return false;
    }
  } catch (error) {
    console.error('Failed to update user collect data preference:', error, error.code);
    return error;
  }
}

export async function updateUserShouldBeLoggedOut(value) {
  try {
    const user = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
      userDetails.userProfile.$id,
      { shouldBeLoggedOut: value }
    );

    if (user) {
      console.log('Updated "user should be logged out" successfully:', user.shouldBeLoggedOut);
      return true;
    } else {
      console.error('Failed to update "user should be logged out"');
      return false;
    }
  } catch (error) {
    console.error('Failed to update "user should be logged out":', error, error.code);
    return error;
  }
}