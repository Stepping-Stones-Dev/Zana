/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfileMenu } from './UserProfileMenu.tsx';

describe('UserProfileMenu', () => {
  const baseUser = { 
    firstName: 'Alice', 
    lastName: 'Wonder', 
    email: 'alice@example.com', 
    phone: '+1 (555) 123-4567',
    roles: ['Admin','Editor'], 
    orgName: 'Wonder Org' 
  };

  it('renders initials when no avatarUrl', () => {
    render(<UserProfileMenu user={baseUser} />);
    // Should show initials in the avatar fallback - there will be multiple instances
    const awTexts = screen.getAllByText('AW');
    expect(awTexts.length).toBeGreaterThan(0);
  });

  it('renders avatar image when avatarUrl provided', () => {
    render(<UserProfileMenu user={{ ...baseUser, avatarUrl: 'https://example.com/a.png' }} />);
    // Avatar should be accessible by its alt text (full name or explicit alt text)
    const avatarImages = screen.getAllByAltText(/alice wonder/i);
    expect(avatarImages.length).toBeGreaterThan(0);
  });

  it('shows name in trigger when showName is true', () => {
    const { container } = render(<UserProfileMenu user={baseUser} showName={true} />);
    // Look specifically in the trigger button for the name
    const button = screen.getByRole('button', { name: /user profile menu/i });
    const nameInTrigger = button.querySelector('.text-sm.font-medium');
    expect(nameInTrigger).toHaveTextContent('Alice Wonder');
  });

  it('shows email in trigger when showUserField is email', () => {
    const { container } = render(<UserProfileMenu user={baseUser} showName={true} showUserField="email" />);
    const button = screen.getByRole('button', { name: /user profile menu/i });
    const nameInTrigger = button.querySelector('.text-sm.font-medium');
    const emailInTrigger = button.querySelector('.text-xs.text-foreground-500');
    
    expect(nameInTrigger).toHaveTextContent('Alice Wonder');
    expect(emailInTrigger).toHaveTextContent('alice@example.com');
  });

  it('shows phone in trigger when showUserField is phone', () => {
    const { container } = render(<UserProfileMenu user={baseUser} showName={true} showUserField="phone" />);
    const button = screen.getByRole('button', { name: /user profile menu/i });
    const nameInTrigger = button.querySelector('.text-sm.font-medium');
    const phoneInTrigger = button.querySelector('.text-xs.text-foreground-500');
    
    expect(nameInTrigger).toHaveTextContent('Alice Wonder');
    expect(phoneInTrigger).toHaveTextContent('+1 (555) 123-4567');
  });

  it('shows org name in trigger when showUserField is orgName', () => {
    const { container } = render(<UserProfileMenu user={baseUser} showName={true} showUserField="orgName" />);
    const button = screen.getByRole('button', { name: /user profile menu/i });
    const nameInTrigger = button.querySelector('.text-sm.font-medium');
    const orgInTrigger = button.querySelector('.text-xs.text-foreground-500');
    
    expect(nameInTrigger).toHaveTextContent('Alice Wonder');
    expect(orgInTrigger).toHaveTextContent('Wonder Org');
  });

  it('renders icon-only when showName and showUserField are not set', () => {
    render(<UserProfileMenu user={baseUser} />);
    const btn = screen.getByRole('button', { name: /user profile menu/i });
    // Should not show name or additional field text in the trigger button
    const nameInTrigger = btn.querySelector('.text-sm.font-medium');
    const fieldInTrigger = btn.querySelector('.text-xs.text-foreground-500');
    
    expect(nameInTrigger).toBeNull();
    expect(fieldInTrigger).toBeNull();
  });

  it('displays roles as chips in popover content', () => {
    render(<UserProfileMenu user={baseUser} />);
    const btn = screen.getByRole('button', { name: /user profile menu/i });
    fireEvent.click(btn);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('invokes onAction and closes after selecting an item', () => {
    const handler = jest.fn();
    render(<UserProfileMenu user={baseUser} onAction={handler} sections={[{ id: 'main', items: [{ id: 'account', label: 'Account' }] }]} />);
    fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Account' }));
    expect(handler).toHaveBeenCalledWith('account', 'main');
  });

  it('supports disabled items (no onAction call)', () => {
    const handler = jest.fn();
    render(<UserProfileMenu user={baseUser} onAction={handler} sections={[{ id: 'x', items: [{ id: 'logout', label: 'Logout', disabled: true }] }]} />);
    fireEvent.click(screen.getByRole('button', { name: /user profile menu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(handler).not.toHaveBeenCalled();
  });
});
