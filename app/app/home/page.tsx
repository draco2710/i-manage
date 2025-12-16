"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { searchQRIDs } from '../actions/search';

type SearchType = 'all' | 'ishop' | 'icard';

export default function HomeScreen() {
    const [activeSearchType, setActiveSearchType] = useState<SearchType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!searchQuery.trim()) {
            setError('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setIsSearching(true);
        try {
            const result = await searchQRIDs(activeSearchType, searchQuery);
            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tìm kiếm.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 border-b border-gray-200/50 dark:border-white/5">
                <h1 className="text-2xl font-bold leading-tight tracking-tight flex-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Tìm kiếm Thẻ QR
                </h1>
                <div className="flex items-center justify-end">
                    <button className="group flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:rotate-45 transition-transform duration-300">
                            settings
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-32 space-y-6">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-20%] w-[60%] h-[300px] bg-secondary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

                {/* Unified Search Section */}
                <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 p-6 z-10">
                    <form onSubmit={handleSearch} className="flex flex-col gap-5">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Header with Filter Tabs */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">search_check</span>
                                Tra cứu thông tin
                            </h2>
                            <div className="grid grid-cols-3 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setActiveSearchType('all')}
                                    className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeSearchType === 'all'
                                        ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                        }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setActiveSearchType('ishop')}
                                    className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeSearchType === 'ishop'
                                        ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                        }`}
                                >
                                    iShop
                                </button>
                                <button
                                    onClick={() => setActiveSearchType('icard')}
                                    className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeSearchType === 'icard'
                                        ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                        }`}
                                >
                                    iCard
                                </button>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex w-full items-center rounded-2xl bg-gray-50 dark:bg-input-dark border border-gray-200 dark:border-white/5 transition-all duration-200 h-14 overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                                <div className="pl-4 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="w-full bg-transparent px-3 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none border-none ring-0"
                                    placeholder="Nhập id hoặc các số đuôi id"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="button" className="pr-4 text-gray-400 hover:text-secondary transition-colors" title="Quét mã QR">
                                    <span className="material-symbols-outlined">qr_code_scanner</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Searches */}
                        <div>
                            <div className="flex justify-between items-center mb-3 mt-1">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Tìm kiếm gần đây
                                </p>
                                <button type="button" className="text-xs text-primary hover:underline">Xoá lịch sử</button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                <button type="button" className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-700 px-4 transition-colors border border-transparent hover:border-primary/20">
                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                    <span className="text-xs font-medium dark:text-gray-200">Shop Thời Trang A</span>
                                </button>
                                <button type="button" className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-secondary/10 hover:text-secondary dark:hover:bg-slate-700 px-4 transition-colors border border-transparent hover:border-secondary/20">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span className="text-xs font-medium dark:text-gray-200">Nguyễn Văn A</span>
                                </button>
                                <button type="button" className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-primary/10 hover:text-primary dark:hover:bg-slate-700 px-4 transition-colors border border-transparent hover:border-primary/20">
                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                    <span className="text-xs font-medium dark:text-gray-200">Kho B</span>
                                </button>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:brightness-110 active:scale-[0.98] transition-all text-white font-bold text-base shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSearching ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>Đang tìm...</span>
                                </>
                            ) : (
                                <>
                                    <span>Tìm kiếm</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Banner */}
                <div className="relative w-full rounded-2xl overflow-hidden h-36 bg-gradient-to-br from-primary to-secondary flex items-center justify-between p-6 shadow-glow border border-white/10">
                    <div className="z-10 text-white">
                        <h3 className="font-bold text-lg">Quản lý dễ dàng</h3>
                        <p className="text-sm opacity-90 mt-1 font-medium">Truy cập nhanh vào lịch sử quét</p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-30px] opacity-20 rotate-12">
                        <span className="material-symbols-outlined text-white text-[120px]">qr_code_scanner</span>
                    </div>
                    <img
                        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                        alt="Abstract neon geometric pattern"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2y8tg9rw8Dz274g6u-fedNcPcCIjreDoIq0LsHhPkmLO9JYYz2ubz9w1NeUfjaqYw7ebqArSlymxMUo6LGRZMzSQEDfM2NIDbJDfvCBfrf8CDLED28_4dyucdVUccK9isX5yG_mW_tqDCdhtJRTyS6jC9sBvBqV0xpreOB59bZ-37P1BiRTpaZnlym026PAO-uDrZXJSUpvKEI6pjwWFH21FRmEFrSaX5Ud99Ir-jNYS9Zs332KRvxkSM5PtYC9aiekp4lRA3YJQ"
                    />
                </div>
            </main>

            {/* Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 pb-5 pt-3 px-6">
                <div className="flex justify-between items-center">
                    <Link href="#" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[28px]">home</span>
                        <span className="text-[10px] font-medium">Trang chủ</span>
                    </Link>
                    <Link href="#" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[28px] fill-current">search</span>
                        <span className="text-[10px] font-medium">Tìm kiếm</span>
                    </Link>
                    <div className="relative -top-6">
                        <button className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-glow shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-white">
                            <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                        </button>
                    </div>
                    <Link href="#" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[28px]">history</span>
                        <span className="text-[10px] font-medium">Lịch sử</span>
                    </Link>
                    <Link href="#" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[28px]">person</span>
                        <span className="text-[10px] font-medium">Cá nhân</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
