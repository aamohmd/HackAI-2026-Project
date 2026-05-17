import api from '@/shared/api/client';
import { LegalDossierState } from './intake';

export interface DossierEntry {
  id: string;
  state: LegalDossierState;
  status: 'draft' | 'sealed';
  created_at: string;
  updated_at: string;
}

export const dossiersApi = {
  list: async (): Promise<DossierEntry[]> => {
    const response = await api.get('dossiers/');
    return response.data;
  },
  get: async (id: string): Promise<DossierEntry> => {
    const response = await api.get(`dossiers/${id}`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`dossiers/${id}`);
  }
};
