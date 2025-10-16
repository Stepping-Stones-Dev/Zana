import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  SlideOutItem, 
  SlideOutContainer, 
  useSlideOut,
  SlideOutAction 
} from './SlideOut';

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Button: ({ children, className, onPress, isIconOnly, color, variant, size, isDisabled, ...props }: any) => (
    <button 
      className={`${className} btn-${color || 'default'} btn-${variant || 'solid'} btn-${size || 'md'} ${isDisabled ? 'disabled' : ''}`}
      onClick={onPress} 
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  EllipsisVerticalIcon: ({ className }: any) => <div className={`${className} ellipsis-icon`}>⋮</div>,
}));

// Test data
const mockActions: SlideOutAction[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <span data-testid="edit-icon">Edit</span>,
    color: 'primary',
    onClick: jest.fn(),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <span data-testid="delete-icon">Delete</span>,
    color: 'danger',
    onClick: jest.fn(),
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <span data-testid="archive-icon">Archive</span>,
    color: 'secondary',
    isDisabled: true,
    onClick: jest.fn(),
  },
];

describe('SlideOutItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders children content correctly', () => {
      render(
        <SlideOutItem id="test-item" actions={mockActions}>
          <div>Test Content</div>
        </SlideOutItem>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          className="custom-class"
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders trigger button by default', () => {
      render(
        <SlideOutItem id="test-item" actions={mockActions}>
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.getByLabelText('Show actions')).toBeInTheDocument();
    });

    it('hides trigger button when showTrigger is false', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          showTrigger={false}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.queryByLabelText('Show actions')).not.toBeInTheDocument();
    });

    it('sets proper analytics attributes', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          analyticsId="custom-analytics"
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.getByRole('generic')).toHaveAttribute(
        'data-analytics-id', 
        'custom-analytics.container.test-item'
      );
    });

    it('applies custom aria-label', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          aria-label="Custom slide out item"
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.getByLabelText('Custom slide out item')).toBeInTheDocument();
    });
  });

  describe('Slide-out functionality', () => {
    it('shows actions when slide-out is active', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          isSlideOutActive={true}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });

    it('hides actions when slide-out is inactive', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          isSlideOutActive={false}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('archive-icon')).not.toBeInTheDocument();
    });

    it('calls onSlideOutToggle when trigger is clicked', async () => {
      const user = userEvent.setup();
      const mockToggle = jest.fn();
      
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          onSlideOutToggle={mockToggle}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const trigger = screen.getByLabelText('Show actions');
      await user.click(trigger);
      
      expect(mockToggle).toHaveBeenCalledWith('test-item');
    });

    it('calls action onClick and closes slide-out', async () => {
      const user = userEvent.setup();
      const mockToggle = jest.fn();
      
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          isSlideOutActive={true}
          onSlideOutToggle={mockToggle}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      expect(mockActions[0].onClick).toHaveBeenCalled();
      expect(mockToggle).toHaveBeenCalledWith(null);
    });

    it('prevents event propagation on action clicks', async () => {
      const user = userEvent.setup();
      const mockContainerClick = jest.fn();
      
      render(
        <div onClick={mockContainerClick}>
          <SlideOutItem 
            id="test-item" 
            actions={mockActions}
            isSlideOutActive={true}
          >
            <div>Content</div>
          </SlideOutItem>
        </div>
      );
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      expect(mockActions[0].onClick).toHaveBeenCalled();
      expect(mockContainerClick).not.toHaveBeenCalled();
    });

    it('disables actions when isDisabled is true', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          isSlideOutActive={true}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      expect(archiveButton).toBeDisabled();
      expect(archiveButton).toHaveClass('disabled');
    });
  });

  describe('Action button styling', () => {
    beforeEach(() => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          isSlideOutActive={true}
        >
          <div>Content</div>
        </SlideOutItem>
      );
    });

    it('applies correct color classes to action buttons', () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      
      expect(editButton).toHaveClass('btn-primary');
      expect(deleteButton).toHaveClass('btn-danger');
      expect(archiveButton).toHaveClass('btn-secondary');
    });

    it('applies default color when no color specified', () => {
      const actionWithoutColor = [{
        id: 'no-color',
        label: 'No Color',
        icon: <span>Icon</span>,
        onClick: jest.fn(),
      }];
      
      render(
        <SlideOutItem 
          id="test-item-2" 
          actions={actionWithoutColor}
          isSlideOutActive={true}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const button = screen.getByRole('button', { name: /no color/i });
      expect(button).toHaveClass('btn-default');
    });
  });

  describe('Custom styling', () => {
    it('applies custom contentClassName', () => {
      const { container } = render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          contentClassName="custom-content"
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const contentDiv = container.querySelector('.custom-content');
      expect(contentDiv).toBeInTheDocument();
    });

    it('applies custom actionsClassName', () => {
      const { container } = render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          actionsClassName="custom-actions"
          isSlideOutActive={true}
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const actionsDiv = container.querySelector('.custom-actions');
      expect(actionsDiv).toBeInTheDocument();
    });

    it('applies custom triggerClassName', () => {
      render(
        <SlideOutItem 
          id="test-item" 
          actions={mockActions}
          triggerClassName="custom-trigger"
        >
          <div>Content</div>
        </SlideOutItem>
      );
      
      const trigger = screen.getByLabelText('Show actions');
      expect(trigger).toHaveClass('custom-trigger');
    });
  });
});

