import { Platform } from 'react-native';
import api, { getAccessToken } from '@/shared/api/client';

export interface Citation {
  article_number: string;
  law_name: string;
  law_code: string;
  claim_supported: string;
}

export interface MizanResult {
  answer_darija: string;
  answer_verbal?: string;
  audio_url?: string;
  citations: Citation[];
  confidence: number;
  recommend_lawyer: boolean;
  answer_register: 'simple' | 'standard' | 'technical';
}

export interface LandDisputeState {
  dossier_id?: string;
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

export interface IntakeResponse {
  updated_state: LandDisputeState;
  transcript: string;
  next_question: string;
  next_question_audio_url?: string;
  dossier_id: string;
}

export const intakeApi = {
  processVoice: async (file: { uri: string; name: string; type: string }, state: LandDisputeState): Promise<IntakeResponse> => {
    const formData = new FormData();
    
    formData.append('file', {
      uri: Platform.OS === 'android' && !file.uri.startsWith('file://') ? `file://${file.uri}` : file.uri,
      name: file.name,
      type: file.type,
    } as any);
    
    formData.append('state_json', JSON.stringify(state));
    if (state.dossier_id) {
      formData.append('dossier_id', state.dossier_id);
    }

    const token = await getAccessToken();
    const baseUrl = api.defaults.baseURL;

    const response = await fetch(`${baseUrl}intake/voice`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },

  processText: async (text: string, state: LandDisputeState): Promise<IntakeResponse> => {
    const response = await api.post('intake/text', {
      text,
      state_json: JSON.stringify(state),
      dossier_id: state.dossier_id
    });
    return response.data;
  },
};

