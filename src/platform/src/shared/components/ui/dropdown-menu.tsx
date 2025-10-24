'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';
import { cn } from '@/shared/lib/utils';

// Portal component
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  modal?: boolean; // Close on outside click (default: true)
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  showOverlay?: boolean;
  matchTriggerWidth?: boolean; // New: Match trigger width
  minWidth?: string | number; // New: Set minimum width
  maxWidth?: string | number; // New: Set maximum width
  side?: 'top' | 'right' | 'bottom' | 'left'; // New: Placement side
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  closeOnSelect?: boolean; // New: Control whether to close on select
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceElement: HTMLElement | null;
  setReferenceElement: (element: HTMLElement | null) => void;
  modal: boolean;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
};

const DropdownMenu = ({
  children,
  open: controlledOpen,
  onOpenChange,
  className,
  modal = true,
}: DropdownMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [referenceElement, setReferenceElement] =
    React.useState<HTMLElement | null>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);

  // Close on click outside (only if modal is true)
  React.useEffect(() => {
    if (!modal) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        referenceElement &&
        !referenceElement.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        // Check if click is not on a dropdown menu item
        if (!target.closest('[data-dropdown-content]')) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, referenceElement, setOpen, modal]);

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        onOpenChange: setOpen,
        referenceElement,
        setReferenceElement,
        modal,
      }}
    >
      <div className={cn('relative inline-block', className)}>{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, className, asChild = false, ...props }, ref) => {
  const { open, onOpenChange, setReferenceElement } = useDropdownMenu();

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      setReferenceElement(node);
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [setReferenceElement, ref]
  );

  const handleClick = () => {
    onOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<
        React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
      >,
      {
        ref: setRefs,
        onClick: handleClick,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      }
    );
  }

  return (
    <button
      ref={setRefs}
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = ({
  children,
  className,
  align = 'end',
  sideOffset = 4,
  showOverlay = false,
  matchTriggerWidth = false,
  minWidth,
  maxWidth,
  side = 'bottom',
}: DropdownMenuContentProps) => {
  const { open, referenceElement } = useDropdownMenu();
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(
    null
  );
  const [triggerWidth, setTriggerWidth] = React.useState<number | null>(null);

  // Measure trigger width
  React.useEffect(() => {
    if (matchTriggerWidth && referenceElement) {
      const updateWidth = () => {
        setTriggerWidth(referenceElement.offsetWidth);
      };

      updateWidth();

      // Update on window resize
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [matchTriggerWidth, referenceElement]);

  // TODO: Implement overlay functionality when showOverlay is true
  if (showOverlay) {
    console.warn('showOverlay prop is not yet implemented');
  }

  const getPlacement = () => {
    const alignMap = {
      start: 'start',
      center: '',
      end: 'end',
    };

    const alignSuffix = alignMap[align];
    return alignSuffix ? `${side}-${alignSuffix}` : side;
  };

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: getPlacement() as Placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, sideOffset],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
            'right-start',
            'right-end',
            'left-start',
            'left-end',
          ],
        },
      },
    ],
  });

  if (!open) return null;

  const contentStyles: React.CSSProperties = {
    ...styles.popper,
    ...(matchTriggerWidth && triggerWidth && { width: `${triggerWidth}px` }),
    ...(minWidth && {
      minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    }),
    ...(maxWidth && {
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    }),
  };

  return (
    <Portal>
      <div
        ref={setPopperElement}
        style={contentStyles}
        {...attributes.popper}
        data-dropdown-content
        className={cn(
          'z-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          !matchTriggerWidth && 'min-w-[8rem]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        role="menu"
      >
        {children}
      </div>
    </Portal>
  );
};

const DropdownMenuItem = ({
  children,
  onClick,
  className,
  disabled = false,
  onSelect,
  closeOnSelect = true,
}: DropdownMenuItemProps) => {
  const { onOpenChange } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    // Prevent default to avoid any form submission or navigation
    e.preventDefault();
    e.stopPropagation();

    if (onSelect) {
      const event = new Event('select', { bubbles: true, cancelable: true });
      onSelect(event);
      if (event.defaultPrevented) return;
    }

    onClick?.();

    // Close menu after selection (if enabled)
    if (closeOnSelect) {
      onOpenChange(false);
    }
  };

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        !disabled &&
          'hover:bg-accent hover:text-accent-foreground cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      data-disabled={disabled ? '' : undefined}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
    />
  );
};

const DropdownMenuLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      role="heading"
      aria-level={6}
    >
      {children}
    </div>
  );
};

const DropdownMenuGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('py-1', className)} role="group">
      {children}
    </div>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
};

// Example usage:
//
// Basic usage (backward compatible):
// <DropdownMenu>
//   <DropdownMenuTrigger className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
//     Open Menu
//   </DropdownMenuTrigger>
//   <DropdownMenuContent align="end">
//     <DropdownMenuLabel>My Account</DropdownMenuLabel>
//     <DropdownMenuSeparator />
//     <DropdownMenuItem onClick={() => console.log('Profile')}>
//       Profile
//     </DropdownMenuItem>
//     <DropdownMenuItem onClick={() => console.log('Settings')}>
//       Settings
//     </DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
//
// Match trigger width:
// <DropdownMenu>
//   <DropdownMenuTrigger className="w-64 px-4 py-2 bg-primary text-primary-foreground rounded-md">
//     Select Option
//   </DropdownMenuTrigger>
//   <DropdownMenuContent matchTriggerWidth>
//     <DropdownMenuItem>Option 1</DropdownMenuItem>
//     <DropdownMenuItem>Option 2</DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
//
// With custom width constraints:
// <DropdownMenu>
//   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
//   <DropdownMenuContent minWidth={200} maxWidth={400}>
//     <DropdownMenuItem>Item</DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
//
// Different placement:
// <DropdownMenu>
//   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
//   <DropdownMenuContent side="top" align="start">
//     <DropdownMenuItem>Item</DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
//
// Non-modal (doesn't close on outside click):
// <DropdownMenu modal={false}>
//   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
//   <DropdownMenuContent>
//     <DropdownMenuItem closeOnSelect={false}>
//       Keep open on click
//     </DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
