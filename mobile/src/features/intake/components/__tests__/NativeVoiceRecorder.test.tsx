import React from 'react';
import { render } from '@testing-library/react-native';
import { NativeVoiceRecorder } from '../NativeVoiceRecorder';

// Basic mocks for native modules and libraries
jest.mock('expo-av', () => ({
  Audio: {
    usePermissions: () => [{ status: 'granted' }, jest.fn()],
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          stopAndUnloadAsync: jest.fn(),
          getURI: () => 'test-uri.wav',
        },
      }),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => children,
}));

jest.mock('phosphor-react-native', () => ({
  Microphone: ({ size, color }: any) => null,
  Stop: ({ size, color }: any) => null,
}));

// Mock nativewind styled component if needed, 
// but usually it works with standard render if it's just classes.
// If it fails, we can mock 'nativewind'

describe('NativeVoiceRecorder', () => {
  it('renders correctly', () => {
    const { getByText } = render(<NativeVoiceRecorder onRecordingComplete={jest.fn()} />);
    expect(getByText('Record Statement')).toBeTruthy();
    expect(getByText('Your statement will be transcribed by the Neural Core')).toBeTruthy();
  });
});
