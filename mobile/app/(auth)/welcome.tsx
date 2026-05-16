import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Microphone, ShieldCheck, Scales, ArrowRight } from 'phosphor-react-native';
import { useI18n } from '../../src/context/I18nContext';
import { LanguageGateway } from '../../components/LanguageGateway';
import { LanguageToggle } from '../../components/LanguageToggle';


const { width } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locale, t, isReady } = useI18n();

  if (!isReady) return null;

  if (!locale) {
    return <LanguageGateway />;
  }

  const isRTL = locale === 'ar';

  return (
    <StyledView className="flex-1 bg-parchment-100">
      {/* Language Toggle in top right */}
      <StyledView 
        className="absolute z-10" 
        style={{ top: insets.top + 10, right: 20 }}
      >
        <LanguageToggle />
      </StyledView>

      <StyledView 
        className="flex-1 px-8 justify-center items-center"
        style={{ paddingTop: insets.top }}
      >
        <StyledView className="mb-12 items-center">
          <StyledView className="w-24 h-24 bg-midnight rounded-full items-center justify-center shadow-xl mb-6">
            <Scales size={48} color="#FDFBF7" weight="duotone" />
          </StyledView>
          <StyledText className="text-4xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
            {t('welcome_title')}
          </StyledText>
          <StyledText className="text-midnight/50 font-sans text-sm mt-2 uppercase tracking-[2] text-center">
            {t('welcome_subtitle')}
          </StyledText>
        </StyledView>

        <StyledView className="w-full space-y-8 mb-12">
          <FeatureItem 
            icon={Microphone} 
            title={t('feature_voice_title')} 
            desc={t('feature_voice_desc')}
            isRTL={isRTL}
          />
          <FeatureItem 
            icon={ShieldCheck} 
            title={t('feature_dossier_title')} 
            desc={t('feature_dossier_desc')}
            isRTL={isRTL}
          />
          <FeatureItem 
            icon={Scales} 
            title={t('feature_justice_title')} 
            desc={t('feature_justice_desc')}
            isRTL={isRTL}
          />
        </StyledView>
      </StyledView>

      <StyledView 
        className="px-8 pb-12"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <StyledTouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
          className="bg-wax py-5 rounded-sm items-center shadow-lg mb-4"
        >
          <StyledView className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <StyledText className={`text-white font-bold uppercase tracking-[2] font-sans ${isRTL ? 'ml-2' : 'mr-2'}`}>
              {t('start_case')}
            </StyledText>
            <StyledView style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}>
              <ArrowRight size={18} color="white" weight="bold" />
            </StyledView>
          </StyledView>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.6}
          className="py-4 items-center"
        >
          <StyledText className={`text-midnight/60 font-sans text-xs uppercase tracking-[1] ${isRTL ? 'text-right' : 'text-center'}`}>
            {t('already_have_case')} <StyledText className="text-midnight font-bold underline">{t('login')}</StyledText>
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}

const FeatureItem = ({ icon: Icon, title, desc, isRTL }: any) => (
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
);
