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
    await account.createRecovery(email, 'https://splitapp.loophole.site/pages/change-password');
    return true;
  } catch (error) {
    console.error('Error sending change password email:', error);
    return false;
  }
}
let lastVerificationEmailTime = 0;
export async function sendVerify() {
  const now = Date.now();
  const cooldownRemaining = 60000 - (now - lastVerificationEmailTime);

  if (cooldownRemaining > 0) {
    console.warn(`Please wait ${Math.ceil(cooldownRemaining / 1000)}s before resending.`);
    return { success: false, cooldown: Math.ceil(cooldownRemaining / 1000) };
  }

  try {
    await account.createVerification('https://splitapp.loophole.site/pages/verify-email');
    lastVerificationEmailTime = now;
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
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