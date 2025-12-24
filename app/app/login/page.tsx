"use client";

import React, { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../actions/auth';

const LoginScreen = () => {
    const router = useRouter();
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/');
    };
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-white font-display antialiased text-slate-800">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none mix-blend-multiply filter blur-3xl z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none mix-blend-multiply filter blur-3xl z-0"></div>

            <div className="flex flex-col flex-1 justify-center px-6 py-10 max-w-md mx-auto w-full z-10">
                {/* Logo & Welcome */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.25)] border border-slate-100">
                        <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent text-[48px]">qr_code_scanner</span>
                    </div>
                    <h1 className="text-slate-900 text-3xl font-bold leading-tight text-center mb-2">Chào mừng trở lại</h1>
                    <p className="text-slate-500 text-base font-normal text-center leading-relaxed max-w-[280px]">
                        Quản lý thẻ QR định danh cho <span className="text-primary font-semibold">iShop</span> và <span className="text-accent font-semibold">iCard</span>
                    </p>
                </div>

                {/* Error Message */}
                {state?.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center animate-pulse">
                        {state.error}
                    </div>
                )}

                {/* Form */}
                <form action={formAction} className="space-y-5 w-full">
                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Tài khoản</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">person</span>
                            <input
                                name="username"
                                className="w-full bg-field-bg border border-slate-200 text-slate-900 rounded-xl h-14 pl-12 pr-4 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-slate-400 focus:bg-white outline-none"
                                placeholder="Email hoặc số điện thoại"
                                type="text"
                                defaultValue="admin@imanage.vn"
                                required
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Mật khẩu</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                            <input
                                name="password"
                                className="w-full bg-field-bg border border-slate-200 text-slate-900 rounded-xl h-14 pl-12 pr-12 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-slate-400 focus:bg-white outline-none"
                                placeholder="Nhập mật khẩu"
                                type={showPassword ? "text" : "password"}
                                defaultValue="password123"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-primary transition-colors flex items-center"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <Link href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 bg-primary-gradient hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold text-lg rounded-full shadow-lg shadow-primary/30 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span>Đăng nhập</span>
                                <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
                            </>
                        )}
                    </button>

                    <div className="flex justify-center pt-4 pb-2">
                        <button type="button" className="flex items-center justify-center p-3 rounded-full hover:bg-slate-100 transition-colors group" title="Đăng nhập bằng FaceID">
                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">face_unlock</span>
                        </button>
                    </div>
                </form>

                <div className="mt-auto pt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Chưa có tài khoản?
                        <Link href="/register" className="text-primary font-bold hover:underline ml-1">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>

            {/* Footer Pattern */}
            <div className="fixed bottom-0 left-0 w-full h-64 -z-10 opacity-[0.03] pointer-events-none overflow-hidden mix-blend-multiply">
                <div
                    className="w-full h-full bg-center bg-cover"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBH_DBVqEs9U71xXH39ZC-stGqWjH0meg8VGSf_Lj0QLhOXhZx-dK5UtsjIbS4nxHft5hTh3P6Vw8yrmmp1Xi3-zyloJtlfxlinDaD0CWImT4A_6WIFrKxp7wqvs-gj6d3sHQEoNxbDfd96grBd73Lg2SZEi6Cvlv5-rZJMtQSYIO7ooGQW62s7M1rsWnHanYAZkkkz5jfuJdJZeAiDSWvp0SUVa_oxkQ6MSWX_4OMUnksurTWpCAFucgWvh0CGnvYPBeHhEKpQEeA')",
                        maskImage: "linear-gradient(to top, black, transparent)",
                        WebkitMaskImage: "linear-gradient(to top, black, transparent)"
                    }}
                />
            </div>
        </div>
    );
};

export default LoginScreen;
