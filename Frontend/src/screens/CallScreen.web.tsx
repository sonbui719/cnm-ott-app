import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuthSession } from "../store/authStore";
import { getSocket, initiateSocket } from "../services/socket";

type RemotePeer = {
  socketId: string;
  userId?: string;
  name: string;
  stream?: MediaStream;
};

type MediaTileProps = {
  name: string;
  stream?: MediaStream | null;
  muted?: boolean;
  isLocal?: boolean;
  fallback?: string;
};

const getParam = (value: string | string[] | undefined, fallback = "") => {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
};

function MediaTile({ name, stream, muted, isLocal, fallback }: MediaTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasVideo = !!stream?.getVideoTracks().length;
  const initial = (fallback || name || "U").trim()[0]?.toUpperCase() || "U";

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <View style={[styles.tile, isLocal && styles.localTile]}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          ...(styles.tileVideo as React.CSSProperties),
          opacity: hasVideo ? 1 : 0,
        }}
      />
      {!hasVideo && (
        <View style={styles.tilePlaceholder}>
          <View style={[styles.tileAvatar, isLocal && styles.localAvatar]}>
            <Text style={styles.tileAvatarText}>{initial}</Text>
          </View>
        </View>
      )}
      <View style={styles.nameBadge}>
        <Text style={styles.nameBadgeText}>{isLocal ? "Ban" : name}</Text>
      </View>
    </View>
  );
}

