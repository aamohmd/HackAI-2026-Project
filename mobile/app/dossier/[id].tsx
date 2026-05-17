import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { Export } from 'phosphor-react-native';
import { dossiersApi, DossierEntry } from '@/features/intake/api/dossiers';
import { Audio } from 'expo-av';
import api from '@/shared/api/client';

import { LegalResponse, TripleArtifactHUD } from '@/shared/ui/Legal';
import { MotabaqStamp } from '@/shared/ui/Stamps';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function DossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [dossier, setDossier] = useState<DossierEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      if (sound) {
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldRouteThroughEarpieceIOS: false,
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

  useEffect(() => {
    if (id) {
      dossiersApi.get(id).then(setDossier).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [id]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Mizan Legal Dossier #${id.slice(0, 8)}\n\nLocation: ${dossier?.state.location}\nResult: ${dossier?.state.mizan_result?.answer_darija}`,
      });
    } catch (error) {
      console.error(error);
    }
  };


  if (isLoading) {
    return (
      <StyledView className="flex-1 bg-parchment-100 items-center justify-center">
        <ActivityIndicator size="large" color="#9A3412" />
      </StyledView>
    );
  }

  if (!dossier) {
    return (
      <StyledView className="flex-1 bg-parchment-100 items-center justify-center p-10">
        <StyledText className="text-midnight font-serif text-center text-lg">
          Dossier not found or access denied.
        </StyledText>
      </StyledView>
    );
  }

  const { state } = dossier;

  return (
    <StyledView className="flex-1 bg-parchment-100">
      <Stack.Screen 
        options={{ 
          title: `Dossier #${id.slice(0, 8)}`,
          headerStyle: { backgroundColor: '#FDFBF7' },
          headerTintColor: '#1E293B',
          headerTitleStyle: { fontFamily: 'CrimsonText-Bold' },
          headerRight: () => (
            <TouchableOpacity onPress={onShare} className="mr-2">
              <Export size={24} color="#9A3412" weight="duotone" />
            </TouchableOpacity>
          ),
        }} 
      />

      
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
      >
        <StyledView className="mb-8 items-center relative py-10 border-2 border-midnight/10 bg-white/40">
          <StyledView className="absolute top-4 right-4">
            <MotabaqStamp size="md" />
          </StyledView>
          
          <StyledText className="text-3xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
            Official Brief
          </StyledText>
          <StyledText className="text-midnight/50 italic mt-2 font-serif text-lg text-center">
            Issued by Mizan AI Legal System
          </StyledText>
        </StyledView>

        {state.mizan_result ? (
          <StyledView className="mb-8">
            <LegalResponse
              answer={state.mizan_result.answer_darija}
              citations={state.mizan_result.citations}
              confidence={state.mizan_result.confidence}
              recommendLawyer={state.mizan_result.recommend_lawyer}
              register={state.mizan_result.answer_register}
              audioUrl={state.mizan_result.audio_url}
              onPlayAudio={playAudio}
              isPlayingAudio={isPlaying && playingUrl === state.mizan_result.audio_url}
              onTogglePlayback={togglePlayback}
            />
          </StyledView>
        ) : (
          <StyledView className="mb-8 p-6 bg-wax/5 border-2 border-wax/20 rounded-xl items-center">
            <StyledText className="text-midnight/60 font-serif text-center italic">
              This dossier is still in draft status. Complete the intake to seal the brief.
            </StyledText>
          </StyledView>
        )}

        <StyledView className="mb-8">
           <StyledText className="text-[11px] font-bold text-midnight/40 uppercase tracking-[2] mb-3 font-sans px-2">
            Supporting Evidence & Citations
          </StyledText>
          <TripleArtifactHUD citations={state.interim_citations || []} />
        </StyledView>

        <StyledView className="bg-white/40 p-6 border-l-4 border-midnight/20 mb-6">
          <StyledText className="text-[11px] font-bold text-midnight/40 uppercase tracking-[2] mb-3 font-sans">
            User Testimony
          </StyledText>
          <StyledText className="text-midnight/80 text-base leading-relaxed italic font-serif">
            "{state.description || "No testimony provided."}"
          </StyledText>
          
          <StyledView className="mt-6 pt-4 border-t border-midnight/5">
             <StyledText className="text-[10px] text-midnight/40 font-sans">
              Claimant: {state.claimant_name || 'Anonymous'}{'\n'}
              Opponent: {state.opponent_name || 'N/A'}{'\n'}
              Location: {state.location || 'N/A'}{'\n'}
              Date: {state.date_of_incident || 'N/A'}
             </StyledText>
          </StyledView>
        </StyledView>

        {dossier.status === 'sealed' && (
          <StyledView className="items-center mt-10 py-10 opacity-60">
             <MotabaqStamp size="lg" text="FINAL SEAL" />
             <StyledText className="text-midnight/30 text-[10px] mt-4 font-sans uppercase tracking-[2]">
               Electronically Verified - HackAI 2026
             </StyledText>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledView>
  );
}
