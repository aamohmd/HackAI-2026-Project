import React, { useState, useEffect } from 'react';
import { VoiceRecorder } from '@/features/intake/components/VoiceRecorder';
import { BentoGrid, BentoCard } from '@/shared/ui/Bento';
import { MapPin, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface CaseState {
  claimant_name?: string;
  opponent_name?: string;
  location?: string;
  date_of_incident?: string;
  proof_type?: string;
  description?: string;
  is_complete: boolean;
}

export const MobileHub = () => {
  const [caseState, setCaseState] = useState<CaseState>({ is_complete: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'audio.wav');
    formData.append('state_json', JSON.stringify(caseState));

    try {
      const response = await axios.post('/api/intake/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { updated_state, next_question } = response.data;
      setCaseState(updated_state);

      // Browser-native TTS (Free & Instant)
      if ('speechSynthesis' in window && next_question) {
        const utterance = new SpeechSynthesisUtterance(next_question);
        utterance.lang = 'ar-XA'; // Attempt Arabic voice
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Error processing voice:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-mist-50 p-4">
      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-mist-900">Justice Kiosk</h1>
        <p className="text-mist-500">Tell us your story, we will help you find the law.</p>
      </header>

      <main className="flex-1">
        <BentoGrid className="grid-cols-2 gap-3 mb-8">
          <BentoCard
            name="Opponent"
            icon={<User className="w-4 h-4" />}
            description={caseState.opponent_name || "Missing"}
            className={caseState.opponent_name ? "border-sky-200 bg-sky-50" : ""}
          />
          <BentoCard
            name="Location"
            icon={<MapPin className="w-4 h-4" />}
            description={caseState.location || "Missing"}
            className={caseState.location ? "border-sky-200 bg-sky-50" : ""}
          />
          <BentoCard
            name="Date"
            icon={<Calendar className="w-4 h-4" />}
            description={caseState.date_of_incident || "Missing"}
            className={caseState.date_of_incident ? "border-sky-200 bg-sky-50" : ""}
          />
          <BentoCard
            name="Proof"
            icon={<FileText className="w-4 h-4" />}
            description={caseState.proof_type || "Missing"}
            className={caseState.proof_type ? "border-sky-200 bg-sky-50" : ""}
          />
        </BentoGrid>

        {caseState.description && (
          <div className="bg-white p-4 rounded-xl border border-mist-200 shadow-sm mb-8">
            <h3 className="text-xs font-bold text-mist-400 uppercase tracking-wider mb-2">Current Brief</h3>
            <p className="text-mist-800 text-sm leading-relaxed">{caseState.description}</p>
          </div>
        )}
      </main>

      <footer className="mt-auto pb-8 flex flex-col items-center">
        {caseState.is_complete ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="text-green-600 w-6 h-6" />
            <p className="text-green-800 font-medium">Brief is ready for the lawyer.</p>
          </div>
        ) : (
          <VoiceRecorder 
            onRecordingComplete={handleRecordingComplete} 
            isProcessing={isProcessing} 
          />
        )}
      </footer>
    </div>
  );
};
