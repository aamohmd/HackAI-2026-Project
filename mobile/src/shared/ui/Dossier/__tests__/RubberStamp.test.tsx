import React from 'react';
import { render } from '@testing-library/react-native';
import { RubberStamp } from '../RubberStamp';

describe('RubberStamp', () => {
  it('renders correctly with provided text', () => {
    const { getByText } = render(<RubberStamp text="MOTABAQ" />);
    expect(getByText('MOTABAQ')).toBeTruthy();
  });
});
