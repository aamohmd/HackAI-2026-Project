import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HybridIntake } from '../HybridIntake';

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

// Mock phosphor-react-native to return specific testIDs for icons
jest.mock('phosphor-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Microphone: (props: any) => <View testID="mic-icon" {...props} />,
    ArrowRight: (props: any) => <View testID="submit-icon" {...props} />,
    Stop: (props: any) => <View testID="stop-icon" {...props} />,
  };
});

describe('HybridIntake', () => {
  it('shows microphone icon when empty and arrow icon when typing', () => {
    const { getByPlaceholderText, queryByTestId } = render(
      <HybridIntake onVoiceComplete={() => {}} onTextSubmit={() => {}} />
    );
    
    const input = getByPlaceholderText('Describe your case...');
    
    // Initially shows mic
    expect(queryByTestId('mic-icon')).toBeTruthy();
    expect(queryByTestId('submit-icon')).toBeNull();
    
    // Type something
    fireEvent.changeText(input, 'Hello');
    
    expect(queryByTestId('mic-icon')).toBeNull();
    expect(queryByTestId('submit-icon')).toBeTruthy();
  });

  it('calls onTextSubmit and clears input when submit button is pressed', () => {
    const onTextSubmit = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <HybridIntake onVoiceComplete={() => {}} onTextSubmit={onTextSubmit} />
    );
    
    const input = getByPlaceholderText('Describe your case...');
    fireEvent.changeText(input, 'Test message');
    
    const submitButton = getByTestId('action-button');
    fireEvent.press(submitButton);
    
    expect(onTextSubmit).toHaveBeenCalledWith('Test message');
    expect(input.props.value).toBe('');
  });
});
