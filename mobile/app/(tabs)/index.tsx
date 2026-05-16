import React, { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { SealCheck } from 'phosphor-react-native';
import { LegalResponse, TripleArtifactHUD } from '@/shared/ui/Legal';
import { HybridIntake } from '@/features/intake/components/HybridIntake';
import { intakeApi, LandDisputeState } from '@/features/intake/api/intake';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledKAV = styled(KeyboardAvoidingView);

export default function MobileHubScreen() {
  const insets = useSafeAreaInsets();
  const [caseState, setCaseState] = useState<LandDisputeState>({ is_complete: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (uri: string) => {
    setIsProcessing(true);
    try {
      const response = await intakeApi.processVoice({ uri, name: 'audio.m4a', type: 'audio/m4a' }, caseState);
      setCaseState(response.updated_state);
    } catch (err) {
      console.error("Error processing voice:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await intakeApi.processText(text, caseState);
      setCaseState(response.updated_state);
    } catch (err) {
      console.error("Error processing text:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    // KAV as the flex root — it manages the whole screen when keyboard opens
    <StyledKAV
      className="flex-1 bg-parchment-100"
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Scrollable content area — grows to fill available space */}
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <StyledView className="mb-8 items-center">
          <StyledView className="w-16 h-1 bg-wax mb-4 rounded-full" />
          <StyledText className="text-4xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
            Mizan
          </StyledText>
          <StyledText className="text-midnight/50 italic mt-2 font-serif text-lg text-center">
            "Speak your truth. We will find the law."
          </StyledText>
        </StyledView>

        {!caseState.mizan_result && (
          <TripleArtifactHUD citations={caseState.interim_citations || []} />
        )}

        {caseState.mizan_result && (
          <StyledView className="mb-8">
            <LegalResponse
              answer={caseState.mizan_result.answer_darija}
              citations={caseState.mizan_result.citations}
              confidence={caseState.mizan_result.confidence}
              recommendLawyer={caseState.mizan_result.recommend_lawyer}
              register={caseState.mizan_result.answer_register}
            />
          </StyledView>
        )}

        {caseState.description && !caseState.mizan_result && (
          <StyledView className="bg-white/40 p-5 border-l-4 border-wax mb-6">
            <StyledText className="text-[11px] font-bold text-midnight/40 uppercase tracking-[2] mb-3 font-sans">
              The Testimony
            </StyledText>
            <StyledText className="text-midnight/80 text-base leading-relaxed italic font-serif">
              "{caseState.description}"
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>

      {/* Bottom panel — in document flow, sits directly above the tab bar */}
      <StyledView
        className="bg-parchment-100 border-t-2 border-midnight/10"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}
      >
        {isProcessing ? (
          <StyledView className="items-center py-5">
            <ActivityIndicator size="large" color="#9A3412" />
            <StyledText className="mt-3 text-midnight/40 font-bold uppercase tracking-[2] text-[10px] font-sans">
              Neural Core Analysis in Progress...
            </StyledText>
          </StyledView>
        ) : caseState.is_complete ? (
          <StyledView className="items-center px-5 py-4">
            <StyledView className="bg-parchment-200/50 border-2 border-wax/20 p-6 items-center rounded-xl w-full">
              <SealCheck size={48} color="#9A3412" weight="fill" />
              <StyledView className="items-center mt-3">
                <StyledText className="text-midnight text-lg font-bold uppercase tracking-[2] font-serif">
                  Brief is Sealed
                </StyledText>
                <StyledText className="text-midnight/50 text-sm mt-1 text-center font-sans">
                  The evidence is gathered. The law awaits.
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        ) : (
          <HybridIntake onVoiceComplete={handleRecordingComplete} onTextSubmit={handleTextSubmit} />
        )}
      </StyledView>
    </StyledKAV>
  );
}
