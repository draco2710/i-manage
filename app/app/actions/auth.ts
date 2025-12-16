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
        const res = await fetch('http://localhost:8080/api/v1/auth/login', {
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