describe('useSlideOut', () => {
  it('initializes with null activeSlideOutId', () => {
    const { result } = renderHook(() => useSlideOut());
    
    expect(result.current.activeSlideOutId).toBeNull();
  });

  it('toggles slide-out state correctly', () => {
    const { result } = renderHook(() => useSlideOut());
    
    act(() => {
      result.current.toggleSlideOut('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-1');
    expect(result.current.isSlideOutActive('item-1')).toBe(true);
    
    act(() => {
      result.current.toggleSlideOut('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBeNull();
    expect(result.current.isSlideOutActive('item-1')).toBe(false);
  });

  it('switches between different slide-out items', () => {
    const { result } = renderHook(() => useSlideOut());
    
    act(() => {
      result.current.toggleSlideOut('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-1');
    
    act(() => {
      result.current.toggleSlideOut('item-2');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-2');
    expect(result.current.isSlideOutActive('item-1')).toBe(false);
    expect(result.current.isSlideOutActive('item-2')).toBe(true);
  });

  it('closes slide-out when null is passed', () => {
    const { result } = renderHook(() => useSlideOut());
    
    act(() => {
      result.current.toggleSlideOut('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-1');
    
    act(() => {
      result.current.toggleSlideOut(null);
    });
    
    expect(result.current.activeSlideOutId).toBeNull();
  });

  it('closes slide-out with closeSlideOut method', () => {
    const { result } = renderHook(() => useSlideOut());
    
    act(() => {
      result.current.toggleSlideOut('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-1');
    
    act(() => {
      result.current.closeSlideOut();
    });
    
    expect(result.current.activeSlideOutId).toBeNull();
  });

  it('handles onSlideOutChange correctly', () => {
    const { result } = renderHook(() => useSlideOut());
    
    act(() => {
      result.current.onSlideOutChange('item-1');
    });
    
    expect(result.current.activeSlideOutId).toBe('item-1');
    
    act(() => {
      result.current.onSlideOutChange(null);
    });
    
    expect(result.current.activeSlideOutId).toBeNull();
  });

  describe('Click outside functionality', () => {
    it('closes slide-out when clicking outside', async () => {
      const { result } = renderHook(() => useSlideOut());
      
      // Mock DOM element
      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-analytics-id', 'test.container.item-1');
      document.body.appendChild(mockElement);
      
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      
      act(() => {
        result.current.toggleSlideOut('item-1');
      });
      
      expect(result.current.activeSlideOutId).toBe('item-1');
      
      // Simulate click outside
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      
      act(() => {
        fireEvent.click(outsideElement);
      });
      
      await waitFor(() => {
        expect(result.current.activeSlideOutId).toBeNull();
      });
      
      document.body.removeChild(mockElement);
      document.body.removeChild(outsideElement);
    });

    it('does not close slide-out when clicking inside', async () => {
      const { result } = renderHook(() => useSlideOut());
      
      const mockElement = document.createElement('div');
      mockElement.setAttribute('data-analytics-id', 'test.container.item-1');
      const childElement = document.createElement('button');
      mockElement.appendChild(childElement);
      document.body.appendChild(mockElement);
      
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);
      
      act(() => {
        result.current.toggleSlideOut('item-1');
      });
      
      expect(result.current.activeSlideOutId).toBe('item-1');
      
      // Simulate click inside
      act(() => {
        fireEvent.click(childElement);
      });
      
      await waitFor(() => {
        expect(result.current.activeSlideOutId).toBe('item-1');
      });
      
      document.body.removeChild(mockElement);
    });
  });
});

describe('SlideOutContainer', () => {
  const TestSlideOutItems = ({ onItemAction }: { onItemAction?: jest.Mock }) => (
    <SlideOutContainer>
      <SlideOutItem id="item-1" actions={mockActions.slice(0, 2)}>
        <div>Item 1 Content</div>
      </SlideOutItem>
      <SlideOutItem id="item-2" actions={mockActions.slice(1, 3)}>
        <div>Item 2 Content</div>
      </SlideOutItem>
      <div>Non-SlideOutItem child</div>
    </SlideOutContainer>
  );

  it('renders children correctly', () => {
    render(<TestSlideOutItems />);
    
    expect(screen.getByText('Item 1 Content')).toBeInTheDocument();
    expect(screen.getByText('Item 2 Content')).toBeInTheDocument();
    expect(screen.getByText('Non-SlideOutItem child')).toBeInTheDocument();
  });

  it('manages slide-out state for multiple items', async () => {
    const user = userEvent.setup();
    render(<TestSlideOutItems />);
    
    // Open first item
    const trigger1 = screen.getAllByLabelText('Show actions')[0];
    await user.click(trigger1);
    
    // Check if first item actions are visible
    await waitFor(() => {
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });
    
    // Open second item (should close first)
    const trigger2 = screen.getAllByLabelText('Show actions')[1];
    await user.click(trigger2);
    
    // Check if second item actions are visible and first are hidden
    await waitFor(() => {
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });
  });

  it('applies custom className and analyticsId', () => {
    const { container } = render(
      <SlideOutContainer 
        className="custom-container"
        analyticsId="custom-analytics"
      >
        <div>Test content</div>
      </SlideOutContainer>
    );
    
    expect(container.firstChild).toHaveClass('custom-container');
    expect(container.firstChild).toHaveAttribute('data-analytics-id', 'custom-analytics');
  });

  it('only applies slide-out props to SlideOutItem children', () => {
    const NonSlideOutChild = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="non-slideout-child">{children}</div>
    );
    
    render(
      <SlideOutContainer>
        <SlideOutItem id="item-1" actions={mockActions}>
          <div>SlideOut Item</div>
        </SlideOutItem>
        <NonSlideOutChild>
          <div>Regular Child</div>
        </NonSlideOutChild>
      </SlideOutContainer>
    );
    
    expect(screen.getByText('SlideOut Item')).toBeInTheDocument();
    expect(screen.getByText('Regular Child')).toBeInTheDocument();
    expect(screen.getByTestId('non-slideout-child')).toBeInTheDocument();
  });

  describe('Integration', () => {
    it('closes slide-out when clicking outside container', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <TestSlideOutItems />
          <button data-testid="outside-button">Outside Button</button>
        </div>
      );
      
      // Open slide-out
      const trigger = screen.getAllByLabelText('Show actions')[0];
      await user.click(trigger);
      
      // Verify slide-out is open
      await waitFor(() => {
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      });
      
      // Click outside
      const outsideButton = screen.getByTestId('outside-button');
      await user.click(outsideButton);
      
      // Verify slide-out is closed
      await waitFor(() => {
        expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles empty children', () => {
      render(<SlideOutContainer>{null}</SlideOutContainer>);
      
      // Should not crash
      expect(true).toBe(true);
    });

    it('handles null children', () => {
      render(
        <SlideOutContainer>
          {null}
          <SlideOutItem id="item-1" actions={mockActions}>
            <div>Valid Item</div>
          </SlideOutItem>
          {undefined}
        </SlideOutContainer>
      );
      
      expect(screen.getByText('Valid Item')).toBeInTheDocument();
    });
  });
});