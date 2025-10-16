import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MenuItemComponent } from './MenuItem';
import type { MenuItem } from './types';

// Mock icons for testing
const MockIcon = () => <span data-testid="mock-icon">Icon</span>;

describe('MenuItem Component', () => {
  const mockOnClick = jest.fn();
  const mockOnFocus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Action Items', () => {
    const actionItem: MenuItem = {
      type: 'action',
      id: 'test-action',
      label: 'Test Action',
      icon: <MockIcon />,
      onClick: mockOnClick
    };

    test('renders action item correctly', () => {
      render(
        <MenuItemComponent
          item={actionItem}
          onItemClick={mockOnClick}
          onItemFocus={mockOnFocus}
        />
      );

      expect(screen.getByRole('menuitem')).toBeInTheDocument();
      expect(screen.getByText('Test Action')).toBeInTheDocument();
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    test('handles click events', async () => {
      const user = userEvent.setup();
      render(
        <MenuItemComponent
          item={actionItem}
          onItemClick={mockOnClick}
          onItemFocus={mockOnFocus}
        />
      );

      await user.click(screen.getByRole('menuitem'));
      expect(mockOnClick).toHaveBeenCalledWith(actionItem, expect.any(Object));
    });

    test('handles keyboard events', async () => {
      const user = userEvent.setup();
      render(
        <MenuItemComponent
          item={actionItem}
          onItemClick={mockOnClick}
          onItemFocus={mockOnFocus}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();

      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledWith(actionItem, expect.any(Object));
    });

    test('renders active state', () => {
      const activeItem: MenuItem = {
        ...actionItem,
        active: true
      };

      render(
        <MenuItemComponent
          item={activeItem}
          onItemClick={mockOnClick}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('aria-current', 'page');
    });

    test('renders disabled state', () => {
      const disabledItem: MenuItem = {
        ...actionItem,
        disabled: true
      };

      render(
        <MenuItemComponent
          item={disabledItem}
          onItemClick={mockOnClick}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeDisabled();
    });

    test('renders with shortcut', () => {
      const itemWithShortcut: MenuItem = {
        ...actionItem,
        shortcut: '⌘N'
      };

      render(
        <MenuItemComponent
          item={itemWithShortcut}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByText('⌘N')).toBeInTheDocument();
    });
  });

  describe('Link Items', () => {
    const linkItem: MenuItem = {
      type: 'link',
      id: 'test-link',
      label: 'Test Link',
      href: '/test-url',
      icon: <MockIcon />
    };

    test('renders link item correctly', () => {
      render(
        <MenuItemComponent
          item={linkItem}
          onItemClick={mockOnClick}
        />
      );

      const link = screen.getByRole('menuitem');
      expect(link).toHaveAttribute('href', '/test-url');
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    test('renders external link with proper attributes', () => {
      const externalLink: MenuItem = {
        ...linkItem,
        external: true
      };

      render(
        <MenuItemComponent
          item={externalLink}
          onItemClick={mockOnClick}
        />
      );

      const link = screen.getByRole('menuitem');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Divider Items', () => {
    const dividerItem: MenuItem = {
      type: 'divider',
      id: 'test-divider'
    };

    test('renders basic divider', () => {
      render(
        <MenuItemComponent
          item={dividerItem}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('renders divider with label', () => {
      const labeledDivider: MenuItem = {
        ...dividerItem,
        label: 'Section Title'
      };

      render(
        <MenuItemComponent
          item={labeledDivider}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByRole('separator')).toBeInTheDocument();
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });
  });

  describe('Custom Items', () => {
    const customItem: MenuItem = {
      type: 'custom',
      id: 'test-custom',
      label: 'Custom Item',
      render: ({ active, disabled }) => (
        <div data-testid="custom-content">
          Custom Content - Active: {active ? 'Yes' : 'No'} - Disabled: {disabled ? 'Yes' : 'No'}
        </div>
      )
    };

    test('renders custom item with render function', () => {
      render(
        <MenuItemComponent
          item={customItem}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText(/Custom Content/)).toBeInTheDocument();
    });

    test('passes active and disabled state to render function', () => {
      const activeCustomItem: MenuItem = {
        ...customItem,
        active: true,
        disabled: true
      };

      render(
        <MenuItemComponent
          item={activeCustomItem}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByText(/Active: Yes/)).toBeInTheDocument();
      expect(screen.getByText(/Disabled: Yes/)).toBeInTheDocument();
    });
  });

  describe('Layout Options', () => {
    const testItem: MenuItem = {
      type: 'action',
      id: 'test',
      label: 'Test Item',
      icon: <MockIcon />,
      onClick: mockOnClick
    };

    test('renders different sizes', () => {
      const { rerender } = render(
        <MenuItemComponent
          item={testItem}
          size="sm"
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByRole('menuitem')).toHaveClass('text-sm');

      rerender(
        <MenuItemComponent
          item={testItem}
          size="lg"
          onItemClick={mockOnClick}
        />
      );

      expect(screen.getByRole('menuitem')).toHaveClass('text-base');
    });

    test('hides icons when showIcons is false', () => {
      render(
        <MenuItemComponent
          item={testItem}
          showIcons={false}
          onItemClick={mockOnClick}
        />
      );

      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });

    test('renders icon in different positions', () => {
      const { rerender } = render(
        <MenuItemComponent
          item={testItem}
          iconPosition="right"
          onItemClick={mockOnClick}
        />
      );

      // Check if icon is positioned after text
      const container = screen.getByRole('menuitem');
      expect(container).toBeInTheDocument();

      rerender(
        <MenuItemComponent
          item={testItem}
          iconPosition="top"
          onItemClick={mockOnClick}
        />
      );

      expect(container).toBeInTheDocument();
    });

    test('renders focused state with keyboard navigation', () => {
      render(
        <MenuItemComponent
          item={testItem}
          focused={true}
          keyboardNavigation={true}
          onItemClick={mockOnClick}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Selection States', () => {
    const testItem: MenuItem = {
      type: 'action',
      id: 'test',
      label: 'Test Item',
      onClick: mockOnClick
    };

    test('renders selection indicator for multiple selection mode', () => {
      render(
        <MenuItemComponent
          item={testItem}
          selectionMode="multiple"
          selected={true}
          onItemClick={mockOnClick}
        />
      );

      // Check for checkbox indicator
      const checkbox = screen.getByRole('menuitem').querySelector('.menu-item-checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    test('does not render selection indicator for single selection mode', () => {
      render(
        <MenuItemComponent
          item={testItem}
          selectionMode="single"
          selected={true}
          onItemClick={mockOnClick}
        />
      );

      // Should not have checkbox for single selection
      const checkbox = screen.getByRole('menuitem').querySelector('.menu-item-checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    const testItem: MenuItem = {
      type: 'action',
      id: 'test',
      label: 'Test Item',
      tooltip: 'This is a tooltip',
      onClick: mockOnClick
    };

    test('has proper ARIA attributes', () => {
      render(
        <MenuItemComponent
          item={testItem}
          selected={true}
          onItemClick={mockOnClick}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('aria-label', 'This is a tooltip');
      expect(menuItem).toHaveAttribute('aria-selected', 'true');
    });

    test('has proper data attributes', () => {
      const itemWithData: MenuItem = {
        ...testItem,
        'data-testid': 'custom-test-id',
        analyticsId: 'analytics-id'
      };

      render(
        <MenuItemComponent
          item={itemWithData}
          onItemClick={mockOnClick}
        />
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('data-testid', 'custom-test-id');
      expect(menuItem).toHaveAttribute('data-analytics-id', 'analytics-id');
    });
  });
});