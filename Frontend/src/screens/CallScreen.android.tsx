import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ZegoUIKitPrebuiltCall,
} from "@zegocloud/zego-uikit-prebuilt-call-rn";

export default function CallScreen() {
  const router = useRouter();
  const { id, userID, userName, type } = useLocalSearchParams();

  const isVideoCall = type === "video";

  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltCall
        appID={1505860244}
        appSign="da137350189845e1937aa46352ffb62477d912b9ff10ef3f8962bde6633fed8c"
        userID={userID as string}
        userName={userName as string}
        callID={id as string}
        config={{
          ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          turnOnCameraWhenJoining: isVideoCall,
          onCallEnd: () => {
            router.back();
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});
