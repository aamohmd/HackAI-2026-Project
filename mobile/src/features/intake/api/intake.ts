import api from '@/shared/api/client';

export interface Citation {
  article_number: string;
  law_name: string;
  law_code: string;
  claim_supported: string;
}

export interface MizanResult {
  answer_darija: string;
  citations: Citation[];
  confidence: number;
  recommend_lawyer: boolean;
  answer_register: 'simple' | 'standard' | 'technical';
}

export interface LandDisputeState {
  claimant_name?: string;
  opponent_name?: string;
  location?: string;
  date_of_incident?: string;
  proof_type?: string;
  description?: string;
  is_complete: boolean;
  interim_citations?: Citation[];
  mizan_result?: MizanResult;
}

export interface VoiceResponse {
  updated_state: LandDisputeState;
  transcript: string;
  next_question: string;
}

export const intakeApi = {
  processVoice: async (file: { uri: string; name: string; type: string }, state: LandDisputeState): Promise<VoiceResponse> => {
    const formData = new FormData();
    
    // In React Native, FormData.append for files expects this structure
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    
    formData.append('state_json', JSON.stringify(state));

    const response = await api.post('intake/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
