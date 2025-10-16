import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardHeader } from './DashboardHeader';

// Mock the theme switcher and notification bell
jest.mock('../ThemeSwitcher/ThemeSwitcher', () => ({
  ThemeSwitcher: ({ className }: { className?: string }) => (
    <div data-testid="theme-switcher" className={className}>
      Theme Switcher
    </div>
  ),
}));

jest.mock('../NotificationBell/NotificationBell', () => ({
  NotificationBell: ({ className, onNotificationClick }: { className?: string; onNotificationClick?: () => void }) => (
    <button data-testid="notification-bell" className={className} onClick={onNotificationClick}>
      Notifications
    </button>
  ),
}));

describe('DashboardHeader', () => {
  it('renders with default props', () => {
    render(<DashboardHeader />);
    
    // Should render the header element
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const title = 'Dashboard Title';
    render(<DashboardHeader title={title} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('renders logo when provided', () => {
    const logo = <div data-testid="logo">Logo</div>;
    render(<DashboardHeader logo={logo} />);
    
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders all controls by default', () => {
    render(<DashboardHeader />);
    
    expect(screen.getByLabelText('Open Calendar')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument(); // Language switcher
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('hides controls when disabled', () => {
    render(
      <DashboardHeader
        showCalendar={false}
        showLanguageSwitcher={false}
        showThemeSwitcher={false}
        showNotifications={false}
      />
    );
    
    expect(screen.queryByLabelText('Open Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('EN')).not.toBeInTheDocument();
    expect(screen.queryByTestId('theme-switcher')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
  });

  it('calls calendar click handler', () => {
    const handleCalendarClick = jest.fn();
    render(<DashboardHeader onCalendarClick={handleCalendarClick} />);
    
    fireEvent.click(screen.getByLabelText('Open Calendar'));
    expect(handleCalendarClick).toHaveBeenCalledTimes(1);
  });

  it('calls notification click handler', () => {
    const handleNotificationClick = jest.fn();
    render(<DashboardHeader onNotificationClick={handleNotificationClick} />);
    
    fireEvent.click(screen.getByTestId('notification-bell'));
    expect(handleNotificationClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const customClass = 'custom-header-class';
    render(<DashboardHeader className={customClass} />);
    
    expect(screen.getByRole('banner')).toHaveClass(customClass);
  });

  it('applies correct position styles', () => {
    const { rerender } = render(<DashboardHeader position="fixed" />);
    expect(screen.getByRole('banner')).toHaveClass('fixed');
    
    rerender(<DashboardHeader position="sticky" />);
    expect(screen.getByRole('banner')).toHaveClass('sticky');
    
    rerender(<DashboardHeader position="static" />);
    expect(screen.getByRole('banner')).toHaveClass('relative');
  });

  it('applies correct size styles', () => {
    const { rerender } = render(<DashboardHeader size="sm" />);
    expect(screen.getByRole('banner')).toHaveClass('h-14');
    
    rerender(<DashboardHeader size="md" />);
    expect(screen.getByRole('banner')).toHaveClass('h-16');
    
    rerender(<DashboardHeader size="lg" />);
    expect(screen.getByRole('banner')).toHaveClass('h-20');
  });

  it('renders custom actions in center', () => {
    const actions = <div data-testid="custom-actions">Custom Actions</div>;
    render(<DashboardHeader actions={actions} />);
    
    expect(screen.getByTestId('custom-actions')).toBeInTheDocument();
  });
});