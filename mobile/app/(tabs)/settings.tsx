import React, { useContext } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { SignOut, User as UserIcon, ShieldCheck, Info, CaretRight } from 'phosphor-react-native';
import { AuthContext } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const auth = useContext(AuthContext);
  const { t, locale } = useI18n();
  const isRTL = locale === 'ar';

  const handleLogout = () => {
    Alert.alert(
      t('confirm_logout_title'),
      t('confirm_logout_msg'),
      [
        { text: t('cancel'), style: "cancel" },
        { 
          text: t('logout'), 
          style: "destructive", 
          onPress: () => auth?.logout() 
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, value, onPress, destructive }: any) => (
    <StyledTouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-5 bg-white/40 border-b-2 border-midnight/5 ${destructive ? 'active:bg-wax/10' : ''}`}
    >
      <StyledView className={`w-10 h-10 rounded-full items-center justify-center ${destructive ? 'bg-wax/10' : 'bg-midnight/5'}`}>
        <Icon size={20} color={destructive ? '#9A3412' : '#1E293B'} weight="duotone" />
      </StyledView>
      
      <StyledView className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
        <StyledText className={`text-sm font-bold uppercase tracking-[1] font-sans ${isRTL ? 'text-right' : 'text-left'} ${destructive ? 'text-wax' : 'text-midnight/60'}`}>
          {title}
        </StyledText>
        {value && (
          <StyledText className={`text-midnight font-serif text-lg mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
            {value}
          </StyledText>
        )}
      </StyledView>
      
      {!destructive && <CaretRight size={20} color="#1E293B30" />}
    </StyledTouchableOpacity>
  );

  return (
    <StyledView className="flex-1 bg-parchment-100">
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 32,
        }}
      >
        <StyledView className="px-5 mb-8">
          <StyledText className={`text-3xl font-bold text-midnight uppercase tracking-[2] font-serif ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('settings_title')}
          </StyledText>
          <StyledText className={`text-midnight/50 font-sans text-sm mt-1 uppercase tracking-[1] ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('settings_subtitle')}
          </StyledText>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className={`px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('user_profile')}
          </StyledText>
          <SettingItem 
            icon={UserIcon} 
            title={t('registered_phone')} 
            value={auth?.user?.phone_number || "غير متوفر"} 
          />
          <SettingItem 
            icon={ShieldCheck} 
            title={t('verification_status')} 
            value={t('verified_citizen')} 
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className={`px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('legal_disclaimer_title')}
          </StyledText>
          <StyledView className="mx-5 p-5 bg-white/40 border-2 border-midnight/10 rounded-sm">
            <StyledText className={`text-midnight/60 text-xs font-serif italic leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              "{t('legal_disclaimer_text')}"
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className={`px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('about_system')}
          </StyledText>
          <SettingItem 
            icon={Info} 
            title={t('version')} 
            value="ميزان v1.0.4 - إنتاج" 
          />
        </StyledView>

        <StyledView className="mt-4">
          <SettingItem 
            icon={SignOut} 
            title={t('logout_session')} 
            onPress={handleLogout}
            destructive
          />
        </StyledView>

        <StyledView className="items-center mt-12 opacity-20">
           <StyledText className="text-midnight font-serif italic">
             {t('justice_quote')}
           </StyledText>
           <StyledText className="text-[10px] mt-2 font-sans uppercase tracking-[2]">
             HackAI 2026 - تكنولوجيا قانونية مغربية
           </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}
