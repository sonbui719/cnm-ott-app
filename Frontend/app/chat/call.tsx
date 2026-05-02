import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CallScreen() {
    const router = useRouter();
    const { id, userID, userName } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltCall
                appID={1505860244}
                appSign={"da137350189845e1937aa46352ffb62477d912b9ff10ef3f8962bde6633fed8c"}
                userID={userID as string}
                userName={userName as string}
                callID={id as string}
                config={{
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onCallEnd: () => {
                        router.back();
                    },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});