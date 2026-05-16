import { intakeApi } from '../intake';
import api from '../../../../shared/api/client';

jest.mock('../../../../shared/api/client');

describe('intakeApi', () => {
  it('processVoice sends a FormData with file and state', async () => {
    const mockResponse = {
      data: {
        updated_state: { is_complete: false },
        transcript: 'test transcript',
        next_question: 'test question',
      },
    };
    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const file = {
      uri: 'file://test.wav',
      name: 'test.wav',
      type: 'audio/wav',
    };
    const state = { is_complete: false };

    const result = await intakeApi.processVoice(file, state);

    expect(api.post).toHaveBeenCalledWith(
      'intake/voice',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
    expect(result).toEqual(mockResponse.data);
  });
});
