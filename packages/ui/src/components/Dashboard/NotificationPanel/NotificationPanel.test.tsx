/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationPanel, NotificationItem, NotificationManagementConfig } from './NotificationPanel';

// Mock data
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Urgent Security Alert',
    message: 'Suspicious login attempt detected from unknown device',
    timestamp: new Date(),
    priority: 'urgent',
    status: 'unread',
    category: 'Security',
  },
  {
    id: '2',
    title: 'System Update Available',
    message: 'A new system update is ready to install',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    priority: 'normal',
    status: 'unread',
    category: 'System',
  },
  {
    id: '3',
    title: 'Task Completed',
    message: 'Your data export has finished processing',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    priority: 'low',
    status: 'read',
    category: 'Tasks',
  },
  {
    id: '4',
    title: 'Maintenance Scheduled',
    message: 'System maintenance will begin at 3 AM',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    priority: 'high',
    status: 'unread',
    category: 'System',
  },
];

const defaultProps = {
  notifications: mockNotifications,
  isOpen: true,
  onOpenChange: jest.fn(),
};

const mockHandlers = {
  onNotificationClick: jest.fn(),
  onNotificationArchive: jest.fn(),
  onNotificationDelete: jest.fn(),
  onNotificationMarkAsRead: jest.fn(),
  onMarkAllAsRead: jest.fn(),
};

describe('NotificationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the notification panel with correct header', () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('3 unread')).toBeInTheDocument();
    expect(screen.getByText('Mark all as read')).toBeInTheDocument();
  });

  it('displays notifications grouped by time periods', () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    // Should show urgent section
    expect(screen.getByText('URGENT')).toBeInTheDocument();
    expect(screen.getByText('Urgent Security Alert')).toBeInTheDocument();
    
    // Should show today section  
    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(screen.getByText('System Update Available')).toBeInTheDocument();
    
    // Should show earlier section
    expect(screen.getByText('EARLIER')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Scheduled')).toBeInTheDocument();
  });

  it('shows unread indicators for unread notifications', () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    // Urgent notification should have unread indicator
    const urgentNotification = screen.getByText('Urgent Security Alert').closest('[data-analytics-id*="item"]');
    expect(urgentNotification).toHaveClass('border-primary');
  });

  it('handles notification click', async () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    const notificationTitle = screen.getByText('System Update Available');
    fireEvent.click(notificationTitle);
    
    await waitFor(() => {
      expect(mockHandlers.onNotificationClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: '2', title: 'System Update Available' })
      );
    });
  });

  it('handles mark all as read', async () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    const markAllButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllButton);
    
    await waitFor(() => {
      expect(mockHandlers.onMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it('shows management actions when hovering over notification', async () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    const notificationItem = screen.getByText('System Update Available').closest('[data-analytics-id*="item"]');
    
    // Hover over the notification
    if (notificationItem) {
      fireEvent.mouseOver(notificationItem);
    }
    
    // Should show dropdown trigger button
    const dropdownButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('[data-testid*="ellipsis"]') || btn.querySelector('svg')
    );
    expect(dropdownButton).toBeInTheDocument();
  });

  it('handles archive action', async () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    // Find and click a notification's dropdown menu
    const dropdownButtons = screen.getAllByRole('button');
    const menuButton = dropdownButtons.find(btn => btn.querySelector('svg'));
    
    if (menuButton) {
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const archiveButton = screen.getByText('Archive');
        fireEvent.click(archiveButton);
        
        expect(mockHandlers.onNotificationArchive).toHaveBeenCalled();
      });
    }
  });

  it('hides management controls when disabled in config', () => {
    const restrictedConfig: NotificationManagementConfig = {
      showArchive: false,
      showDelete: false,
      showMarkAsRead: false,
      showOpen: true,
    };

    render(
      <NotificationPanel 
        {...defaultProps} 
        {...mockHandlers}
        managementConfig={restrictedConfig}
      />
    );

    // Mark all as read should be hidden
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });

  it('displays empty state when no notifications', () => {
    render(
      <NotificationPanel 
        {...defaultProps}
        {...mockHandlers}
        notifications={[]}
      />
    );
    
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('shows correct priority indicators', () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    // Should show priority chips for high/urgent notifications
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('filters out archived notifications', () => {
    const notificationsWithArchived = [
      ...mockNotifications,
      {
        id: '5',
        title: 'Archived Notification',
        message: 'This should not appear',
        timestamp: new Date(),
        priority: 'normal' as const,
        status: 'archived' as const,
      }
    ];

    render(
      <NotificationPanel 
        {...defaultProps}
        {...mockHandlers}
        notifications={notificationsWithArchived}
      />
    );
    
    expect(screen.queryByText('Archived Notification')).not.toBeInTheDocument();
  });

    
    // Should show badge with count on the bell icon
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles custom empty state message', () => {
    render(
      <NotificationPanel 
        {...defaultProps}
        {...mockHandlers}
        notifications={[]}
        emptyStateMessage="You're all caught up!"
      />
    );
    
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    render(<NotificationPanel {...defaultProps} {...mockHandlers} />);
    
    // Should show relative timestamps
    expect(screen.getByText(/\d+[hm] ago/)).toBeInTheDocument();
  });

  it('handles popover open/close', async () => {
    const onOpenChange = jest.fn();
    render(
      <NotificationPanel 
        {...defaultProps}
        {...mockHandlers}
      />
    );
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
});