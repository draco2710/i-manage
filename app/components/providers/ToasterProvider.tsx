'use client';

import { Toaster } from 'sonner';

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                },
            }}
        />
    );
}
