import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Props {
  text?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MotabaqStamp: React.FC<Props> = ({ 
  text = "MOTABAQ", 
  color = "#9A3412",
  size = "md"
}) => {
  const fontSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const padding = size === 'sm' ? 'px-2 py-0.5' : size === 'lg' ? 'px-6 py-2' : 'px-4 py-1';
  const borderWidth = size === 'sm' ? 'border' : 'border-2';

  return (
    <StyledView 
      className={`${padding} ${borderWidth} rounded-sm items-center justify-center rotate-[-12deg] opacity-80`}
      style={{ borderColor: color }}
    >
      <StyledText 
        className={`${fontSize} font-serif font-bold uppercase tracking-[2]`}
        style={{ color: color }}
      >
        {text}
      </StyledText>
      <StyledView 
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: color }}
      />
    </StyledView>
  );
};
