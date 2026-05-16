import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { MotiView } from 'moti';
import { Microphone, ArrowRight, Stop } from 'phosphor-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Props {
  onVoiceComplete: (uri: string) => void;
  onTextSubmit: (text: string) => void;
}

/**
 * HybridIntake component redesigned for consistency with LegalArtifact cards.
 */
export const HybridIntake: React.FC<Props> = ({ onVoiceComplete, onTextSubmit }) => {
  const [textValue, setTextValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        const response = await requestPermission();
        if (response.status !== 'granted') return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      if (uri) onVoiceComplete(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  const handleActionPress = () => {
    if (textValue.length > 0) {
      onTextSubmit(textValue.trim());
      setTextValue('');
    } else {
      isRecording ? stopRecording() : startRecording();
    }
  };

  return (
    <StyledView 
      className="flex-row items-center p-3 bg-parchment-50 border-2 border-midnight/20 rounded shadow-sm mb-4 mx-4"
    >
      <StyledTextInput
        className="flex-1 min-h-[48px] max-h-[120px] text-midnight text-base font-serif border-b-2 border-midnight/10 pb-1"
        placeholder="Describe your case..."
        placeholderTextColor="#1E293B60"
        multiline
        value={textValue}
        onChangeText={setTextValue}
        testID="text-input"
      />
      
      <StyledView className="items-center justify-center w-14 h-14 ml-3">
        {isRecording && (
          <MotiView
            from={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ type: 'timing', duration: 1500, loop: true }}
            style={[StyleSheet.absoluteFillObject, { backgroundColor: '#9A3412', borderRadius: 9999 }]}
          />
        )}
        
        <StyledTouchableOpacity
          onPress={handleActionPress}
          activeOpacity={0.8}
          className="w-14 h-14 rounded-full items-center justify-center bg-wax shadow-md z-10"
          testID="action-button"
        >
          {textValue.length > 0 ? (
            <ArrowRight size={28} color="white" weight="bold" testID="submit-icon" />
          ) : isRecording ? (
            <Stop size={28} color="white" weight="fill" />
          ) : (
            <Microphone size={28} color="white" weight="fill" testID="mic-icon" />
          )}
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
