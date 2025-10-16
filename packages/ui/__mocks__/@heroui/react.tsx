// Mock for @heroui/react
import React from 'react';

// Mock all the HeroUI components - using React.createElement to avoid JSX compilation issues
export const Button = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
  const { isIconOnly, color, variant, size, isDisabled, onPress, ...domProps } = props;
  return React.createElement('button', { 
    ref, 
    disabled: isDisabled, 
    onClick: onPress,
    ...domProps 
  });
});

export const Popover = ({ children, isOpen }: { children: React.ReactNode; isOpen?: boolean }) => 
  React.createElement('div', {}, children);

export const PopoverTrigger = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const PopoverContent = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, any>((props, ref) => 
  React.createElement('div', { ref, ...props })
);

export const Avatar = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { src, name, fallback, showFallback, ...otherProps } = props;
  
  if (src) {
    return React.createElement('img', { 
      ref, 
      src, 
      alt: name || 'Avatar',
      ...otherProps 
    });
  }
  
  if (showFallback && fallback) {
    return React.createElement('div', { 
      ref, 
      'data-fallback': fallback,
      ...otherProps 
    }, fallback);
  }
  
  return React.createElement('div', { 
    ref, 
    ...otherProps 
  });
});

export const Switch = React.forwardRef<HTMLInputElement, any>((props, ref) => 
  React.createElement('input', { ref, type: 'checkbox', ...props })
);

export const Kbd = ({ children }: { children: React.ReactNode }) => 
  React.createElement('kbd', {}, children);

export const Badge = ({ children, color, className, ...props }: { children: React.ReactNode; color?: string; className?: string }) => 
  React.createElement('span', { 
    className: `${className || ''} badge-${color || 'default'}`.trim(), 
    ...props 
  }, children);

export const Card = ({ children, ...props }: { children: React.ReactNode }) => 
  React.createElement('div', { ...props }, children);

export const CardBody = ({ children, ...props }: { children: React.ReactNode }) => 
  React.createElement('div', { ...props }, children);

export const CardHeader = ({ children, ...props }: { children: React.ReactNode }) => 
  React.createElement('div', { ...props }, children);

export const Chip = ({ children, color, className, ...props }: { children: React.ReactNode; color?: string; className?: string }) => 
  React.createElement('span', { 
    className: `${className || ''} chip-${color || 'default'}`.trim(), 
    ...props 
  }, children);

export const Divider = (props: any) => 
  React.createElement('hr', { ...props });

export const Link = React.forwardRef<HTMLAnchorElement, any>((props, ref) => {
  const { href, isExternal, onPress, ...domProps } = props;
  return React.createElement('a', { 
    ref, 
    href, 
    target: isExternal ? '_blank' : undefined,
    rel: isExternal ? 'noopener noreferrer' : undefined,
    onClick: onPress,
    ...domProps 
  });
});

// Mock any other components that might be used
export default {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  Switch,
  Kbd,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Link,
};