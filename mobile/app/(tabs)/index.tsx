import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, ActivityIndicator, KeyboardAvoidingView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { SealCheck, Question, SpeakerHigh, Pause, User, MapPin, Calendar, File, Scales, IdentificationCard } from 'phosphor-react-native';
import { LegalResponse, TripleArtifactHUD } from '@/shared/ui/Legal';
import { HybridIntake } from '@/features/intake/components/HybridIntake';
import { LegalDossierState, intakeApi } from '@/features/intake/api/intake';
import { useI18n } from '@/context/I18nContext';
import { Audio } from 'expo-av';
import api from '@/shared/api/client';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledKAV = styled(KeyboardAvoidingView);
const StyledPressable = styled(Pressable);

// ─── Progress Bar ────────────────────────────────────────────
const DOSSIER_FIELDS = [
  { key: 'claimant_name',    Icon: User },
  { key: 'opponent_name',   Icon: IdentificationCard },
  { key: 'location',        Icon: MapPin },
  { key: 'date_of_incident', Icon: Calendar },
  { key: 'proof_type',      Icon: File },
  { key: 'description',     Icon: Scales },
] as const;

const DossierProgress = ({ state }: { state: LegalDossierState }) => {
  const filled = DOSSIER_FIELDS.filter(f => !!(state as any)[f.key]).length;
  return (
    <StyledView className="flex-row justify-center items-center gap-3 mb-6">
      {DOSSIER_FIELDS.map(({ key, Icon }, i) => {
        const done = !!(state as any)[key];
        return (
          <StyledView key={key} className={`items-center justify-center w-10 h-10 rounded-full border-2 ${
            done ? 'bg-wax border-wax' : 'bg-transparent border-midnight/15'
          }`}>
            <Icon size={16} color={done ? 'white' : '#1E293B40'} weight={done ? 'fill' : 'regular'} />
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export default function MobileHubScreen() {
  const insets = useSafeAreaInsets();
  const [caseState, setCaseState] = useState<LegalDossierState>({ is_complete: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentQuestion, setAgentQuestion] = useState<string | null>(null);
  const [nextQuestionAudioUrl, setNextQuestionAudioUrl] = useState<string | null>(null);
  const { t, locale } = useI18n();
  const isRTL = locale === 'ar';

  // Audio Playback State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async (urlPath: string) => {
    try {
      // Unload existing sound if any
      if (sound) {
        await sound.unloadAsync();
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const fullUrl = `${api.defaults.baseURL}${urlPath}`;
      console.log("Playing audio from:", fullUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setPlayingUrl(urlPath);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const handleRecordingComplete = async (uri: string) => {
    setIsProcessing(true);
    setAgentQuestion(null);
    setNextQuestionAudioUrl(null);
    // Stop any active audio
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
        }
      } catch (e) {
        console.log("Audio already stopped/unloaded");
      }
    }
    try {
      const response = await intakeApi.processVoice({
        uri,
        name: `recording_${Date.now()}.m4a`,
        type: 'audio/m4a'
      }, caseState);
      
      setCaseState(response.updated_state);
      setAgentQuestion(response.next_question);
      setNextQuestionAudioUrl(response.next_question_audio_url || null);

      // Auto-play intermediate question audio — wait for state to settle
      if (response.next_question_audio_url && !response.updated_state.is_complete) {
        await playAudio(response.next_question_audio_url);
      }
    } catch (err: any) {
      console.error("Error processing voice:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setIsProcessing(true);
    setAgentQuestion(null);
    setNextQuestionAudioUrl(null);
    // Stop any active audio
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
        }
      } catch (e) {
        console.log("Audio already stopped/unloaded");
      }
    }
    try {
      const response = await intakeApi.processText(text, caseState);
      setCaseState(response.updated_state);
      setAgentQuestion(response.next_question);
      setNextQuestionAudioUrl(response.next_question_audio_url || null);

      // Auto-play intermediate question audio — wait for state to settle
      if (response.next_question_audio_url && !response.updated_state.is_complete) {
        await playAudio(response.next_question_audio_url);
      }
    } catch (err: any) {
      console.error("Error processing text:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewCase = async () => {
    // Stop any active audio
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      } catch (e) {
        console.log("Audio already cleaned up");
      }
      setSound(null);
    }
    setCaseState({ is_complete: false });
    setAgentQuestion(null);
    setNextQuestionAudioUrl(null);
    setPlayingUrl(null);
    setIsPlaying(false);
  };

  return (
    // KAV as the flex root — it manages the whole screen when keyboard opens
    <StyledKAV
      className="flex-1 bg-parchment-100"
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Scrollable content area — grows to fill available space */}
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <StyledView className="mb-8 items-center">
          <StyledView className="w-16 h-1 bg-wax mb-4 rounded-full" />
          <StyledText className="text-4xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
            {t('welcome_title')}
          </StyledText>
          <StyledText className="text-midnight/50 italic mt-2 font-serif text-lg text-center">
            {t('dashboard_motto')}
          </StyledText>

          {/* Start New Case Shortcut */}
          {(caseState.description || caseState.mizan_result) && (
            <StyledPressable
              onPress={handleCreateNewCase}
              className="mt-4 bg-midnight/5 border border-midnight/10 px-4 py-1.5 rounded-full active:opacity-75"
            >
              <StyledText className="text-midnight/60 font-sans font-bold text-xs uppercase tracking-wider">
                {t('start_case')}
              </StyledText>
            </StyledPressable>
          )}
        </StyledView>

        {/* Dossier Progress Bar — shown once any field is filled */}
        {(caseState.claimant_name || caseState.location || caseState.description) && !caseState.is_complete && (
          <DossierProgress state={caseState} />
        )}

        {agentQuestion && !caseState.is_complete && (
          <StyledView className="mb-8 p-6 bg-white border-2 border-midnight/5 shadow-sm relative overflow-hidden">
            <StyledView className="absolute -top-4 -right-4 opacity-5">
              <Question size={80} color="#1E293B" weight="fill" />
            </StyledView>
            <StyledView className="mb-3 flex-row items-center">
              <StyledView className="size-2 bg-wax rounded-full mr-2" />
              <StyledText className="text-[10px] font-bold text-midnight/40 uppercase tracking-[2] font-sans">
                {t('agent_question_title')}
              </StyledText>
            </StyledView>
            <StyledText className="text-midnight text-xl font-serif leading-relaxed mb-5">
              {agentQuestion}
            </StyledText>

            {/* Large full-width Listen Again button */}
            {nextQuestionAudioUrl && (
              <StyledPressable
                onPress={() => {
                  playingUrl === nextQuestionAudioUrl ? togglePlayback() : playAudio(nextQuestionAudioUrl);
                }}
                className="flex-row items-center justify-center gap-2 bg-wax/10 border-2 border-wax/25 py-3 rounded-xl active:opacity-75"
              >
                {playingUrl === nextQuestionAudioUrl && isPlaying ? (
                  <Pause size={20} color="#9A3412" weight="fill" />
                ) : (
                  <SpeakerHigh size={20} color="#9A3412" weight="fill" />
                )}
                <StyledText className="text-wax text-sm font-bold font-serif">
                  {playingUrl === nextQuestionAudioUrl && isPlaying ? 'إيقاف' : 'استمع مرة أخرى'}
                </StyledText>
              </StyledPressable>
            )}
          </StyledView>
        )}


        {caseState.mizan_result && (
          <StyledView className="mb-8">
            <LegalResponse
              answer={caseState.mizan_result.answer_darija}
              citations={caseState.mizan_result.citations}
              confidence={caseState.mizan_result.confidence}
              recommendLawyer={caseState.mizan_result.recommend_lawyer}
              register={caseState.mizan_result.answer_register}
              audioUrl={caseState.mizan_result.audio_url}
              onPlayAudio={playAudio}
              isPlayingAudio={isPlaying && playingUrl === caseState.mizan_result.audio_url}
              onTogglePlayback={togglePlayback}
            />
          </StyledView>
        )}

        {caseState.description && !caseState.mizan_result && (
          <StyledView className="bg-white/40 p-5 border-l-4 border-wax mb-6">
            <StyledText className={`text-[11px] font-bold text-midnight/40 uppercase tracking-[2] mb-3 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('testimony_title')}
            </StyledText>
            <StyledText className="text-midnight/80 text-base leading-relaxed italic font-serif">
              {caseState.description}
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>

      {/* Bottom panel — in document flow, sits directly above the tab bar */}
      <StyledView
        className="bg-parchment-100 border-t-2 border-midnight/10"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}
      >
        {isProcessing ? (
          <StyledView className="items-center py-5">
            <ActivityIndicator size="large" color="#9A3412" />
            <StyledText className="mt-3 text-midnight/40 font-bold uppercase tracking-[2] text-[10px] font-sans">
              {t('processing_msg')}
            </StyledText>
          </StyledView>
        ) : caseState.is_complete ? (
          <StyledView className="items-center px-5 py-4">
            <StyledView className="bg-parchment-200/50 border-2 border-wax/20 p-6 items-center rounded-xl w-full">
              <SealCheck size={48} color="#9A3412" weight="fill" />
              <StyledView className="items-center mt-3">
                <StyledText className="text-midnight text-lg font-bold uppercase tracking-[2] font-serif">
                  {t('sealed_title')}
                </StyledText>
                <StyledText className="text-midnight/50 text-sm mt-1 text-center font-sans mb-4">
                  {t('sealed_desc')}
                </StyledText>

                {/* Create New Case Button */}
                <StyledPressable
                  onPress={handleCreateNewCase}
                  className="bg-wax px-6 py-2.5 rounded-full active:opacity-85 shadow-sm"
                >
                  <StyledText className="text-white font-sans font-bold text-xs uppercase tracking-wider">
                    {t('start_case')}
                  </StyledText>
                </StyledPressable>
              </StyledView>
            </StyledView>
          </StyledView>
        ) : (
          <HybridIntake onVoiceComplete={handleRecordingComplete} onTextSubmit={handleTextSubmit} />
        )}
      </StyledView>
    </StyledKAV>
  );
}
