import React, { useState, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-24 h-24 rounded-full bg-sky-500/20 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center">
              <Mic className="text-white w-8 h-8" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className={`w-20 h-20 rounded-full shadow-xl transition-all ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-600 hover:bg-sky-700'
        }`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : isRecording ? (
          <Square className="w-10 h-10 fill-current" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </Button>
      
      <p className="text-mist-600 font-medium">
        {isProcessing ? "Processing..." : isRecording ? "Release to Send" : "Hold to Speak (Darija)"}
      </p>
    </div>
  );
};
