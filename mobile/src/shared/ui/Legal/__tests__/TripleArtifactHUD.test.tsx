import React from 'react';
import { render } from '@testing-library/react-native';
import { TripleArtifactHUD } from '../TripleArtifactHUD';

describe('TripleArtifactHUD', () => {
  it('renders 3 empty slots when citations are empty', () => {
    const { getAllByTestId } = render(<TripleArtifactHUD citations={[]} />);
    const emptySlots = getAllByTestId('empty-artifact-slot');
    expect(emptySlots.length).toBe(3);
  });

  it('renders citations and fills the rest with empty slots', () => {
    const citations = [
      { article_number: '1', law_name: 'Law 1', law_code: 'law1', claim_supported: 'Claim 1' }
    ];
    const { getByText, getAllByTestId } = render(<TripleArtifactHUD citations={citations} />);
    expect(getByText('فصل 1')).toBeTruthy();
    
    // 1 citation + 2 empty slots = 3 total visual elements
    const emptySlots = getAllByTestId('empty-artifact-slot');
    expect(emptySlots.length).toBe(2);
  });

  it('renders maximum 3 citations', () => {
    const citations = [
      { article_number: '1', law_name: 'L1', law_code: 'l1', claim_supported: 'C1' },
      { article_number: '2', law_name: 'L2', law_code: 'l2', claim_supported: 'C2' },
      { article_number: '3', law_name: 'L3', law_code: 'l3', claim_supported: 'C3' },
      { article_number: '4', law_name: 'L4', law_code: 'l4', claim_supported: 'C4' },
    ];
    const { getByText, queryByText } = render(<TripleArtifactHUD citations={citations} />);
    expect(getByText('فصل 1')).toBeTruthy();
    expect(getByText('فصل 2')).toBeTruthy();
    expect(getByText('فصل 3')).toBeTruthy();
    expect(queryByText('فصل 4')).toBeNull();
  });
});
