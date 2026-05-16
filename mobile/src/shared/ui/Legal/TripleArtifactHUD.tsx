import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { Citation } from '@/features/intake/api/intake';
import { LegalArtifact } from './LegalArtifact';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Props {
  citations: Citation[];
}

export const TripleArtifactHUD: React.FC<Props> = ({ citations }) => {
  // Always display exactly 3 slots. Take up to the first 3 citations.
  const displayCitations = citations.slice(0, 3);
  const emptySlotsCount = 3 - displayCitations.length;

  return (
    <StyledView className="w-full mb-8">
      {displayCitations.map((citation, index) => (
        <LegalArtifact key={`${citation.law_code}-${citation.article_number}-${index}`} citation={citation} />
      ))}
      
      {Array.from({ length: emptySlotsCount }).map((_, index) => (
        <StyledView 
          key={`empty-slot-${index}`}
          testID="empty-artifact-slot"
          className="bg-parchment-50/50 border-2 border-dashed border-midnight/20 p-3 rounded mb-3 h-[90px] items-center justify-center"
        >
          <StyledText className="text-midnight/30 font-sans text-xs uppercase tracking-widest">
            Awaiting Legal Grounding
          </StyledText>
        </StyledView>
      ))}
    </StyledView>
  );
};