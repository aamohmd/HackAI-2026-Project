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

export interface IntakeResponse {
  updated_state: LandDisputeState;
  transcript: string;
  next_question: string;
}

export const intakeApi = {
  processVoice: async (file: { uri: string; name: string; type: string }, state: LandDisputeState): Promise<IntakeResponse> => {
    const formData = new FormData();
    
    // In React Native, FormData.append for files expects this structure
    formData.append('file', {
      uri: Platform.OS === 'android' && !file.uri.startsWith('file://') ? `file://${file.uri}` : file.uri,
      name: file.name,
      type: file.type,
    } as any);
    
    formData.append('state_json', JSON.stringify(state));

    const token = await getAccessToken();
    const baseUrl = api.defaults.baseURL;

    const response = await fetch(`${baseUrl}intake/voice`, {
      method: 'POST',
      body: formData,
      headers: {
        // DO NOT set Content-Type manually with fetch, it adds the boundary automatically
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
      state_json: JSON.stringify(state)
    });
    return response.data;
  },
};
