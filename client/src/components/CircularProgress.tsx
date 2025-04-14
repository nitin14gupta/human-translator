import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  percentage: number;
  radius: number;
  strokeWidth: number;
  color?: string;
  bgColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  radius,
  strokeWidth,
  color = '#1a73e8',
  bgColor = '#e5e7eb',
}) => {
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - percentage) / 100) * circumference;

  return (
    <View>
      <Svg width={radius * 2} height={radius * 2}>
        {/* Background Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          fill="none"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
    </View>
  );
};

export default CircularProgress; 