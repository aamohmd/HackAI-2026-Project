import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { MotiView } from 'moti';
import { useI18n } from '../src/context/I18nContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export const LanguageGateway = () => {
  const { setLanguage } = useI18n();

  return (
    <StyledView className="flex-1 bg-parchment-100 items-center justify-center px-8">
      <StyledText className="text-2xl font-bold text-midnight uppercase tracking-[4] font-serif mb-16 text-center">
        Select Language
      </StyledText>

      <StyledView className="flex-row justify-around w-full">
        {/* Darija Seal */}
        <StyledTouchableOpacity 
          onPress={() => setLanguage('ar')}
          activeOpacity={0.7}
          className="items-center"
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 200 }}
            className="w-32 h-32 rounded-full border-4 border-wax items-center justify-center"
            style={{ transform: [{ rotate: '-10deg' }] }}
          >
            <StyledText className="text-wax text-2xl font-bold font-serif">الدارجة</StyledText>
          </MotiView>
          <StyledText className="mt-4 text-midnight/40 font-sans text-xs uppercase tracking-[2]">Mghribiya</StyledText>
        </StyledTouchableOpacity>

        {/* English Seal */}
        <StyledTouchableOpacity 
          onPress={() => setLanguage('en')}
          activeOpacity={0.7}
          className="items-center"
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 400 }}
            className="w-32 h-32 rounded-full border-4 border-midnight items-center justify-center"
            style={{ transform: [{ rotate: '5deg' }] }}
          >
            <StyledText className="text-midnight text-2xl font-bold font-serif">English</StyledText>
          </MotiView>
          <StyledText className="mt-4 text-midnight/40 font-sans text-xs uppercase tracking-[2]">Universal</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
