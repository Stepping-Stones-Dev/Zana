/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

describe('ThemeSwitcher', () => {
  it('renders with initial theme label', () => {
    render(<ThemeSwitcher />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label');
  });

  it('toggles theme on click and updates aria-label', () => {
    render(<ThemeSwitcher />);
    const btn = screen.getByRole('button');
    const firstLabel = btn.getAttribute('aria-label');
    fireEvent.click(btn);
    const secondLabel = btn.getAttribute('aria-label');
    expect(secondLabel).not.toEqual(firstLabel);
  });
});
