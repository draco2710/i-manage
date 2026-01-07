'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import apiClient from '@/lib/api/axios';
import { AxiosError } from 'axios';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Vui lòng nhập tài khoản và mật khẩu' };
    }

    try {
        const response = await apiClient.post('/auth/login', { username, password });
        const data = response.data;
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

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof AxiosError && error.response) {
            return { error: error.response.data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' };
        }
        return { error: 'Có lỗi xảy ra khi kết nối đến máy chủ.' };
    }
}

export async function checkEmailExist(email: string): Promise<{ exists: boolean }> {
    try {
        const response = await apiClient.post('/auth/check-email', { email });
        return { exists: !!response.data.exists };
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
        const response = await apiClient.post('/auth/register', {
            email,
            password,
            username: email
        });

        const data = response.data;
        const token = data.token;

        if (token) {
            const cookieStore = await cookies();
            cookieStore.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
            return { success: true };
        } else {
            return { error: 'Đăng ký thành công nhưng không nhận được token. Vui lòng đăng nhập.' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof AxiosError && error.response) {
            return { error: error.response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
        }
        return { error: 'Có lỗi xảy ra khi kết nối đến máy chủ.' };
    }
}
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    redirect('/login');
}
