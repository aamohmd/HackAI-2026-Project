import React from 'react';
import { render } from '@testing-library/react-native';
import { LegalArtifact } from '../LegalArtifact';

describe('LegalArtifact', () => {
  it('renders citation correctly', () => {
    const mockCitation = {
      article_number: '49',
      law_name: 'Moudawana',
      law_code: 'moudawana',
      claim_supported: 'Women have the right to...',
    };

    const { getByText } = render(<LegalArtifact citation={mockCitation} />);
    expect(getByText('فصل 49')).toBeTruthy();
    expect(getByText('Moudawana')).toBeTruthy();
    expect(getByText('"Women have the right to..."')).toBeTruthy();
  });
});
