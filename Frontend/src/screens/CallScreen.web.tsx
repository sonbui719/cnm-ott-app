import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAuthSession } from "../store/authStore";
import { getSocket, initiateSocket } from "../services/socket";

const ZEGO_APP_ID = 1505860244;
const ZEGO_SERVER_SECRET = "da137350189845e1937aa46352ffb62477d912b9ff10ef3f8962bde6633fed8c";

export default function WebCallScreen() {
  const router = useRouter();
  const {
    id,
    callId,
    userID,
    userName,
    type,
    role,
    accepted,
    callerId,
  } = useLocalSearchParams();

  const session = getAuthSession();
  const roomID = String(callId || id || "default-room");
  const safeUserID = String(userID || session?.user?.id || Math.floor(Math.random() * 100000));
  const safeUserName = String(userName || session?.user?.fullName || safeUserID);
  const isCaller = role === "caller";
  const isVideoCall = type === "video";
  const [isAccepted, setIsAccepted] = useState(accepted === "true" || !isCaller);
  const [callStatus, setCallStatus] = useState("Dang goi...");

  useEffect(() => {
    const socket = getSocket() || (session?.user?.id ? initiateSocket(session.user.id) : null);
    if (!socket || !isCaller) return;

    const handleAccepted = (data: any) => {
      if (String(data.callId || data.conversationId) !== roomID) return;
      setIsAccepted(true);
      setCallStatus("Da ket noi");
    };

    const handleRejected = (data: any) => {
      if (String(data.callId || data.conversationId) !== roomID) return;
      setCallStatus("Nguoi nhan da tu choi cuoc goi");
      setTimeout(() => router.back(), 1000);
    };

    socket.on("call_accepted", handleAccepted);
    socket.on("call_rejected", handleRejected);

    return () => {
      socket.off("call_accepted", handleAccepted);
      socket.off("call_rejected", handleRejected);
    };
  }, [isCaller, roomID, router, session?.user?.id]);

  const endCall = () => {
    const socket = getSocket();
    if (isCaller) {
      socket?.emit("reject_call", {
        callId: roomID,
        conversationId: id,
        callerId: safeUserID,
      });
    } else if (callerId) {
      socket?.emit("reject_call", {
        callId: roomID,
        conversationId: id,
        callerId,
      });
    }
    router.back();
  };

  const srcDoc = useMemo(() => {
    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body, #root { width: 100%; height: 100%; margin: 0; background: #050505; overflow: hidden; }
      #status {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #cbd5e1;
        font-family: Arial, sans-serif;
        background: #050505;
        z-index: 1;
        white-space: pre-line;
        text-align: center;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <div id="status">Dang mo phong goi...</div>
    <div id="root"></div>
    <script src="https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js" onerror="document.getElementById('status').innerText='Khong tai duoc Zego Web SDK. Kiem tra internet hoac unpkg.com bi chan.'"></script>
    <script>
      window.addEventListener("load", function () {
        try {
          if (!window.ZegoUIKitPrebuilt) {
            document.getElementById("status").innerText = "Zego Web SDK chua san sang.";
            return;
          }

          const appID = ${ZEGO_APP_ID};
          const serverSecret = ${JSON.stringify(ZEGO_SERVER_SECRET)};
          const roomID = ${JSON.stringify(roomID)};
          const userID = ${JSON.stringify(safeUserID)};
          const userName = ${JSON.stringify(safeUserName)};
          const token = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);
          const zp = ZegoUIKitPrebuilt.create(token);
          document.getElementById("status").style.display = "none";
          zp.joinRoom({
            container: document.querySelector("#root"),
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            showPreJoinView: false,
            turnOnCameraWhenJoining: ${isVideoCall ? "true" : "false"},
            showMyCameraToggleButton: ${isVideoCall ? "true" : "false"},
            showAudioVideoSettingsButton: true,
            onLeaveRoom: function () {
              window.parent.postMessage({ type: "zego-leave-room" }, "*");
            }
          });
        } catch (error) {
          document.getElementById("status").innerText =
            "Khong mo duoc Zego Web Call.\\n" +
            (error && error.message ? error.message : String(error)) +
            "\\nKiem tra Zego ServerSecret web trong console.";
        }
      });
    </script>
  </body>
</html>`;
  }, [isVideoCall, roomID, safeUserID, safeUserName]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "zego-leave-room") {
        router.back();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  if (!isAccepted) {
    return (
      <View style={styles.waitContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{safeUserName[0]?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.waitTitle}>
          {isVideoCall ? "Dang goi video" : "Dang goi thoai"}
        </Text>
        <Text style={styles.waitSubtitle}>{callStatus}</Text>
        <View style={styles.pulseRow}>
          <View style={styles.pulseDot} />
          <View style={styles.pulseDot} />
          <View style={styles.pulseDot} />
        </View>
        <Pressable style={styles.endButton} onPress={endCall}>
          <Text style={styles.endButtonText}>Huy cuoc goi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <iframe
        title="Zego call"
        srcDoc={srcDoc}
        allow="camera; microphone; autoplay; clipboard-write; fullscreen"
        style={styles.iframe as React.CSSProperties}
      />
      <Pressable style={styles.backButton} onPress={endCall}>
        <Text style={styles.backButtonText}>Thoat</Text>
      </Pressable>
      <Text style={styles.hint}>
        Neu man hinh van den, kiem tra internet, quyen Camera/Micro va Zego ServerSecret web.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  waitContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505",
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e5eff",
    marginBottom: 22,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
  },
  waitTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  waitSubtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 10,
  },
  pulseRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    marginBottom: 36,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  endButton: {
    borderRadius: 999,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  endButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  iframe: {
    width: "100%",
    height: "100vh",
    border: 0,
    backgroundColor: "#050505",
  } as any,
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  hint: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
});
