import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { MotiView } from 'moti';
import { Microphone, Stop } from 'phosphor-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface Props {
  onRecordingComplete: (uri: string) => void;
}

/**
 * NativeVoiceRecorder component for high-quality audio recording.
 * Uses expo-av for recording and moti for pulsating animations.
 * Theme: Dossier & Seal (Wax Red)
 */
export const NativeVoiceRecorder: React.FC<Props> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      // Check and request microphone permissions
      if (permissionResponse?.status !== 'granted') {
        const response = await requestPermission();
        if (response.status !== 'granted') {
          console.warn('Microphone permission not granted');
          return;
        }
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      console.log('Stopping recording..');
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      if (uri) {
        onRecordingComplete(uri);
      }
      
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  return (
    <StyledView className="items-center justify-center p-8">
      <View className="relative items-center justify-center">
        {/* Pulsating animation background when recording */}
        {isRecording && (
          <MotiView
            from={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: '#9A3412', // Wax Red
                borderRadius: 9999,
              },
            ]}
          />
        )}
        
        {/* Main Recording Button */}
        <StyledTouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.8}
          className="w-24 h-24 rounded-full items-center justify-center z-10 shadow-lg"
          style={{ backgroundColor: '#9A3412' }}
        >
          {isRecording ? (
            <Stop size={40} color="white" weight="fill" />
          ) : (
            <Microphone size={40} color="white" weight="fill" />
          )}
        </StyledTouchableOpacity>
      </View>
      
      <StyledText className="mt-8 text-stone-800 font-semibold tracking-[-0.5] uppercase text-xs">
        {isRecording ? 'Capturing Evidence...' : 'Record Statement'}
      </StyledText>
      
      <StyledText className="mt-2 text-stone-500 text-sm text-center">
        {isRecording 
          ? 'Tap the seal to finalize recording' 
          : 'Your statement will be transcribed by the Neural Core'}
      </StyledText>
    </StyledView>
  );
};
