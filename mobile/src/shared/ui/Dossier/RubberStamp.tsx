import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export const RubberStamp = ({ text }: { text: string }) => (
  <StyledView 
    className="absolute -bottom-2 -right-2 border-4 border-wax/40 px-3 py-1 rounded shadow-sm"
    style={{ transform: [{ rotate: '-12deg' }] }}
  >
    <StyledText className="text-wax/50 font-bold uppercase text-xs">
      {text}
    </StyledText>
  </StyledView>
);