export default function WebCallScreen() {
  const router = useRouter();
  const { id, callId, userID, userName, remoteName, type, role, accepted, callerId, isGroupCall } =
    useLocalSearchParams();

  const session = getAuthSession();
  const conversationId = getParam(id as any);
  const roomID = getParam(callId as any, conversationId || "default-room");
  const safeUserID = getParam(userID as any, session?.user?.id || String(Date.now()));
  const safeUserName = getParam(userName as any, session?.user?.fullName || safeUserID);
  const remoteDisplayName = getParam(remoteName as any, "Nguoi dung");
  const isCaller = role === "caller";
  const requestedVideo = type === "video";
  const groupCall = isGroupCall === "true";

  const [isAccepted, setIsAccepted] = useState(accepted === "true" || !isCaller);
  const [callStatus, setCallStatus] = useState("Dang goi...");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Record<string, RemotePeer>>({});
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(requestedVideo);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const endedRef = useRef(false);

  const remoteList = Object.values(remotePeers);
  const participantCount = remoteList.length + (localStream ? 1 : 0);
  const titleName = groupCall ? remoteDisplayName : remoteList[0]?.name || remoteDisplayName;

  useEffect(() => {
    const socket = getSocket() || initiateSocket(safeUserID);
    if (!socket || !isCaller) return;

    const handleAccepted = (data: any) => {
      if (String(data.callId || data.conversationId) !== roomID) return;
      setIsAccepted(true);
      setCallStatus("Dang ket noi...");
    };

    const handleRejected = (data: any) => {
      if (String(data.callId || data.conversationId) !== roomID) return;
      if (groupCall) {
        setCallStatus(`${data.rejectedUserName || "Mot thanh vien"} da tu choi`);
        return;
      }

      setCallStatus("Nguoi nhan da tu choi cuoc goi");
      setTimeout(() => router.back(), 1000);
    };

    socket.on("call_accepted", handleAccepted);
    socket.on("call_rejected", handleRejected);

    return () => {
      socket.off("call_accepted", handleAccepted);
      socket.off("call_rejected", handleRejected);
    };
  }, [groupCall, isCaller, roomID, router, safeUserID]);

  useEffect(() => {
    if (!isAccepted) return;

    const socket = getSocket() || initiateSocket(safeUserID);
    if (!socket) {
      setCallStatus("Mat ket noi may chu");
      return;
    }

    let active = true;

    const updateRemotePeer = (socketId: string, patch: Partial<RemotePeer>) => {
      setRemotePeers((prev) => ({
        ...prev,
        [socketId]: {
          socketId,
          name: patch.name || prev[socketId]?.name || "Thanh vien",
          ...prev[socketId],
          ...patch,
        },
      }));
    };

    const closePeer = (socketId: string) => {
      peersRef.current.get(socketId)?.close();
      peersRef.current.delete(socketId);
      pendingIceRef.current.delete(socketId);
      setRemotePeers((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const cleanupCall = () => {
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      pendingIceRef.current.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setRemotePeers({});
    };

    const flushPendingIce = async (socketId: string, peer: RTCPeerConnection) => {
      const pending = pendingIceRef.current.get(socketId) || [];
      pendingIceRef.current.delete(socketId);

      for (const candidate of pending) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const getOrCreatePeer = (remoteSocketId: string, remoteUserId?: string, remoteUserName?: string) => {
      const existingPeer = peersRef.current.get(remoteSocketId);
      if (existingPeer) return existingPeer;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      localStreamRef.current?.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current as MediaStream);
      });

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;

        updateRemotePeer(remoteSocketId, {
          userId: remoteUserId,
          name: remoteUserName || "Thanh vien",
          stream,
        });
        setCallStatus("Dang trong cuoc goi");
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;
        socket.emit("webrtc_ice_candidate", {
          callId: roomID,
          senderId: safeUserID,
          senderName: safeUserName,
          targetSocketId: remoteSocketId,
          candidate: event.candidate,
        });
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
          setCallStatus("Dang trong cuoc goi");
        } else if (peer.connectionState === "failed") {
          setCallStatus("Ket noi khong on dinh");
        } else if (peer.connectionState === "disconnected") {
          setCallStatus("Dang ket noi lai...");
        } else if (peer.connectionState === "closed") {
          closePeer(remoteSocketId);
        }
      };

      peersRef.current.set(remoteSocketId, peer);
      updateRemotePeer(remoteSocketId, {
        userId: remoteUserId,
        name: remoteUserName || "Thanh vien",
      });
      return peer;
    };

    const sendOfferToPeer = async (remoteSocketId: string, remoteUserId?: string, remoteUserName?: string) => {
      const peer = getOrCreatePeer(remoteSocketId, remoteUserId, remoteUserName);
      if (peer.signalingState !== "stable" || endedRef.current) return;

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: requestedVideo,
      });
      await peer.setLocalDescription(offer);
      socket.emit("webrtc_offer", {
        callId: roomID,
        senderId: safeUserID,
        senderName: safeUserName,
        targetSocketId: remoteSocketId,
        description: peer.localDescription,
      });
      setCallStatus("Dang moi thanh vien vao phong...");
    };

    const handlePeerJoined = (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id) return;
      sendOfferToPeer(data.senderSocketId, data.senderId, data.senderName).catch(() => {
        setCallStatus("Khong tao duoc ket noi voi thanh vien");
      });
    };

    const handleOffer = async (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id) return;
      const remoteSocketId = String(data.senderSocketId || data.senderId || "");
      if (!remoteSocketId) return;

      const peer = getOrCreatePeer(remoteSocketId, data.senderId, data.senderName);
      if (peer.signalingState === "have-local-offer") {
        await peer.setLocalDescription({ type: "rollback" } as RTCSessionDescriptionInit);
      } else if (peer.signalingState !== "stable") {
        return;
      }

      await peer.setRemoteDescription(new RTCSessionDescription(data.description));
      await flushPendingIce(remoteSocketId, peer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("webrtc_answer", {
        callId: roomID,
        senderId: safeUserID,
        senderName: safeUserName,
        targetSocketId: remoteSocketId,
        description: peer.localDescription,
      });
    };

    const handleAnswer = async (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id) return;
      const remoteSocketId = String(data.senderSocketId || data.senderId || "");
      const peer = peersRef.current.get(remoteSocketId);
      if (!peer || peer.signalingState !== "have-local-offer") return;

      await peer.setRemoteDescription(new RTCSessionDescription(data.description));
      await flushPendingIce(remoteSocketId, peer);
    };

    const handleIceCandidate = async (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id) return;
      const remoteSocketId = String(data.senderSocketId || data.senderId || "");
      if (!remoteSocketId || !data.candidate) return;

      const peer = peersRef.current.get(remoteSocketId);
      if (!peer || !peer.remoteDescription) {
        const pending = pendingIceRef.current.get(remoteSocketId) || [];
        pending.push(data.candidate);
        pendingIceRef.current.set(remoteSocketId, pending);
        return;
      }

      await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    };

    const handleCallEnded = (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id || endedRef.current) return;
      if (groupCall) {
        const remoteSocketId = String(data.senderSocketId || "");
        if (remoteSocketId) closePeer(remoteSocketId);
        setCallStatus("Mot thanh vien da roi phong");
        return;
      }

      endedRef.current = true;
      setCallStatus("Cuoc goi da ket thuc");
      cleanupCall();
      setTimeout(() => router.back(), 800);
    };

    const handlePeerLeft = (data: any) => {
      if (String(data.callId) !== roomID || data.senderSocketId === socket.id) return;

      const remoteSocketId = String(data.senderSocketId || "");
      if (remoteSocketId) closePeer(remoteSocketId);
      setCallStatus("Mot thanh vien da roi phong");
    };

    const openLocalMedia = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trinh duyet khong ho tro goi truc tuyen");
      }

      if (!requestedVideo) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setCameraEnabled(false);
        return audioStream;
      }

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user" },
        });
        setCameraEnabled(videoStream.getVideoTracks().some((track) => track.enabled));
        return videoStream;
      } catch {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setCameraEnabled(false);
        setCallStatus("Camera dang ban, da chuyen sang am thanh");
        return audioOnlyStream;
      }
    };

    const startMedia = async () => {
      try {
        setCallStatus("Dang chuan bi cuoc goi...");
        const stream = await openLocalMedia();

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        setCallStatus("Dang vao phong...");

        socket.emit("call_joined", {
          callId: roomID,
          conversationId,
          senderId: safeUserID,
          senderName: safeUserName,
        });
      } catch {
        setMicEnabled(false);
        setCameraEnabled(false);
        setCallStatus("Khong the truy cap micro hoac camera");
      }
    };

    const handleOfferEvent = (data: any) => {
      handleOffer(data).catch(() => setCallStatus("Khong ket noi duoc voi thanh vien"));
    };
    const handleAnswerEvent = (data: any) => {
      handleAnswer(data).catch(() => setCallStatus("Khong nhan duoc phan hoi cuoc goi"));
    };
    const handleIceCandidateEvent = (data: any) => {
      handleIceCandidate(data).catch(() => setCallStatus("Ket noi mang khong on dinh"));
    };

    socket.on("call_peer_joined", handlePeerJoined);
    socket.on("webrtc_offer", handleOfferEvent);
    socket.on("webrtc_answer", handleAnswerEvent);
    socket.on("webrtc_ice_candidate", handleIceCandidateEvent);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_peer_left", handlePeerLeft);

    startMedia();

    return () => {
      active = false;
      socket.off("call_peer_joined", handlePeerJoined);
      socket.off("webrtc_offer", handleOfferEvent);
      socket.off("webrtc_answer", handleAnswerEvent);
      socket.off("webrtc_ice_candidate", handleIceCandidateEvent);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_peer_left", handlePeerLeft);
      cleanupCall();
    };
  }, [
    conversationId,
    groupCall,
    isAccepted,
    requestedVideo,
    roomID,
    router,
    safeUserID,
    safeUserName,
  ]);

  const endCall = () => {
    if (endedRef.current) return;
    endedRef.current = true;

    const socket = getSocket();
    socket?.emit("call_end", {
      callId: roomID,
      conversationId,
      senderId: safeUserID,
      isGroupCall: groupCall,
    });

    if (!isAccepted && callerId) {
      socket?.emit("reject_call", {
        callId: roomID,
        conversationId,
        callerId,
      });
    }

    peersRef.current.forEach((peer) => peer.close());
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    router.back();
  };

  const toggleMic = () => {
    const nextValue = !micEnabled;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = nextValue;
    });
    setMicEnabled(nextValue);
  };

  const toggleCamera = () => {
    const videoTracks = localStreamRef.current?.getVideoTracks() || [];
    if (!videoTracks.length) {
      setCallStatus("Camera khong kha dung tren trinh duyet nay");
      return;
    }

    const nextValue = !cameraEnabled;
    videoTracks.forEach((track) => {
      track.enabled = nextValue;
    });
    setCameraEnabled(nextValue);
  };

  if (!isAccepted) {
    return (
      <View style={styles.waitContainer}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{titleName.trim()[0]?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.waitTitle}>{titleName}</Text>
        <Text style={styles.waitSubtitle}>
          {requestedVideo ? "Dang goi video..." : "Dang goi thoai..."}
        </Text>
        <View style={styles.pulseRow}>
          <View style={styles.pulseDot} />
          <View style={styles.pulseDot} />
          <View style={styles.pulseDot} />
        </View>
        <Pressable style={styles.endButtonLarge} onPress={endCall}>
          <Text style={styles.endButtonText}>Huy cuoc goi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.exitButton} onPress={endCall}>
          <Text style={styles.exitText}>Thoat</Text>
        </Pressable>
        <View style={styles.callInfo}>
          <Text style={styles.peerName}>{titleName}</Text>
          <Text style={styles.peerStatus}>
            {participantCount} nguoi tham gia - {callStatus}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {remoteList.map((peer) => (
          <MediaTile
            key={peer.socketId}
            name={peer.name}
            stream={peer.stream}
            fallback={peer.name}
          />
        ))}
        <MediaTile name={safeUserName} stream={localStream} muted isLocal fallback={safeUserName} />
      </View>

      {!remoteList.length && (
        <View style={styles.emptyState}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.avatarLargeText}>{titleName.trim()[0]?.toUpperCase() || "U"}</Text>
          </View>
          <Text style={styles.placeholderName}>{groupCall ? "Dang cho thanh vien" : titleName}</Text>
          <Text style={styles.placeholderStatus}>{callStatus}</Text>
        </View>
      )}

      <View style={styles.controls}>
        <Pressable
          style={[styles.controlButton, !micEnabled && styles.controlButtonOff]}
          onPress={toggleMic}
        >
          <Ionicons name={micEnabled ? "mic" : "mic-off"} size={24} color="#ffffff" />
          <Text style={styles.controlLabel}>{micEnabled ? "Mic" : "Tat mic"}</Text>
        </Pressable>
        {requestedVideo && (
          <Pressable
            style={[styles.controlButton, !cameraEnabled && styles.controlButtonOff]}
            onPress={toggleCamera}
          >
            <Ionicons name={cameraEnabled ? "videocam" : "videocam-off"} size={24} color="#ffffff" />
            <Text style={styles.controlLabel}>{cameraEnabled ? "Cam" : "Tat cam"}</Text>
          </Pressable>
        )}
        <Pressable style={styles.endControlButton} onPress={endCall}>
          <Ionicons name="call" size={28} color="#ffffff" style={styles.endIcon as any} />
          <Text style={styles.controlLabel}>Ket thuc</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05070b",
    overflow: "hidden",
  },
  waitContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05070b",
    padding: 24,
  },
  topBar: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exitButton: {
    borderRadius: 999,
    backgroundColor: "rgba(10,15,25,0.72)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  callInfo: {
    minWidth: 0,
    borderRadius: 999,
    backgroundColor: "rgba(10,15,25,0.62)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  peerName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  peerStatus: {
    color: "#93c5fd",
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gridAutoRows: "minmax(210px, 1fr)",
    gap: 12,
    padding: 16,
    paddingTop: 74,
    paddingBottom: 104,
    backgroundColor: "#05070b",
  } as any,
  tile: {
    position: "relative",
    minHeight: 210,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  localTile: {
    borderColor: "rgba(59,130,246,0.42)",
  },
  tileVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#111827",
  } as any,
  tilePlaceholder: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  } as any,
  tileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  localAvatar: {
    backgroundColor: "#0f766e",
  },
  tileAvatarText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },
  nameBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    maxWidth: "82%",
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.56)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  nameBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyState: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  } as any,
  profileAvatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginBottom: 22,
  },
  profileAvatarLarge: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginBottom: 18,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "900",
  },
  avatarLargeText: {
    color: "#ffffff",
    fontSize: 52,
    fontWeight: "900",
  },
  waitTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  waitSubtitle: {
    color: "#a8b3c7",
    fontSize: 16,
    marginTop: 10,
  },
  placeholderName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  placeholderStatus: {
    color: "#a8b3c7",
    fontSize: 15,
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
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  } as any,
  controlButton: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(30,41,59,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  controlButtonOff: {
    backgroundColor: "rgba(100,116,139,0.78)",
  },
  controlText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  controlLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },
  endButtonLarge: {
    borderRadius: 999,
    backgroundColor: "#ef4444",
    paddingHorizontal: 26,
    paddingVertical: 15,
  },
  endControlButton: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#ef4444",
  },
  endIcon: {
    transform: [{ rotate: "135deg" }],
  },
  endButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
});
