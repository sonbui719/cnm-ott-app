import Constants from "expo-constants";
import { Platform } from "react-native";

const fallbackBaseUrl = Platform.select({
  android: "http://10.0.2.2:5000/api",
  ios: "http://localhost:5000/api",
  default: "http://localhost:5000/api",
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  fallbackBaseUrl ||
  "http://localhost:5000/api";