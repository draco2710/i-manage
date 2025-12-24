'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    // Ensure the redirect happens after clearing the cookie
    redirect('/login');
}
