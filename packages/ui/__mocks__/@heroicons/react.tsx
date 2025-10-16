// Mock for @heroicons/react
import React from 'react';

// Mock icon components - using React.createElement to avoid JSX compilation issues
const MockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement('svg', { 'data-testid': 'mock-icon', ...props }, 
    React.createElement('path', {})
  );

// Export all the icons that might be used
export const ChevronDownIcon = MockIcon;
export const Cog6ToothIcon = MockIcon;
export const BellIcon = MockIcon;
export const UserIcon = MockIcon;
export const SunIcon = MockIcon;
export const MoonIcon = MockIcon;
export const ComputerDesktopIcon = MockIcon;
export const Squares2X2Icon = MockIcon;
export const ExclamationTriangleIcon = MockIcon;
export const ClockIcon = MockIcon;
export const EllipsisVerticalIcon = MockIcon;
export const EllipsisHorizontalIcon = MockIcon;
export const ChevronLeftIcon = MockIcon;
export const ChevronRightIcon = MockIcon;
export const Bars3Icon = MockIcon;
export const XMarkIcon = MockIcon;