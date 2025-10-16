/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppSwitcher } from './AppSwitcher.tsx';

// Helper to get a menuitem by name (supports mock popover content structure)
function getItem(name: RegExp) {
  return screen.getByRole('menuitem', { name });
}

describe('AppSwitcher', () => {
  it('renders default icon fallback when no current app', () => {
    render(<AppSwitcher apps={[]} />);
    expect(
      screen.getByRole('button', { name: /application switcher/i })
    ).toBeInTheDocument();
  });

  it('shows menu on click and selects an app', () => {
    const onSelect = jest.fn();
    const apps = [
      { name: 'Analytics', onClick: onSelect },
      { name: 'Billing', onClick: onSelect }
    ];
    render(<AppSwitcher apps={apps} />);
    const toggle = screen.getByRole('button', { name: /application switcher/i });
    fireEvent.click(toggle);
    const item = getItem(/Analytics/);
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('closes after selecting an app', () => {
    const onSelect = jest.fn();
    const apps = [
      { name: 'Analytics', onClick: onSelect },
      { name: 'Billing', onClick: onSelect }
    ];
    render(<AppSwitcher apps={apps} />);
    const toggle = screen.getByRole('button', { name: /application switcher/i });
    fireEvent.click(toggle);
    const item = getItem(/Analytics/);
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute('data-state', 'closed');
  });

  it('respects disabled items and does not invoke onClick', () => {
    const onSelect = jest.fn();
    const apps = [
      { name: 'Analytics', onClick: onSelect, disabled: true },
      { name: 'Billing', onClick: onSelect }
    ];
    render(<AppSwitcher apps={apps} />);
    const toggle = screen.getByRole('button', { name: /application switcher/i });
    fireEvent.click(toggle);
    const disabled = getItem(/Analytics/);
    fireEvent.click(disabled);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('highlights current app (aria-current)', () => {
    const apps = [
      { name: 'Analytics', onClick: () => {} },
      { name: 'Billing', onClick: () => {} }
    ];
    render(<AppSwitcher apps={apps} currentAppName="Billing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /application switcher/i })
    );
    const billing = getItem(/Billing/);
    expect(billing).toHaveAttribute('aria-current', 'true');
  });

  it('handles different alignment props', () => {
    const apps = [
      { name: 'Analytics', onClick: () => {} }
    ];
    
    // Test center alignment
    const { rerender } = render(<AppSwitcher apps={apps} align="center" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Test start alignment
    rerender(<AppSwitcher apps={apps} align="start" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Test end alignment
    rerender(<AppSwitcher apps={apps} align="end" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
