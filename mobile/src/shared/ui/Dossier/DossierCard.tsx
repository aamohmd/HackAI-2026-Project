import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { RubberStamp } from './RubberStamp';

const StyledView = styled(View);
const StyledText = styled(Text);

interface DossierCardProps {
  name: string;
  icon: React.ReactNode;
  description?: string;
  completed?: boolean;
}

export const DossierCard = ({ name, icon, description, completed }: DossierCardProps) => (
  <StyledView 
    className={`relative p-4 border-2 ${completed ? 'border-wax' : 'border-midnight/10'} bg-parchment-50 shadow-sm mb-3`}
  >
    <StyledView className="flex-row items-center gap-2 mb-2">
      <StyledView className="text-wax">
        {icon}
      </StyledView>
      <StyledText className="font-bold text-midnight uppercase tracking-[0.5] text-xs font-sans">
        {name}
      </StyledText>
    </StyledView>
    <StyledText className="text-midnight/80 text-sm leading-relaxed min-h-[20px] font-serif">
      {description || <StyledText className="text-midnight/30 italic font-serif">Information required...</StyledText>}
    </StyledText>
    {completed && <RubberStamp text="Motabaq" />}
  </StyledView>
);
