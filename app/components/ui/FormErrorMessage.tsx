'use client';

import { clsx } from 'clsx';

interface FormErrorMessageProps {
    message?: string;
    className?: string;
}

/**
 * Standardized error message for form fields.
 * Includes a warning icon and consistent styling.
 */
export default function FormErrorMessage({ message, className }: FormErrorMessageProps) {
    if (!message) return null;

    return (
        <div className={clsx("mt-1.5 flex items-center text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200", className)}>
            <span className="material-symbols-outlined mr-1 text-sm">error</span>
            {message}
        </div>
    );
}
