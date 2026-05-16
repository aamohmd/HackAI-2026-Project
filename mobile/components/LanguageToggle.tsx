import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useI18n } from '../src/context/I18nContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export const LanguageToggle = () => {
  const { locale, setLanguage } = useI18n();

  return (
    <StyledView className="flex-row items-center gap-2">
      <StyledTouchableOpacity onPress={() => setLanguage('en')}>
        <StyledText className={`text-[10px] font-bold uppercase tracking-[1] font-sans ${locale === 'en' ? 'text-midnight underline' : 'text-midnight/40'}`}>
          EN
        </StyledText>
      </StyledTouchableOpacity>
      <StyledText className="text-midnight/20 text-[10px]">|</StyledText>
      <StyledTouchableOpacity onPress={() => setLanguage('ar')}>
        <StyledText className={`text-[10px] font-bold uppercase tracking-[1] font-sans ${locale === 'ar' ? 'text-midnight underline' : 'text-midnight/40'}`}>
          دارجة
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};
