import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { Scales, SpeakerHigh, Pause, HandHeart } from 'phosphor-react-native';
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
 * Optimised for rural Moroccan users — voice-first, large text, no legal jargon in UI.
 * - Auto-plays the audio response when the card first mounts.
 * - Large 22px RTL text with generous line-height for partial-literacy support.
 * - Lawyer recommendation shown as a warm, approachable Darija card (no phone dialer).
 * - Citations shown only in 'technical' register to avoid overwhelming illiterate users.
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
  onTogglePlayback,
}) => {
  // Auto-play the answer audio when this card first appears
  useEffect(() => {
    if (audioUrl && onPlayAudio) {
      onPlayAudio(audioUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  return (
    <StyledView className="bg-parchment-50 border-2 border-midnight/5 p-6 shadow-sm">
      {/* Header */}
      <StyledView className="flex-row justify-between items-center mb-6">
        <StyledView className="flex-row items-center gap-2">
          <Scales size={24} color="#1E293B" weight="duotone" />
          <StyledText className="font-bold text-midnight uppercase tracking-[2] text-[10px] font-sans">
            جواب ميزان
          </StyledText>
        </StyledView>

        {/* Listen / Pause button — larger tap target than original pill */}
        {audioUrl && onPlayAudio && (
          <StyledPressable
            onPress={() => {
              isPlayingAudio && onTogglePlayback
                ? onTogglePlayback()
                : onPlayAudio(audioUrl);
            }}
            className="flex-row items-center gap-2 bg-wax/10 border-2 border-wax/25 px-4 py-2 rounded-xl active:opacity-75"
          >
            {isPlayingAudio ? (
              <Pause size={18} color="#9A3412" weight="fill" />
            ) : (
              <SpeakerHigh size={18} color="#9A3412" weight="fill" />
            )}
            <StyledText className="text-wax text-sm font-bold font-serif">
              {isPlayingAudio ? 'إيقاف' : 'استمع'}
            </StyledText>
          </StyledPressable>
        )}
      </StyledView>

      {/* The Answer in Darija — large font for partial-literacy support */}
      <StyledText
        className="text-midnight font-serif mb-8"
        style={{ fontSize: 22, lineHeight: 40, textAlign: 'right' }}
      >
        {answer}
      </StyledText>

      {/* Simplified legal grounding badge — no article numbers for simple/standard */}
      {citations.length > 0 && (
        <StyledView className="mt-2 pt-5 border-t border-midnight/5">
          <StyledView className="flex-row items-center gap-2 mb-3">
            <Scales size={14} color="#1E293B60" />
            <StyledText className="text-[11px] font-bold text-midnight/40 font-sans">
              مبني على قانون مغربي رسمي
            </StyledText>
          </StyledView>
          {/* Full citations only for technical register (legal professionals) */}
          {register === 'technical' &&
            citations.map((citation, index) => (
              <CitationItem
                key={`${citation.law_code}-${index}`}
                citation={citation}
              />
            ))}
        </StyledView>
      )}

      {/* Lawyer Recommendation — warm, prominent card, no phone dialer */}
      {recommendLawyer && (
        <StyledView className="mt-6 border-2 border-wax/20 p-5 rounded-xl flex-row items-start gap-3"
          style={{ backgroundColor: 'rgba(154, 52, 18, 0.05)' }}
        >
          <HandHeart size={28} color="#9A3412" weight="fill" style={{ marginTop: 2 }} />
          <StyledView className="flex-1">
            <StyledText
              className="text-wax font-bold font-serif mb-1"
              style={{ fontSize: 17, textAlign: 'right' }}
            >
              ننصحك تتكلم مع محامي
            </StyledText>
            <StyledText
              className="text-wax/70 font-sans leading-relaxed"
              style={{ fontSize: 14, textAlign: 'right' }}
            >
              هاد القضية معقدة شوية. المحامي يقدر يعاونك أكثر منا.
            </StyledText>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
};
