import React from 'react';
import { cn } from '@/lib/utils/cn';

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const contextValue = {
    open: isOpen,
    onOpenChange: (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    },
  };

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ children, asChild, ...props }) => {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogTrigger must be used within AlertDialog');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        context.onOpenChange(true);
      },
    });
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        context.onOpenChange(true);
      }}
    >
      {children}
    </button>
  );
};

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) throw new Error('AlertDialogContent must be used within AlertDialog');

    const { open } = context;

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [open]);

    if (!open) return null;

    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={ref}
            className={cn(
              'relative w-full max-w-md bg-white rounded-xl shadow-lg animate-slide-up',
              'border border-border-gray p-6',
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
          </div>
        </div>
      </>
    );
  }
);
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...props}
  />
);

export const AlertDialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4',
      className
    )}
    {...props}
  />
);

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold text-deep-charcoal', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-text-secondary', className)} {...props} />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) throw new Error('AlertDialogAction must be used within AlertDialog');

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
          'bg-rose-gold text-white hover:bg-rose-gold-dark transition-colors duration-300',
          'focus:outline-none focus:ring-2 focus:ring-rose-gold focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          context.onOpenChange(false);
        }}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = 'AlertDialogAction';

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) throw new Error('AlertDialogCancel must be used within AlertDialog');

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
          'border border-border-gray bg-white text-text-primary hover:bg-soft-pink transition-colors duration-300',
          'focus:outline-none focus:ring-2 focus:ring-rose-gold focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'mt-2 sm:mt-0',
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          context.onOpenChange(false);
        }}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = 'AlertDialogCancel';