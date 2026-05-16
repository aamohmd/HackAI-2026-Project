import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { Scroll } from 'phosphor-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export interface Citation {
  article_number: string;
  law_name: string;
  law_code: string;
  claim_supported: string;
}

interface Props {
  citation: Citation;
}

/**
 * CitationItem component to display a legal grounding for a specific claim.
 * Follows the Dossier & Seal aesthetic.
 */
export const CitationItem: React.FC<Props> = ({ citation }) => {
  return (
    <StyledView className="bg-white/40 p-3 border-l-2 border-wax/30 mb-2">
      <StyledView className="flex-row items-center gap-2 mb-1">
        <Scroll size={14} color="#9A3412" weight="duotone" />
        <StyledText className="text-[10px] font-bold text-wax uppercase tracking-tight font-sans">
          {citation.law_name} — Art. {citation.article_number}
        </StyledText>
      </StyledView>
      <StyledText className="text-midnight/60 text-[11px] italic font-serif leading-tight">
        "{citation.claim_supported}"
      </StyledText>
    </StyledView>
  );
};
