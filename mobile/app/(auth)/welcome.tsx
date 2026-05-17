import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Microphone, ShieldCheck, Scales, ArrowRight, SpeakerHigh, Pause } from 'phosphor-react-native';
import { MotiView } from 'moti';
import { useI18n } from '../../src/context/I18nContext';
import { Audio } from 'expo-av';
import api from '../../src/shared/api/client';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface FeatureItemProps {
  icon: any; // Phosphor icon type
  title: string;
  desc: string;
  isRTL: boolean;
  index: number;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const isRTL = true; // Forced for Darija

  // Onboarding Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrlPath, setAudioUrlPath] = useState<string | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Dynamic instructional welcome voice-over script
  const onboardingText = "مرحبا بيك فميزان. باش تبدا الملف القانوني ديالك، ورك على الزر اللي لتحت وحكي ليا المشكل ديالك بالدارجة.";

  const fetchAndPlayWelcomeAudio = async () => {
    try {
      // 1. Fetch dynamic TTS audio from public speak endpoint
      const response = await api.get(`/intake/speak?text=${encodeURIComponent(onboardingText)}`);
      const path = response.data.audio_url;
      setAudioUrlPath(path);

      // 2. Play the sound
      await playAudio(path);
    } catch (err) {
      console.error("Failed to fetch onboarding audio", err);
    }
  };

  const playAudio = async (urlPath: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const fullUrl = `${api.defaults.baseURL}${urlPath}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error("Error playing welcome audio", error);
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      if (audioUrlPath) {
        await playAudio(audioUrlPath);
      } else {
        await fetchAndPlayWelcomeAudio();
      }
      return;
    }
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling audio playback", error);
    }
  };

  // Auto-play instructional audio on mount
  useEffect(() => {
    // Delay slightly to allow layout and animations to settle
    const timer = setTimeout(() => {
      fetchAndPlayWelcomeAudio();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    // Stop welcome speech before navigating
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (e) {}
    }
    router.push('/(auth)/register');
  };

  return (
    <StyledView className="flex-1 bg-parchment-100">
      <StyledView 
        className="flex-1 px-8 justify-center items-center"
        style={{ paddingTop: insets.top }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: -20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          className="mb-10 items-center"
        >
          <StyledView className="w-24 h-24 bg-midnight rounded-full items-center justify-center shadow-xl mb-6 relative">
            <Scales size={48} color="#FDFBF7" weight="duotone" />
          </StyledView>

          <StyledText className={`text-4xl font-bold text-midnight uppercase font-serif text-center`}>
            {t('welcome_title')}
          </StyledText>
          <StyledText className={`text-midnight/50 font-sans text-sm mt-2 uppercase text-center`}>
            {t('welcome_subtitle')}
          </StyledText>

          {/* Premium Audio Playback Guide Button */}
          <StyledTouchableOpacity
            onPress={togglePlayback}
            className="mt-6 flex-row items-center gap-2 bg-wax/10 border-2 border-wax/25 px-5 py-3 rounded-full active:opacity-75"
            accessibilityLabel="استمع للإرشادات"
            accessibilityRole="button"
          >
            {isPlaying ? (
              <Pause size={18} color="#9A3412" weight="fill" />
            ) : (
              <SpeakerHigh size={18} color="#9A3412" weight="fill" />
            )}
            <StyledText className="text-wax text-sm font-bold font-serif">
              {isPlaying ? "إيقاف الإرشادات" : "استمع للإرشادات (الدارجة)"}
            </StyledText>
          </StyledTouchableOpacity>
        </MotiView>

        <StyledView className="w-full space-y-8 mb-12">
          <FeatureItem 
            icon={Microphone} 
            title={t('feature_voice_title')} 
            desc={t('feature_voice_desc')}
            isRTL={isRTL}
            index={0}
          />
          <FeatureItem 
            icon={ShieldCheck} 
            title={t('feature_dossier_title')} 
            desc={t('feature_dossier_desc')}
            isRTL={isRTL}
            index={1}
          />
          <FeatureItem 
            icon={Scales} 
            title={t('feature_justice_title')} 
            desc={t('feature_justice_desc')}
            isRTL={isRTL}
            index={2}
          />
        </StyledView>
      </StyledView>

      <StyledView 
        className="px-8 pb-12"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 800 }}
        >
          <StyledTouchableOpacity
            onPress={handleStart}
            activeOpacity={0.8}
            className="bg-wax py-5 rounded-sm items-center shadow-lg mb-4"
            accessibilityLabel={t('start_case')}
            accessibilityRole="button"
          >
            <StyledView className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <StyledText className={`text-white font-bold uppercase font-sans ${isRTL ? 'ml-2' : 'mr-2'}`}>
                {t('start_case')}
              </StyledText>
              <StyledView style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}>
                <ArrowRight size={18} color="white" weight="bold" />
              </StyledView>
            </StyledView>
          </StyledTouchableOpacity>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 1000 }}
        >
          <StyledTouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.6}
            className="py-4 items-center"
            accessibilityLabel={t('already_have_case')}
            accessibilityRole="button"
          >
            <StyledText className={`text-midnight/60 font-sans text-xs uppercase ${isRTL ? 'text-right' : 'text-center'}`}>
              {t('already_have_case')} <StyledText className="text-midnight font-bold underline">{t('login')}</StyledText>
            </StyledText>
          </StyledTouchableOpacity>
        </MotiView>
      </StyledView>
    </StyledView>
  );
}

const FeatureItem = ({ icon: Icon, title, desc, isRTL, index }: FeatureItemProps) => (
  <MotiView
    from={{ opacity: 0, translateX: isRTL ? 20 : -20 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ type: 'timing', duration: 600, delay: 200 + index * 150 }}
  >
    <StyledView className={`flex-row items-start mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <StyledView className={`bg-midnight/5 p-3 rounded-full ${isRTL ? 'ml-4' : 'mr-4'}`}>
        <Icon size={24} color="#1E293B" weight="duotone" />
      </StyledView>
      <StyledView className="flex-1">
        <StyledText className={`text-midnight font-bold font-serif text-lg leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
          {title}
        </StyledText>
        <StyledText className={`text-midnight/60 font-sans text-sm mt-1 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          {desc}
        </StyledText>
      </StyledView>
    </StyledView>
  </MotiView>
);
