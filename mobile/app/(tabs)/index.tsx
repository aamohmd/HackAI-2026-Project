import React, { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { SealCheck } from 'phosphor-react-native';
import { LegalResponse, TripleArtifactHUD } from '@/shared/ui/Legal';
import { HybridIntake } from '@/features/intake/components/HybridIntake';
import { intakeApi, LandDisputeState } from '@/features/intake/api/intake';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function MobileHubScreen() {
  const [caseState, setCaseState] = useState<LandDisputeState>({ is_complete: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (uri: string) => {
    setIsProcessing(true);
    try {
      const response = await intakeApi.processVoice(
        {
          uri,
          name: 'audio.m4a',
          type: 'audio/m4a',
        },
        caseState
      );

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
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StyledScrollView className="flex-1 bg-parchment-100">
        <StyledView className="p-6 pt-16">
          <StyledView className="mb-10 items-center">
            <StyledView className="w-16 h-1 bg-wax mb-4 rounded-full" />
            <StyledText className="text-4xl font-bold text-midnight uppercase tracking-[4] font-serif text-center">
              Mizan
            </StyledText>
            <StyledText className="text-midnight/50 italic mt-2 font-serif text-lg text-center">
              "Speak your truth. We will find the law."
            </StyledText>
          </StyledView>

          {/* Triple Artifact HUD (Replaces Fact Dossier) */}
          {!caseState.mizan_result && (
            <TripleArtifactHUD citations={caseState.interim_citations || []} />
          )}

          {/* Mizan Legal Response Section */}
          {caseState.mizan_result && (
            <StyledView className="mb-10">
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
            <StyledView className="bg-white/40 p-6 border-l-4 border-wax shadow-sm mb-8">
              <StyledText className="text-[11px] font-bold text-midnight/40 uppercase tracking-[2] mb-4 font-sans">
                The Testimony
              </StyledText>
              <StyledText className="text-midnight/80 text-base leading-relaxed italic font-serif">
                "{caseState.description}"
              </StyledText>
            </StyledView>
          )}

          <StyledView className="items-center mt-6 pb-20">
            {isProcessing ? (
              <StyledView className="items-center py-10">
                <ActivityIndicator size="large" color="#9A3412" />
                <StyledText className="mt-6 text-midnight/40 font-bold uppercase tracking-[2] text-[10px] font-sans">
                  Neural Core Analysis in Progress...
                </StyledText>
              </StyledView>
            ) : caseState.is_complete ? (
              <StyledView className="bg-parchment-200/50 border-2 border-wax/20 p-10 items-center rounded-xl w-full">
                <SealCheck size={64} color="#9A3412" weight="fill" />
                <StyledView className="items-center mt-6">
                  <StyledText className="text-midnight text-xl font-bold uppercase tracking-[2] font-serif">
                    Brief is Sealed
                  </StyledText>
                  <StyledText className="text-midnight/50 text-sm mt-2 text-center font-sans">
                    The evidence is gathered. The law awaits.
                  </StyledText>
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="w-full items-center">
                <StyledText className="text-midnight/30 text-[10px] font-bold uppercase tracking-[2] mb-6 font-sans">
                  Press and hold to testify
                </StyledText>
                <HybridIntake onVoiceComplete={handleRecordingComplete} onTextSubmit={handleTextSubmit} />
              </StyledView>
            )}
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </KeyboardAvoidingView>
  );
}
