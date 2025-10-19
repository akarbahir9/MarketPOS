import React from 'react';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`block text-sm font-medium text-text-secondary ${className}`}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export { Label };
