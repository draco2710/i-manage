"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchSearchResults, fetchSearchCount } from '../actions/search';
import { logout } from '../actions/logout';

type SearchType = 'all' | 'ishop' | 'icard';

interface SearchResult {
    id: string;
    ownerName?: string;
    private?: string | number;
    cardType?: string;
    packageId?: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const initialType = (searchParams.get('type') || 'all') as SearchType;
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    const [activeTab, setActiveTab] = useState<SearchType>(initialType);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCounting, setIsCounting] = useState(false);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const pageSize = 20;

    // Derived pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    // Update URL when page changes
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/search?${params.toString()}`);
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Main fetch effect
    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setError('Vui lòng nhập từ khóa tìm kiếm');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError('');

                // Step 1: Fetch total count if not already known or if filters changed
                // (Optimized: only requests 'id' field)
                setIsCounting(true);
                const count = await fetchSearchCount(activeTab, query);
                setTotalCount(count);
                setIsCounting(false);

                // Step 2: Fetch current page data
                const skip = (currentPage - 1) * pageSize;
                const data = await fetchSearchResults(activeTab, query, skip, pageSize);
                setResults(data);

            } catch (err) {
                console.error('Search error:', err);
                setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
                setIsCounting(false);
            }
        };

        performSearch();
    }, [query, activeTab, currentPage]);

    // Handle initial URL page sync
    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const getCardTypeName = (cardType?: string) => {
        switch (cardType) {
            case 'CARD_TYPE.ISHOP': return 'iShop';
            case 'CARD_TYPE.IPET': return 'iPet';
            case 'CARD_TYPE.IMEMBER': return 'iMember';
            case 'CARD_TYPE.IDOC': return 'iDoc';
            case 'CARD_TYPE.ISTAND': return 'iStand';
            default: return 'iCard';
        }
    };

    const getDetailUrl = (result: SearchResult) => {
        if (result.cardType === 'CARD_TYPE.ISHOP') {
            return `/detail/ishop/${result.id}`;
        }
        return `/detail/${result.id}`;
    };

    const getCardIcon = (cardType?: string) => {
        switch (cardType) {
            case 'CARD_TYPE.ISHOP': return 'storefront';
            case 'CARD_TYPE.IPET': return 'pets';
            case 'CARD_TYPE.IMEMBER': return 'badge';
            case 'CARD_TYPE.IDOC': return 'description';
            case 'CARD_TYPE.ISTAND': return 'podium';
            default: return 'contact_page';
        }
    };

    // Pagination helper to generate page numbers
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) end = 4;
            if (currentPage >= totalPages - 1) start = totalPages - 3;

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 px-6 md:px-10 border-b border-gray-200/50 dark:border-white/5">
                <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
                    <Link href="/">
                        <button className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                    </Link>
                    <h1 className="text-xl font-bold leading-tight tracking-tight flex-1 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-2 truncate">
                        Kết quả tìm kiếm
                    </h1>
                    <button
                        onClick={() => logout()}
                        className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 hover:dark:bg-red-900/20 transition-colors"
                        title="Đăng xuất"
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                    </button>
                </div>
            </header>

            {/* Filter Tabs & Search Info */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 sticky top-[73px] z-40">
                <div className="max-w-7xl mx-auto w-full p-4 md:px-10 space-y-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-text-secondary">
                            Từ khóa: <span className="font-bold text-primary">"{query}"</span>
                        </p>
                    </div>

                    <div className="max-w-md">
                        <div className="grid grid-cols-3 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all'
                                    ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('ishop'); setCurrentPage(1); }}
                                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ishop'
                                    ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                    }`}
                            >
                                iShop
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('icard'); setCurrentPage(1); }}
                                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'icard'
                                    ? 'bg-white dark:bg-surface-dark shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium'
                                    }`}
                            >
                                iCard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                {(isLoading && results.length === 0) && (
                    <div className="flex items-center justify-center py-20">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {!isLoading && !error && totalCount === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                        <p className="text-text-secondary text-center">Không tìm thấy kết quả nào</p>
                    </div>
                )}

                {(totalCount > 0 || results.length > 0) && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between px-1 gap-4">
                            <p className="text-sm text-text-secondary font-medium flex items-center gap-2">
                                Tìm thấy <span className="text-text-main font-bold">{totalCount}</span> kết quả
                                {isCounting && <span className="material-symbols-outlined animate-spin text-xs">progress_activity</span>}
                            </p>
                            <p className="text-xs text-text-secondary">
                                Hiển thị {Math.min(results.length, pageSize)} kết quả trang {currentPage} / {totalPages}
                            </p>
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                            {results.map((result) => (
                                <Link key={result.id} href={getDetailUrl(result)}>
                                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group h-full">
                                        <div className="flex items-center gap-4">
                                            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                                <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white transition-colors">
                                                    {getCardIcon(result.cardType)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {getCardTypeName(result.cardType)}
                                                    </span>
                                                </div>
                                                <p className="text-base font-bold text-text-main truncate group-hover:text-primary transition-colors">
                                                    {result.ownerName || 'Chưa có tên'}
                                                </p>
                                                <p className="text-xs text-text-secondary font-mono">
                                                    ID: {result.id}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-200">
                                                arrow_forward_ios
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-10 border-t border-gray-100 dark:border-white/5">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    <span>Trước</span>
                                </button>

                                <div className="hidden sm:flex items-center gap-2">
                                    {pageNumbers.map((page, idx) => (
                                        typeof page === 'number' ? (
                                            <button
                                                key={idx}
                                                onClick={() => handlePageChange(page)}
                                                disabled={isLoading}
                                                className={`size-10 rounded-xl text-sm font-bold border transition-all ${currentPage === page
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ) : (
                                            <span key={idx} className="px-2 text-text-secondary opacity-50 font-bold">{page}</span>
                                        )
                                    ))}
                                </div>

                                <div className="sm:hidden text-sm font-bold text-text-secondary px-4">
                                    {currentPage} / {totalPages}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
                                >
                                    <span>Tiếp</span>
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
