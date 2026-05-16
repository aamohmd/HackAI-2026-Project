import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { ShieldCheck, ShieldWarning, ShieldSlash } from 'phosphor-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export type ConfidenceLevel = 'high' | 'medium' | 'low';

interface Props {
  score: number;
}

/**
 * ConfidenceBadge component to display the result of the multi-agent debate.
 * Visualizes how 'grounded' the legal answer is in the current context.
 */
export const ConfidenceBadge: React.FC<Props> = ({ score }) => {
  let level: ConfidenceLevel = 'low';
  if (score >= 0.8) level = 'high';
  else if (score >= 0.5) level = 'medium';

  const config = {
    high: {
      color: '#065F46', // Emerald 800
      bg: '#D1FAE5', // Emerald 100
      icon: <ShieldCheck size={14} color="#065F46" weight="bold" />,
      label: 'Mowattaq (Verified)',
    },
    medium: {
      color: '#92400E', // Amber 800
      bg: '#FEF3C7', // Amber 100
      icon: <ShieldWarning size={14} color="#92400E" weight="bold" />,
      label: 'Muhtamil (Likely)',
    },
    low: {
      color: '#991B1B', // Red 800
      bg: '#FEE2E2', // Red 100
      icon: <ShieldSlash size={14} color="#991B1B" weight="bold" />,
      label: 'Daif (Uncertain)',
    },
  }[level];

  return (
    <StyledView 
      className="flex-row items-center px-2 py-1 rounded-full self-start"
      style={{ backgroundColor: config.bg }}
    >
      <StyledView className="mr-1">{config.icon}</StyledView>
      <StyledText 
        className="font-bold uppercase tracking-wider text-[8px] font-sans"
        style={{ color: config.color }}
      >
        {config.label}
      </StyledText>
    </StyledView>
  );
};
