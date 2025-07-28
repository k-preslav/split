import { Dimensions, PixelRatio, Platform } from "react-native";
import * as Device from 'expo-device';

export let deviceInfo = {
  deviceModel: '',
  devicePlatform: '',
  devicePlatformVersion: '',
  deviceScreenResolution: '',
}

export function getDeviceInfo() {
  deviceInfo.deviceModel = `${Device.manufacturer} ${Device.modelName}` || 'Unknown Device';

  deviceInfo.devicePlatform = Platform.OS;
  if (deviceInfo.devicePlatform === 'android') 
    deviceInfo.devicePlatformVersion = Platform.constants.Release;
  else if (deviceInfo.devicePlatform === 'ios')
    deviceInfo.devicePlatformVersion = Platform.Version;

  const { width, height } = Dimensions.get('screen');
  const scale = PixelRatio.get();
  deviceInfo.deviceScreenResolution = `${Math.round(width * scale)}x${Math.round(height * scale)}`;
}