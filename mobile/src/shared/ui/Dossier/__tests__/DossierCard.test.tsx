import React from 'react';
import { render } from '@testing-library/react-native';
import { DossierCard } from '../DossierCard';
import { View } from 'react-native';

describe('DossierCard', () => {
  it('renders correctly with name and icon', () => {
    const MockIcon = () => <View testID="mock-icon" />;
    const { getByText, getByTestId } = render(
      <DossierCard name="TEST_DOSSIER" icon={<MockIcon />} description="Test description" />
    );
    expect(getByText('TEST_DOSSIER')).toBeTruthy();
    expect(getByTestId('mock-icon')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
  });

  it('renders RubberStamp when completed', () => {
    const MockIcon = () => <View testID="mock-icon" />;
    const { getByText } = render(
      <DossierCard name="TEST_DOSSIER" icon={<MockIcon />} completed={true} />
    );
    expect(getByText('MOTABAQ')).toBeTruthy();
  });
});
