import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Microphone, ShieldCheck, Scales, ArrowRight } from 'phosphor-react-native';
import { MotiView } from 'moti';
import { useI18n } from '../../src/context/I18nContext';
import { LanguageGateway } from '../../components/LanguageGateway';
import { LanguageToggle } from '../../components/LanguageToggle';

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
  const { locale, t, isReady } = useI18n();

  const isRTL = true; // Forced for Darija

  return (
    <StyledView className="flex-1 bg-parchment-100">
      {/* Language Toggle removed for Darija-only mode */}

      <StyledView 
        className="flex-1 px-8 justify-center items-center"
        style={{ paddingTop: insets.top }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: -20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          className="mb-12 items-center"
        >
          <StyledView className="w-24 h-24 bg-midnight rounded-full items-center justify-center shadow-xl mb-6">
            <Scales size={48} color="#FDFBF7" weight="duotone" />
          </StyledView>
          <StyledText className={`text-4xl font-bold text-midnight uppercase ${!isRTL ? 'tracking-[4]' : ''} font-serif text-center`}>
            {t('welcome_title')}
          </StyledText>
          <StyledText className={`text-midnight/50 font-sans text-sm mt-2 uppercase ${!isRTL ? 'tracking-[2]' : ''} text-center`}>
            {t('welcome_subtitle')}
          </StyledText>
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
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
            className="bg-wax py-5 rounded-sm items-center shadow-lg mb-4"
            accessibilityLabel={t('start_case')}
            accessibilityRole="button"
          >
            <StyledView className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <StyledText className={`text-white font-bold uppercase ${!isRTL ? 'tracking-[2]' : ''} font-sans ${isRTL ? 'ml-2' : 'mr-2'}`}>
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
            <StyledText className={`text-midnight/60 font-sans text-xs uppercase ${!isRTL ? 'tracking-[1]' : ''} ${isRTL ? 'text-right' : 'text-center'}`}>
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
