import { ID, Query } from "react-native-appwrite";
import { databases } from "./appwrite";

export async function createNewGroup(groupName, ownerId, friendsCodes) {
  try {
    const response = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      ID.unique(),
      {
        groupName: groupName,
        ownerId: ownerId,
        friends: friendsCodes,
      }
    )

    if (response) {
      console.log("Group created successfully:", groupName);
      return response;
    }
  }
  catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
}

export async function getGroupsByOwnerId(ownerId) {
  try {
    const response = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [Query.equal('ownerId', ownerId)]
    );

    if (response.documents.length > 0) {
      console.log("Groups fetched successfully for ownerId:", ownerId);
      return response.documents;
    } else {
      console.log("No groups found for ownerId:", ownerId);
      return [];
    }
  } catch (error) {
    console.error("Error fetching groups by ownerId:", error);
    return [];
  }
}