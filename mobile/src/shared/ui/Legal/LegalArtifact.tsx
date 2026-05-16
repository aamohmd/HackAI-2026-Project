import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { Citation } from '@/features/intake/api/intake';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Props {
  citation: Citation;
}

export const LegalArtifact: React.FC<Props> = ({ citation }) => {
  return (
    <StyledView className="bg-parchment-50 border-2 border-midnight p-3 rounded shadow-sm mb-3">
      <StyledView className="flex-row justify-between items-center mb-2">
        <StyledText className="text-wax font-bold text-lg font-serif">
          فصل {citation.article_number}
        </StyledText>
        <StyledView 
          className="border-2 border-wax/40 px-2 py-0.5 rounded shadow-sm"
          style={{ transform: [{ rotate: '-5deg' }] }}
        >
          <StyledText className="text-wax/60 font-bold uppercase text-[10px]">
            {citation.law_name}
          </StyledText>
        </StyledView>
      </StyledView>
      <StyledText className="text-midnight/80 text-sm font-sans" numberOfLines={3}>
        "{citation.claim_supported}"
      </StyledText>
    </StyledView>
  );
};
