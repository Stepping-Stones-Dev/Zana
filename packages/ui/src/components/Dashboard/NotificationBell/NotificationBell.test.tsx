/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationBell } from './NotificationBell.tsx';

const sampleNotifications = [
  { 
    id: '1', 
    title: 'Welcome', 
    message: 'Thanks for joining', 
    timestamp: new Date(), 
    priority: 'normal' as const,
    status: 'unread' as const,
    category: 'system' 
  },
  { 
    id: '2', 
    title: 'Billing Update', 
    message: 'Invoice ready', 
    timestamp: new Date(), 
    priority: 'normal' as const,
    status: 'read' as const,
    category: 'billing' 
  }
];

describe('NotificationBell', () => {
  it('renders bell button and shows panel on open', () => {
    render(<NotificationBell notifications={sampleNotifications} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);
    // Check for dialog that contains the notifications
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows unread badge count', () => {
    render(<NotificationBell notifications={sampleNotifications} />);
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('handles auto alignment with window positioning - right edge', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    render(<NotificationBell notifications={sampleNotifications} align="auto" autoEdgeThreshold={100} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    
    // Mock the ref's getBoundingClientRect - close to right edge
    jest.spyOn(btn, 'getBoundingClientRect').mockReturnValue({
      left: 900,
      right: 1000,
      top: 100,
      bottom: 150,
      width: 100,
      height: 50,
      x: 900,
      y: 100,
      toJSON: () => ({})
    });

    fireEvent.click(btn);
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('handles auto alignment with window positioning - left edge', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    render(<NotificationBell notifications={sampleNotifications} align="auto" autoEdgeThreshold={100} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    
    // Mock the ref's getBoundingClientRect - close to left edge
    jest.spyOn(btn, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 200,
      top: 100,
      bottom: 150,
      width: 150,
      height: 50,
      x: 50,
      y: 100,
      toJSON: () => ({})
    });

    fireEvent.click(btn);
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('handles auto alignment with window positioning - center', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    render(<NotificationBell notifications={sampleNotifications} align="auto" autoEdgeThreshold={100} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    
    // Mock the ref's getBoundingClientRect - center position
    jest.spyOn(btn, 'getBoundingClientRect').mockReturnValue({
      left: 400,
      right: 500,
      top: 100,
      bottom: 150,
      width: 100,
      height: 50,
      x: 400,
      y: 100,
      toJSON: () => ({})
    });

    fireEvent.click(btn);
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('handles alignment changes properly', () => {
    const { rerender } = render(<NotificationBell notifications={sampleNotifications} align="start" />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();

    // Test alignment change
    rerender(<NotificationBell notifications={sampleNotifications} align="center" />);
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
  });

  it('handles close callback', () => {
    render(<NotificationBell notifications={sampleNotifications} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);
    
    const dialog = screen.getByRole('dialog', { name: /notifications/i });
    expect(dialog).toBeInTheDocument();
    
    // Close by clicking outside or pressing escape
    fireEvent.keyDown(dialog, { key: 'Escape' });
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationBell notifications={[]} emptyStateMessage="No notifications" />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);
    
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('displays custom unread count override', () => {
    render(<NotificationBell notifications={sampleNotifications} unreadCount={42} />);
    const badge = screen.getByText('42');
    expect(badge).toBeInTheDocument();
  });

  it('handles notification management actions', () => {
    const mockArchive = jest.fn();
    const mockDelete = jest.fn();
    const mockMarkAsRead = jest.fn();
    const mockClick = jest.fn();

    render(
      <NotificationBell 
        notifications={sampleNotifications}
        onNotificationArchive={mockArchive}
        onNotificationDelete={mockDelete}
        onNotificationMarkAsRead={mockMarkAsRead}
        onNotificationClick={mockClick}
        managementConfig={{
          showArchive: true,
          showDelete: true,
          showMarkAsRead: true,
          showOpen: true
        }}
      />
    );

    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);

    // The panel should render the notifications
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Billing Update')).toBeInTheDocument();
  });

  it('handles urgent notifications priority', () => {
    const urgentNotifications = [
      {
        id: '3',
        title: 'Critical Alert',
        message: 'System down',
        timestamp: new Date(),
        priority: 'urgent' as const,
        status: 'unread' as const,
        category: 'system'
      }
    ];

    render(<NotificationBell notifications={urgentNotifications} />);
    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);

    expect(screen.getByText('Critical Alert')).toBeInTheDocument();
  });

  it('handles mark all as read functionality', () => {
    const mockMarkAllRead = jest.fn();
    const unreadNotifications = sampleNotifications.map(n => ({ ...n, status: 'unread' as const }));

    render(
      <NotificationBell 
        notifications={unreadNotifications}
        onMarkAllAsRead={mockMarkAllRead}
      />
    );

    const btn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(btn);

    // Look for mark all as read button and click it
    const markAllBtn = screen.getByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllBtn);

    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('shows correct unread count in badge', () => {
    const mixedNotifications = [
      ...sampleNotifications,
      { 
        id: '3', 
        title: 'Another unread', 
        message: 'Test', 
        timestamp: new Date(), 
        priority: 'normal' as const,
        status: 'unread' as const,
        category: 'system' 
      }
    ];

    render(<NotificationBell notifications={mixedNotifications} />);
    // Should show 2 unread (id: '1' and id: '3')
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('handles custom analytics id', () => {
    render(
      <NotificationBell 
        notifications={sampleNotifications} 
        analyticsId="custom-analytics"
      />
    );

    const btn = screen.getByRole('button', { name: /notifications/i });
    expect(btn).toHaveAttribute('data-analytics-id', 'custom-analytics.trigger');
  });
});
