import { createContext, useState } from "react";
import { account, databases } from "../lib/appwrite";
import { ID, Query } from "react-native-appwrite";
import { userDetails } from "../lib/userDetails";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [areGesturesEnabled, setGesturesEnabled] = useState(true);

  async function register(name, email, password) {
    try {
      await account.create(ID.unique(), email, password, name);
      console.log("User registered");

      await login(email, password).then(async (res) => {
        if (!res.code) {
          await createUserProfile(res);
        }
      });

      return "registered";
    }
    catch (error) {
      return error;
    }
  }

  async function login(email, password) {
    try {
      await account.createEmailPasswordSession(email, password);
      
      const response = await account.get();
      setUser(response);

      await fetchUserProfile(response.$id);

      console.log("User logged in");
      return response;
    }
    catch (error) {
      console.log("Login error:", error);
      return error;
    }
  }

  async function logout() {
    try {
      // Try to delete the session
      try {
        await account.deleteSession("current");        
        console.log("User logged out");
      } catch (sessionError) {
        console.log("Session deletion error:", sessionError);
      }
      
      userDetails.userProfile = [];
      setUser(null);
      
    } catch (error) {
      console.log("Logout error:", error);
      setUser(null);
    }
  }

  async function createUserProfile(userData) {
    await generateUserCode().then(async (code) => {
      try {
        const result = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
          ID.unique(),
          {
            userId: userData.$id,
            name: userData.name,
            email: userData.email,
            profilePicId: userDetails._profilePicId || '',
            userCode: code,
          }
        );

        userDetails.userProfile = result;
  
        console.log("User profile created.");
        return result;
      }
      catch (error) {
        console.error("Error creating user profile:", error);
        return error;
      }
    });
  }

  async function fetchUserProfile(userId) {
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

  async function generateUserCode() {
    const chars = 'abcdefghijklmnopqrstuvhwxyz0123456789';
    const length = 6;

    while (true) {
      // Generate a random code
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      // Check if it exists in the `user_profiles` collection
      const existing = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID,
        [Query.equal('userCode', code)]
      );

      if (existing.total === 0) {
        // Code is unique!
        console.log("Generated unique user code:", code);
        return code;
      }

      // Otherwise, loop again to generate a new one
    }
  }

  return (
    <UserContext.Provider value={{ register, login, logout, fetchUserProfile, setGesturesEnabled, areGesturesEnabled }}>
      {children}
    </UserContext.Provider>
  )
}