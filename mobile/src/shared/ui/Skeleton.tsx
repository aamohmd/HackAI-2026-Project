import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledMotiView = styled(MotiView);

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  className = "" 
}) => {
  return (
    <StyledView 
      className={`bg-midnight/5 overflow-hidden ${className}`}
      style={{ width: width as any, height: height as any, borderRadius }}
    >
      <StyledMotiView
        from={{ translateX: -width as any }}
        animate={{ translateX: width as any }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
          repeatReverse: false,
        }}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            width: '30%',
          }
        ]}
      />
    </StyledView>
  );
};

export const DossierSkeleton = () => (
  <StyledView className="mb-4 bg-white/40 border-2 border-midnight/5 rounded-sm p-5">
    <Skeleton width={80} height={10} className="mb-2" />
    <Skeleton width="70%" height={24} className="mb-4" />
    <StyledView className="flex-row items-center mb-1">
      <Skeleton width={100} height={12} />
    </StyledView>
    <StyledView className="mt-4 pt-4 border-t border-midnight/5">
      <Skeleton width="100%" height={40} />
    </StyledView>
  </StyledView>
);
