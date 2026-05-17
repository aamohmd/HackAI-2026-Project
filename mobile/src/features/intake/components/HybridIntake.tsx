import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native';
import { Audio } from 'expo-av';
import { MotiView } from 'moti';
import { Microphone, ArrowRight, Stop, Keyboard } from 'phosphor-react-native';
import { styled } from 'nativewind';
import * as Haptics from 'expo-haptics';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledTextComponent = styled(Text);

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
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        const response = await requestPermission();
        if (response.status !== 'granted') return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = newRecording;
      setIsRecording(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    try {
      setIsRecording(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      if (uri) onVoiceComplete(uri);
      recordingRef.current = null;
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  const handleActionPress = () => {
    if (inputMode === 'text') {
      if (textValue.length > 0) {
        onTextSubmit(textValue.trim());
        setTextValue('');
      } else {
        setInputMode('voice');
      }
    } else {
      isRecording ? stopRecording() : startRecording();
    }
  };

  if (inputMode === 'voice') {
    return (
      <StyledView className="items-center py-6 bg-parchment-100 w-full">
        {/* Mic button + rings */}
        <StyledView className="items-center justify-center mb-5">
          {/* 3 concentric idle pulse rings — only visible when NOT recording */}
          {!isRecording && (
            <>
              {[2200, 2800, 3400].map((duration, i) => (
                <MotiView
                  key={i}
                  from={{ scale: 0.85, opacity: 0.35 - i * 0.08 }}
                  animate={{ scale: 1.55 + i * 0.2, opacity: 0 }}
                  transition={{ type: 'timing', duration, loop: true, delay: i * 350 }}
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: '#9A3412', borderRadius: 9999 },
                  ]}
                />
              ))}
            </>
          )}

          {/* Recording live-pulse ring */}
          {isRecording && (
            <MotiView
              from={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ type: 'timing', duration: 1400, loop: true }}
              style={[StyleSheet.absoluteFillObject, { backgroundColor: '#9A3412', borderRadius: 9999 }]}
            />
          )}

          <StyledPressable
            onPress={isRecording ? stopRecording : startRecording}
            className="size-48 rounded-full items-center justify-center bg-wax shadow-lg z-10 active:opacity-80 border-[8px] border-wax/20"
            testID="main-mic-button"
          >
            {isRecording ? (
              <Stop size={56} color="white" weight="fill" />
            ) : (
              <Microphone size={56} color="white" weight="fill" />
            )}
          </StyledPressable>
        </StyledView>

        {/* Darija call-to-action label */}
        <StyledTextComponent
          className="text-midnight font-bold text-2xl font-serif text-center mb-1"
          style={{ letterSpacing: 1 }}
        >
          {isRecording ? 'كنسمعك...' : 'حكي معايا'}
        </StyledTextComponent>
        <StyledTextComponent className="text-midnight/40 text-sm font-sans text-center mb-4">
          {isRecording ? 'دغيا على زر الوقف' : 'دغيا على الميكروفون وحكي'}
        </StyledTextComponent>

        {/* Demoted secondary text input affordance */}
        <StyledPressable
          onPress={() => setInputMode('text')}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full opacity-50"
          testID="switch-to-text-button"
        >
          <Keyboard size={13} color="#1E293B" />
          <StyledTextComponent className="text-midnight/60 font-sans text-[11px] uppercase tracking-[1]">
            كتابة
          </StyledTextComponent>
        </StyledPressable>
      </StyledView>
    );
  }

  return (
    <StyledView 
      className="flex-row items-center px-5 py-3 bg-parchment-100"
    >
      <StyledTextInput
        className="flex-1 min-h-[48px] max-h-[120px] text-midnight text-base font-serif border-b-2 border-midnight/10 pb-1"
        placeholder="اكتب هنا..."
        placeholderTextColor="#1E293B60"
        multiline
        value={textValue}
        onChangeText={setTextValue}
        testID="text-input"
        autoFocus
        textAlign="right"
      />
      
      <StyledView className="items-center justify-center size-14 ml-3">
        <StyledPressable
          onPress={handleActionPress}
          className={`size-14 rounded-full items-center justify-center shadow-md z-10 active:opacity-80 ${
            textValue.length > 0 ? 'bg-midnight border-4 border-midnight/20' : 'bg-wax border-4 border-wax/20'
          }`}
          testID="action-button"
        >
          {textValue.length > 0 ? (
            <ArrowRight size={24} color="white" weight="bold" testID="submit-icon" />
          ) : (
            <Microphone size={24} color="white" weight="fill" testID="mic-icon" />
          )}
        </StyledPressable>
      </StyledView>
    </StyledView>
  );
};
