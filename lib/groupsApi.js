import { ID, Query } from "react-native-appwrite";
import { databases, storage } from "./appwrite";
import { findBestKeywordMatch, keywordToImageMap } from "./groupImageByKeyword";

export async function createNewGroup(
    groupName, 
    ownerId,
    friendsCodes,
    paidFriendsCodes,
    groupImageId,
    payAmount,
    splitAmount,
    paymentOptionIndex,
    billingOptionIndex
  ) {
  try {
    const response = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      ID.unique(),
      {
        groupName: groupName,
        ownerId: ownerId,
        friendsCodes: friendsCodes,
        paidFriendsCodes: paidFriendsCodes,
        groupImageId: groupImageId,
        payAmount: payAmount,
        splitAmount: splitAmount,
        paymentOptionIndex: paymentOptionIndex,
        billingOptionIndex: billingOptionIndex
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

export async function uploadGroupImage(file) {
  if (!file) {
    throw new Error('File is required to upload the group image');
  }

  return await storage.createFile(
    process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
    ID.unique(),
    {
      name: `${ID.unique()}_groupImage.jpg`,
      type: 'image/jpeg',
      size: 0,
      uri: file,
    },
  );
}

export async function tryFindGroupImageByGroupName(groupName) {
  const groupImageMatch = findBestKeywordMatch(groupName); // returns e.g. 'pornhub_groupImage'

  if (!groupImageMatch) {
    console.log('No matching keyword found for:', groupName);
    return null;
  }

  try {
    const result = await storage.listFiles(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
      [Query.contains('name', groupImageMatch)]
    );

    const file = result.files?.[0];

    if (!file) {
      console.log('No image file found for match:', groupImageMatch);
      return null;
    }

    let fileUrl = await storage.getFileViewURL(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
      file.$id
    );

    fileUrl = `${fileUrl}?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    return {
      uri: fileUrl,
      file: file
    };
  } catch (error) {
    console.error('Error retrieving group image file:', error);
    return null;
  }
}

export async function getGroupImageUrl(groupImageId) {
  if (!groupImageId) {
    throw new Error('Group image ID is required to fetch the group image');
  }

  try {
    let fileUrl = await storage.getFileViewURL(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_IMAGES_ID,
      groupImageId
    );

    fileUrl += `?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;
    return fileUrl;
  } catch (error) {
    console.error('Error fetching group image:', error);
    throw error;
  }
}