'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Vui lòng nhập tài khoản và mật khẩu' };
    }

    try {
        const res = await fetch('https://i-manage-ru5z.onrender.com/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' };
        }

        // Assuming the API returns { token: "..." } or { data: { token: "..." } }
        // Based on swagger AuthResponse: { token: string, user: string }
        const token = data.token;

        if (!token) {
            return { error: 'Không nhận được token xác thực từ hệ thống.' };
        }

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Có lỗi xảy ra khi kết nối đến máy chủ.' };
    }

    // Redirect must be outside try-catch because it throws an error
    redirect('/');
}

export async function checkEmailExist(email: string): Promise<{ exists: boolean }> {
    try {
        const res = await fetch('https://i-manage-ru5z.onrender.com/api/v1/auth/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) return { exists: false };
        const data = await res.json();
        return { exists: !!data.exists };
    } catch (error) {
        console.error('Check email error:', error);
        return { exists: false };
    }
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email || !password || !confirmPassword) {
        return { error: 'Vui lòng điền đầy đủ thông tin' };
    }

    if (password !== confirmPassword) {
        return { error: 'Mật khẩu xác nhận không khớp' };
    }

    try {
        const res = await fetch('https://i-manage-ru5z.onrender.com/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                username: email // Use email as username as requested
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
        }

        const token = data.token;
        if (token) {
            const cookieStore = await cookies();
            cookieStore.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
        } else {
            return { error: 'Đăng ký thành công nhưng không nhận được token. Vui lòng đăng nhập.' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Có lỗi xảy ra khi kết nối đến máy chủ.' };
    }

    redirect('/');
}
