import { Query } from "react-native-appwrite";
import { databases } from "./appwrite";
import { updateUserCollectionDocumentId } from "./updateUser";
import { userDetails } from "./userDetails";
import { deviceInfo } from "../global/deviceInfo";
import dayjs from "dayjs";
import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import { colorScheme } from "../components/themes/colors";
import { isAppLaunched } from "../app";
import { isAppLaunchTracked, markAppLaunchTracked, unmarkAppLaunchTracked } from "./appLaunch";

export async function createDataCollection() {
  try {
    try {
      const exists = await databases.getDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_APPWRITE_DATACOLLECT_COLLECTION_ID,
        userDetails.userProfile?.dataCollectionDocumentId
      );

      if (exists) {
        return false;
      }
    } catch (error) {
      if (error.code === 404) {
        console.log('Creating new data collection document for user...');
      } else {
        console.error('Error while checking if data collection document exists:', error, error.code);
        return false;
      }
    }

    // If it doesnt exist, create a new data collection document
    const response = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_DATACOLLECT_COLLECTION_ID,
      'unique()',
      { placeholder: 0 },
    );

    const docId = response.$id;
    if (docId) {
      await updateUserCollectionDocumentId(docId);
      return true;
    } else {
      throw new Error('Failed to create data collection document, no ID returned');
    }

  } catch (error) {
    console.error('Error creating data collection document:', error);
    throw error;
  }
}

export async function updateDataCollection(data) {
  try {
    const res = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_DATACOLLECT_COLLECTION_ID,
      userDetails.userProfile?.dataCollectionDocumentId,
      data
    );

    return res;
  } catch (error) {
    console.error('Error updating data collection document:', error);
    throw error;
  }
}

export async function getDataCollectionDocument() {
  try {
    const document = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_DATACOLLECT_COLLECTION_ID,
      userDetails.userProfile?.dataCollectionDocumentId
    );

    return document;
  } catch (error) {
    console.error('Error fetching data collection document:', error);
    throw error;
  }
}

export async function updateDeviceInfo() {
  const dataCollectionDoc = await getDataCollectionDocument();
  if (dataCollectionDoc) {
    const savedDeviceInfo = {
      deviceModel: dataCollectionDoc.deviceModel,
      devicePlatform: dataCollectionDoc.devicePlatform,
      devicePlatformVersion: dataCollectionDoc.devicePlatformVersion,
      deviceScreenResolution: dataCollectionDoc.deviceScreenResolution,
    };

    // console.log('Device Info:', deviceInfo);
    // console.log('Saved Device Info:', savedDeviceInfo);

    if (JSON.stringify(savedDeviceInfo) !== JSON.stringify(deviceInfo)) {
      const res = await updateDataCollection(deviceInfo);
      if (res) {
        console.log('Device info updated successfully');
      } else {
        console.error('Failed to update device info');
      }
    }
  }
}

export async function updateUserLoginTime() {
  const now = dayjs().toISOString();
  const dataCollectionDoc = await getDataCollectionDocument();

  const logins = dataCollectionDoc?.userLoginTimes || [];
  logins.push(now);

  // Keep only the last 30 login times
  const recentLogins = logins.slice(-30);

  const res = await updateDataCollection({ userLoginTimes: recentLogins });
  console.log(res ? 'Updated user login times' : 'Failed to update user login times');
}

export let sessionStart = null;
export function startUserSession() {
  sessionStart = dayjs();
}

export async function endUserSession() {
  if (!sessionStart) return;

  const sessionEnd = dayjs();
  const durationSeconds = sessionEnd.diff(sessionStart, 'second');

  const dataCollectionDoc = await getDataCollectionDocument();
  const durations = dataCollectionDoc?.userSessionDurations || [];

  durations.push(durationSeconds);

  // Keep only last 30 session durations
  const recentDurations = durations.slice(-30);

  const res = await updateDataCollection({ userSessionDurations: recentDurations });
  console.log(res ? 'Updated session durations' : 'Failed to update session durations');

  sessionStart = null; // reset session start for next session
}

export async function updateAppStartupDuration(durationMs) {
  if (typeof durationMs !== 'number' || durationMs <= 0) {
    console.error('Invalid duration provided for app startup duration');
    return false;
  }

  const dataCollectionDoc = await getDataCollectionDocument();
  
  const startupDurations = dataCollectionDoc?.appStartupDurations || [];

  startupDurations.push(durationMs);

  // Keep only last 30 startup durations
  const recentDurations = startupDurations.slice(-30);

  const res = await updateDataCollection({ appStartupDurations: recentDurations });
  console.log(res ? 'Updated app startup durations' : 'Failed to update app startup durations');
}

export async function updateAppVersionInfo() {
  const dataCollectionDoc = await getDataCollectionDocument();
  const savedVersion = dataCollectionDoc?.appVersion;

  const getCurrentVersion = () => {
    if (Constants.executionEnvironment !== "storeClient") {
      return require('../package.json').version;
    }
    return Application.nativeApplicationVersion;
  };
  const currentAppVersion = getCurrentVersion();

  if (savedVersion !== currentAppVersion) {
    const res = await updateDataCollection({ appVersion: currentAppVersion });
    console.log(res ? 'Updated app version info' : 'Failed to update app version info');
  }
}

export async function updateUiThemeInfo() {
  const dataCollectionDoc = await getDataCollectionDocument();
  const savedTheme = dataCollectionDoc?.uiTheme;

  const currentTheme = colorScheme;

  if (savedTheme !== currentTheme) {
    const res = await updateDataCollection({ uiTheme: currentTheme });
    console.log(res ? 'Updated UI theme info' : 'Failed to update UI theme info');
  }
}

export async function updateIsDataCollectionEnabled(value) {
  if (typeof value !== 'boolean') {
    console.error('Invalid value provided for isDataCollectionEnabled');
    return false;
  }

  const res = await updateDataCollection({ isDataCollectionEnabled: value });
  if (res) {
    console.log('Data collection enabled status updated successfully:', value);
  } else {
    console.error('Failed to update data collection enabled status');
  }
}