import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Menu } from './Menu';
import { MenuItemComponent } from './MenuItem';
import { MenuGroup } from './MenuGroup';
import type { MenuItem, MenuGroup as MenuGroupType } from './types';

// Mock icons for testing
const MockIcon = () => <span data-testid="mock-icon">Icon</span>;

describe('Menu Component', () => {
  const basicItems: MenuItem[] = [
    {
      type: 'action',
      id: 'item1',
      label: 'Item 1',
      icon: <MockIcon />,
      onClick: jest.fn()
    },
    {
      type: 'action',
      id: 'item2',
      label: 'Item 2',
      onClick: jest.fn()
    },
    {
      type: 'divider',
      id: 'divider1'
    },
    {
      type: 'link',
      id: 'item3',
      label: 'Item 3',
      href: '/test'
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders inline menu with items', () => {
      render(<Menu items={basicItems} inline />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    test('renders with proper ARIA attributes', () => {
      render(
        <Menu
          items={basicItems}
          inline
          accessibility={{
            'aria-label': 'Test Menu',
            role: 'menu'
          }}
        />
      );
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Test Menu');
    });

    test('renders empty menu gracefully', () => {
      render(<Menu items={[]} inline />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(menu).toBeEmptyDOMElement();
    });
  });

  describe('Menu Items', () => {
    test('renders action items correctly', () => {
      const actionItem: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test Action',
        icon: <MockIcon />,
        onClick: jest.fn()
      };
      
      render(<Menu items={[actionItem]} inline />);
      
      const button = screen.getByRole('menuitem');
      expect(button).toHaveTextContent('Test Action');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    test('renders link items correctly', () => {
      const linkItem: MenuItem = {
        type: 'link',
        id: 'test',
        label: 'Test Link',
        href: '/test',
        external: true
      };
      
      render(<Menu items={[linkItem]} inline />);
      
      const link = screen.getByRole('menuitem');
      expect(link).toHaveTextContent('Test Link');
      expect(link).toHaveAttribute('href', '/test');
    });

    test('renders active item with proper styling', () => {
      const activeItem: MenuItem = {
        type: 'action',
        id: 'active',
        label: 'Active Item',
        active: true,
        onClick: jest.fn()
      };
      
      render(<Menu items={[activeItem]} inline />);
      
      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-current', 'page');
    });

    test('renders disabled item correctly', () => {
      const disabledItem: MenuItem = {
        type: 'action',
        id: 'disabled',
        label: 'Disabled Item',
        disabled: true,
        onClick: jest.fn()
      };
      
      render(<Menu items={[disabledItem]} inline />);
      
      const item = screen.getByRole('menuitem');
      expect(item).toBeDisabled();
    });

    test('renders divider item correctly', () => {
      const dividerItem: MenuItem = {
        type: 'divider',
        id: 'divider',
        label: 'Section'
      };
      
      render(<Menu items={[dividerItem]} inline />);
      
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
    });
  });

  describe('Menu Groups', () => {
    const groupedItems: MenuGroupType[] = [
      {
        id: 'group1',
        title: 'Group 1',
        items: [
          {
            type: 'action',
            id: 'group1-item1',
            label: 'Group 1 Item 1',
            onClick: jest.fn()
          }
        ]
      },
      {
        id: 'group2',
        title: 'Group 2',
        collapsible: true,
        items: [
          {
            type: 'action',
            id: 'group2-item1',
            label: 'Group 2 Item 1',
            onClick: jest.fn()
          }
        ]
      }
    ];

    test('renders menu groups with titles', () => {
      render(<Menu items={groupedItems} inline />);
      
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
      expect(screen.getByText('Group 1 Item 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2 Item 1')).toBeInTheDocument();
    });

    test('handles collapsible groups', async () => {
      const user = userEvent.setup();
      render(<Menu items={groupedItems} inline />);
      
      const groupHeader = screen.getByText('Group 2');
      expect(groupHeader).toHaveAttribute('aria-expanded', 'true');
      
      // Click to collapse
      await user.click(groupHeader);
      await waitFor(() => {
        expect(groupHeader).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Interactions', () => {
    test('handles action item clicks', async () => {
      const mockClick = jest.fn();
      const item: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test',
        onClick: mockClick
      };
      
      const user = userEvent.setup();
      render(<Menu items={[item]} inline />);
      
      await user.click(screen.getByRole('menuitem'));
      expect(mockClick).toHaveBeenCalledWith('test', expect.any(Object));
    });

    test('does not handle disabled item clicks', async () => {
      const mockClick = jest.fn();
      const item: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test',
        disabled: true,
        onClick: mockClick
      };
      
      const user = userEvent.setup();
      render(<Menu items={[item]} inline />);
      
      await user.click(screen.getByRole('menuitem'));
      expect(mockClick).not.toHaveBeenCalled();
    });

    test('handles selection change callback', async () => {
      const mockSelectionChange = jest.fn();
      const item: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test',
        onClick: jest.fn()
      };
      
      const user = userEvent.setup();
      render(
        <Menu
          items={[item]}
          inline
          behavior={{ selectionMode: 'single' }}
          onSelectionChange={mockSelectionChange}
        />
      );
      
      await user.click(screen.getByRole('menuitem'));
      expect(mockSelectionChange).toHaveBeenCalledWith(['test']);
    });
  });

  describe('Keyboard Navigation', () => {
    test('handles arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<Menu items={basicItems} inline />);
      
      const menu = screen.getByRole('menu');
      menu.focus();
      
      // Arrow down should focus first item
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toHaveAttribute('tabindex', '0');
      });
      
      // Arrow down should focus next item
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        expect(screen.getByText('Item 2')).toHaveAttribute('tabindex', '0');
      });
    });

    test('handles Enter key selection', async () => {
      const mockClick = jest.fn();
      const item: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test',
        onClick: mockClick
      };
      
      const user = userEvent.setup();
      render(<Menu items={[item]} inline />);
      
      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();
      
      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalled();
    });

    test('handles Space key selection', async () => {
      const mockClick = jest.fn();
      const item: MenuItem = {
        type: 'action',
        id: 'test',
        label: 'Test',
        onClick: mockClick
      };
      
      const user = userEvent.setup();
      render(<Menu items={[item]} inline />);
      
      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();
      
      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalled();
    });

    test('handles Home and End keys', async () => {
      const user = userEvent.setup();
      render(<Menu items={basicItems} inline />);
      
      const menu = screen.getByRole('menu');
      menu.focus();
      
      // End key should focus last item
      await user.keyboard('{End}');
      await waitFor(() => {
        expect(screen.getByText('Item 3')).toHaveAttribute('tabindex', '0');
      });
      
      // Home key should focus first item
      await user.keyboard('{Home}');
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Layout Options', () => {
    test('renders horizontal orientation', () => {
      render(
        <Menu
          items={basicItems}
          inline
          layout={{ orientation: 'horizontal' }}
        />
      );
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('flex-row');
    });

    test('renders different sizes', () => {
      const { rerender } = render(
        <Menu
          items={[basicItems[0]]}
          inline
          layout={{ size: 'sm' }}
        />
      );
      
      expect(screen.getByRole('menuitem')).toHaveClass('text-sm');
      
      rerender(
        <Menu
          items={[basicItems[0]]}
          inline
          layout={{ size: 'lg' }}
        />
      );
      
      expect(screen.getByRole('menuitem')).toHaveClass('text-base');
    });

    test('hides icons when showIcons is false', () => {
      render(
        <Menu
          items={[basicItems[0]]}
          inline
          layout={{ showIcons: false }}
        />
      );
      
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Selection', () => {
    test('handles multiple selection mode', async () => {
      const mockSelectionChange = jest.fn();
      const items: MenuItem[] = [
        {
          type: 'action',
          id: 'item1',
          label: 'Item 1',
          onClick: jest.fn()
        },
        {
          type: 'action',
          id: 'item2',
          label: 'Item 2',
          onClick: jest.fn()
        }
      ];
      
      const user = userEvent.setup();
      render(
        <Menu
          items={items}
          inline
          behavior={{
            selectionMode: 'multiple',
            selectedItems: []
          }}
          onSelectionChange={mockSelectionChange}
        />
      );
      
      // Select first item
      await user.click(screen.getByText('Item 1'));
      expect(mockSelectionChange).toHaveBeenCalledWith(['item1']);
      
      // Select second item (should add to selection)
      await user.click(screen.getByText('Item 2'));
      expect(mockSelectionChange).toHaveBeenCalledWith(['item2']);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <Menu
          items={basicItems}
          inline
          accessibility={{
            'aria-label': 'Main Navigation',
            'aria-describedby': 'nav-description'
          }}
        />
      );
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Main Navigation');
      expect(menu).toHaveAttribute('aria-describedby', 'nav-description');
    });

    test('menu items have proper roles and states', () => {
      render(<Menu items={basicItems} inline />);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(3); // 2 action items + 1 link item
      
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex');
      });
    });
  });
});