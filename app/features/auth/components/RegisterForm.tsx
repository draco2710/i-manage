"use client";

import React, { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, checkEmailExist } from '../api/auth';

const RegisterForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form state for real-time validation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Validation state
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'exists'>('idle');
    const [emailError, setEmailError] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const [state, formAction, isPending] = useActionState(register, null);

    useEffect(() => {
        if (state?.success) {
            router.push('/ishowroom');
        }
    }, [state, router]);

    // Email format validation
    const validateEmailFormat = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Debounced email existence check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!email) {
                setEmailStatus('idle');
                setEmailError('');
                return;
            }

            if (!validateEmailFormat(email)) {
                setEmailStatus('invalid');
                setEmailError('Định dạng email không hợp lệ');
                return;
            }

            setEmailStatus('checking');
            try {
                const { exists } = await checkEmailExist(email);
                if (exists) {
                    setEmailStatus('exists');
                    setEmailError('Email đã được sử dụng');
                } else {
                    setEmailStatus('valid');
                    setEmailError('');
                }
            } catch (err) {
                setEmailStatus('idle');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [email]);

    // Password confirmation check
    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    }, [password, confirmPassword]);

    const isFormValid =
        emailStatus === 'valid' &&
        password.length >= 6 &&
        password === confirmPassword &&
        !isPending;

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-white font-display antialiased text-slate-800">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none mix-blend-multiply filter blur-3xl z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none mix-blend-multiply filter blur-3xl z-0"></div>

            {/* Back Button */}
            <div className="flex items-center p-4 absolute top-0 left-0 w-full z-20">
                <button
                    onClick={() => router.back()}
                    className="text-slate-700 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors bg-white/50 backdrop-blur-sm shadow-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <div className="flex flex-col flex-1 justify-center px-6 py-10 max-w-md mx-auto w-full z-10 pt-20">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.25)] border border-slate-100 font-bold text-primary text-2xl">
                        iM
                    </div>
                    <h1 className="text-slate-900 text-3xl font-bold leading-tight text-center mb-2">Đăng ký tài khoản</h1>
                    <p className="text-slate-500 text-base font-normal text-center leading-relaxed">
                        Tham gia cộng đồng <span className="text-primary font-semibold">iManage</span> ngay hôm nay
                    </p>
                </div>

                {/* Error Message from Server */}
                {state?.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center animate-pulse">
                        {state.error}
                    </div>
                )}

                {/* Form */}
                <form action={formAction} className="space-y-4 w-full">
                    <div className="group">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            {email && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${emailStatus === 'valid' ? 'bg-green-50 text-green-600' :
                                    emailStatus === 'checking' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {emailStatus === 'checking' && <span className="size-2 bg-blue-400 rounded-full animate-pulse"></span>}
                                    {emailStatus === 'valid' ? 'Hợp lệ' : emailStatus === 'checking' ? 'Đang kiểm tra...' : emailError}
                                </span>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <span className={`absolute left-4 material-symbols-outlined text-[20px] transition-colors ${emailStatus === 'valid' ? 'text-green-500' : emailStatus === 'exists' || emailStatus === 'invalid' ? 'text-red-500' : 'text-slate-400'
                                }`}>mail</span>
                            <input
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-field-bg border rounded-xl h-14 pl-12 pr-4 transition-all focus:ring-2 focus:bg-white outline-none ${emailStatus === 'valid' ? 'border-green-200 focus:ring-green-500/20 focus:border-green-500' :
                                    emailStatus === 'exists' || emailStatus === 'invalid' ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500' :
                                        'border-slate-200 focus:ring-primary/30 focus:border-primary'
                                    }`}
                                placeholder="example@gmail.com"
                                type="email"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-field-bg border border-slate-200 text-slate-900 rounded-xl h-14 pl-12 pr-12 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-slate-400 focus:bg-white outline-none"
                                placeholder="Tối thiểu 6 ký tự"
                                type={showPassword ? "text" : "password"}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="group">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
                            {!passwordsMatch && confirmPassword && (
                                <span className="text-[10px] font-bold uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Không khớp</span>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <span className={`absolute left-4 material-symbols-outlined text-[20px] transition-colors ${!passwordsMatch && confirmPassword ? 'text-red-500' : 'text-slate-400'
                                }`}>lock_reset</span>
                            <input
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-field-bg border rounded-xl h-14 pl-12 pr-12 transition-all focus:ring-2 focus:bg-white outline-none ${!passwordsMatch && confirmPassword ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-primary/30 focus:border-primary'
                                    }`}
                                placeholder="Nhập lại mật khẩu"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-full h-14 bg-primary-gradient hover:opacity-90 active:scale-[0.98] transition-all text-white font-bold text-lg rounded-full shadow-lg shadow-primary/30 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isPending ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span>Đăng ký</span>
                                <span className="material-symbols-outlined text-[20px] font-bold">person_add</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pb-10">
                    <p className="text-slate-500 text-sm">
                        Đã có tài khoản?
                        <Link href="/login" className="text-primary font-bold hover:underline ml-1">Đăng nhập</Link>
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

export default RegisterForm;
