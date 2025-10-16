import React from 'react';
import { cx } from '../internal/internal';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Element tag to render (defaults to span). */
  as?: keyof JSX.IntrinsicElements;
  /** If true, consumer can style a focus-visible state to reveal content. */
  focusable?: boolean;
}

/**
 * VisuallyHidden
 * Hides its children visually while keeping them accessible to assistive tech.
 * Responsibility for localization (NLS) is delegated to the caller.
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  as = 'span',
  focusable = false,
  className,
  style,
  children,
  ...rest
}) => {
  const Component: any = as;
  return (
    <Component
      {...rest}
      className={cx('z-visually-hidden', className)}
      data-focusable={focusable || undefined}
      style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '1px',
        ...style,
      }}
    >
      {children}
    </Component>
  );
};

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;