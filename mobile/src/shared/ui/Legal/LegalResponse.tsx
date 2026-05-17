import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { Scales, WarningCircle, SpeakerHigh, Pause } from 'phosphor-react-native';
import { ConfidenceBadge } from './ConfidenceBadge';
import { CitationItem, Citation } from './CitationItem';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

interface Props {
  answer: string;
  citations: Citation[];
  confidence: number;
  recommendLawyer: boolean;
  register?: 'simple' | 'standard' | 'technical';
  audioUrl?: string;
  onPlayAudio?: (url: string) => void;
  isPlayingAudio?: boolean;
  onTogglePlayback?: () => void;
}

/**
 * LegalResponse component: The primary "Mizan" answer display.
 * Displays the AI-generated Darija guidance, legal grounding, and confidence.
 */
export const LegalResponse: React.FC<Props> = ({ 
  answer, 
  citations, 
  confidence, 
  recommendLawyer,
  register = 'standard',
  audioUrl,
  onPlayAudio,
  isPlayingAudio = false,
  onTogglePlayback
}) => {
  return (
    <StyledView className="bg-parchment-50 border-2 border-midnight/5 p-6 shadow-sm">
      {/* Header with Confidence */}
      <StyledView className="flex-row justify-between items-center mb-6">
        <StyledView className="flex-row items-center gap-2">
          <Scales size={24} color="#1E293B" weight="duotone" />
          <StyledText className="font-bold text-midnight uppercase tracking-[2] text-[10px] font-sans">
            Legal Guidance
          </StyledText>
        </StyledView>
        
        <StyledView className="flex-row items-center gap-3">
          {audioUrl && onPlayAudio && (
            <StyledPressable 
              onPress={() => {
                isPlayingAudio && onTogglePlayback ? onTogglePlayback() : onPlayAudio(audioUrl);
              }}
              className="flex-row items-center gap-1.5 bg-wax/10 border border-wax/20 px-3 py-1.5 rounded-full active:opacity-75"
            >
              {isPlayingAudio ? (
                <Pause size={14} color="#9A3412" weight="fill" />
              ) : (
                <SpeakerHigh size={14} color="#9A3412" weight="fill" />
              )}
              <StyledText className="text-wax text-[10px] font-sans font-bold uppercase tracking-wider">
                {isPlayingAudio ? "Pause" : "Listen (Darija)"}
              </StyledText>
            </StyledPressable>
          )}
          <ConfidenceBadge score={confidence} />
        </StyledView>
      </StyledView>

      {/* The Answer in Darija */}
      <StyledText className="text-midnight text-lg leading-relaxed font-serif mb-8">
        {answer}
      </StyledText>

      {/* Citations (Hidden if register is 'simple') */}
      {register !== 'simple' && citations.length > 0 && (
        <StyledView className="mt-4 pt-6 border-t border-midnight/5">
          <StyledText className="text-[9px] font-bold text-midnight/30 uppercase tracking-[2] mb-4 font-sans">
            Evidence Base
          </StyledText>
          {citations.map((citation, index) => (
            <CitationItem key={`${citation.law_code}-${index}`} citation={citation} />
          ))}
        </StyledView>
      )}

      {/* Lawyer Recommendation Banner */}
      {recommendLawyer && (
        <StyledView className="mt-6 bg-wax/5 border-2 border-wax/20 p-4 flex-row items-center gap-3">
          <WarningCircle size={24} color="#9A3412" weight="fill" />
          <StyledView className="flex-1">
            <StyledText className="text-wax font-bold uppercase tracking-tight text-[10px] font-sans mb-1">
              Consultation Recommended
            </StyledText>
            <StyledText className="text-wax/70 text-xs font-serif leading-tight">
              Due to the complexity of this case, a qualified advocate is recommended.
            </StyledText>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
};
