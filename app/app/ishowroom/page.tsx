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
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden md:max-w-full md:mx-0 shadow-none bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white">
            {/* Header - Sticky on Mobile, Regular on Desktop */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 border-b border-gray-200/50 dark:border-white/5 md:bg-transparent md:dark:bg-transparent md:border-none md:p-8">
                <h1 className="text-2xl font-bold leading-tight tracking-tight flex-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent md:text-3xl">
                    Tìm kiếm Thẻ QR
                </h1>
                <div className="flex items-center justify-end md:hidden">
                    <button className="group flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:rotate-45 transition-transform duration-300">
                            settings
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-32 space-y-6 md:p-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 md:max-w-7xl md:mx-auto w-full">
                {/* Background Blobs (Adjusted for desktop) */}
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen md:w-[40%] md:h-[600px] md:top-[-20%] md:left-[-10%]"></div>
                <div className="absolute top-[20%] right-[-20%] w-[60%] h-[300px] bg-secondary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen md:w-[40%] md:h-[500px] md:right-[-10%]"></div>

                {/* Left Column: Search Section */}
                <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 p-6 z-10 h-fit">
                    <form onSubmit={handleSearch} className="flex flex-col gap-5">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Filter Tabs */}
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

                {/* Right Column: Info & History */}
                <div className="space-y-6">
                    {/* Banner */}
                    <div className="relative w-full rounded-2xl overflow-hidden h-36 md:h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-between p-6 shadow-glow border border-white/10 group cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="z-10 text-white">
                            <h3 className="font-bold text-lg md:text-2xl">Quản lý dễ dàng</h3>
                            <p className="text-sm opacity-90 mt-1 font-medium md:text-base">Truy cập nhanh vào lịch sử quét và thông tin thẻ.</p>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-30px] opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <span className="material-symbols-outlined text-white text-[120px] md:text-[160px]">qr_code_scanner</span>
                        </div>
                        <img
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                            alt="Abstract neon geometric pattern"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2y8tg9rw8Dz274g6u-fedNcPcCIjreDoIq0LsHhPkmLO9JYYz2ubz9w1NeUfjaqYw7ebqArSlymxMUo6LGRZMzSQEDfM2NIDbJDfvCBfrf8CDLED28_4dyucdVUccK9isX5yG_mW_tqDCdhtJRTyS6jC9sBvBqV0xpreOB59bZ-37P1BiRTpaZnlym026PAO-uDrZXJSUpvKEI6pjwWFH21FRmEFrSaX5Ud99Ir-jNYS9Zs332KRvxkSM5PtYC9aiekp4lRA3YJQ"
                        />
                    </div>

                    {/* Recent Searches Panel */}
                    <div className="rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">history</span>
                                Tìm kiếm gần đây
                            </p>
                            <button type="button" className="text-xs text-primary hover:underline font-medium">Xoá tất cả</button>
                        </div>

                        <div className="space-y-3">
                            <button type="button" className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-700 transition-colors group">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-primary">
                                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Shop Thời Trang A</span>
                                    <span className="text-xs text-gray-500">iShop • ID: ...123</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-gray-400 text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>

                            <button type="button" className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-secondary/5 hover:text-secondary dark:hover:bg-slate-700 transition-colors group">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-secondary">
                                    <span className="material-symbols-outlined text-[20px]">badge</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Nguyễn Văn A</span>
                                    <span className="text-xs text-gray-500">iCard • ID: ...456</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-gray-400 text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
