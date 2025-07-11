import { Platform } from "react-native";
import { Account, Client, Databases, Storage } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setDevKey(process.env.EXPO_PUBLIC_APPWRITE_DEV_KEY);
  
// switch (Platform.OS)
// {
//   case 'android':
//     client.setPlatform('money.splitco.splitapp');
//     break;
//   case 'ios':
//     client.setPlatform('money.splitco.splitapp');
//     break;
// }

export const account = new Account(client);

export const databases = new Databases(client);

export const storage = new Storage(client);

export async function checkPassword(email, password) {
  try {
    await account.deleteSession('current'); // Ensure no active session exists

    await account.createEmailPasswordSession(email, password);

    return true;
  } catch (error) {
    console.error('Error checking password:', error);
    return false;
  }
}

export async function sendChangePassword(overrideEmail=null) {
  let email = '';
  
  if (overrideEmail) {
    email = overrideEmail;
  }
  else {
    try {
      const user = await account.get();
      email = user.email;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return false;
    }
  }

  try {
    await account.createRecovery(email, 'http://localhost:5173/pages/change-password');
    return true;
  } catch (error) {
    console.error('Error sending change password email:', error);
    return false;
  }
}

export async function sendVerify() {
  try {
    await account.createVerification('http://localhost:5173/pages/verify-email');
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function isVerified() {
  try {
    const user = await account.get();
    return user.emailVerification;

  } catch (error) {
    console.error('Error checking verification status:', error);
    return false;
  }
}