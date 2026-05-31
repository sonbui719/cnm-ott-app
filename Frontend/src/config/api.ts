import Constants from "expo-constants";
import { Platform } from "react-native";

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined);

const platformBaseUrls = Platform.select({
  android: [
    "http://127.0.0.1:5000/api",
    "http://192.168.1.36:5000/api",
  ],
  ios: ["http://localhost:5000/api", "http://127.0.0.1:5000/api"],
  web: ["http://localhost:5000/api", "http://127.0.0.1:5000/api"],
  default: ["http://localhost:5000/api", "http://127.0.0.1:5000/api"],
});

const configuredUrls = Platform.OS === "android" ? [] : [configuredBaseUrl];

export const API_BASE_URLS = Array.from(
  new Set([...(platformBaseUrls || []), ...configuredUrls].filter(Boolean))
) as string[];

export const API_BASE_URL = API_BASE_URLS[0] || "http://localhost:5000/api";
