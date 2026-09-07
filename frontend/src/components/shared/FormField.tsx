import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helper?: string
  rightAction?: ReactNode
  icon?: ReactNode
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helper, rightAction, icon, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold text-study-text">
            {label}
          </label>
          {rightAction}
        </div>

        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-study-text-muted pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full py-2.5 rounded-xl bg-study-surface-muted/50 border text-xs text-study-text placeholder:text-study-text-muted focus:outline-none transition-colors ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${props.type === 'password' ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-study-danger focus:border-study-danger'
                : 'border-study-border focus:border-study-primary'
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-[11px] text-study-danger font-medium">{error}</p>
        ) : helper ? (
          <p className="text-[11px] text-study-text-muted">{helper}</p>
        ) : null}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
