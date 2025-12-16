"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchSearchResults } from '../actions/search';

type FilterType = 'all' | 'ishop' | 'icard';

interface SearchResult {
    id: string;
    ownerName?: string;
    private?: string | number;
    cardType?: string;
    packageId?: string;
}

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const query = searchParams.get('q') || '';
        const type = (searchParams.get('type') as FilterType) || 'all';

        setSearchQuery(query);
        setActiveFilter(type);

        if (query) {
            setIsLoading(true);
            setError('');

            fetchSearchResults(type, query)
                .then(data => {
                    setResults(data);
                })
                .catch(err => {
                    console.error('Failed to fetch results:', err);
                    setError('Không thể tải kết quả. Vui lòng thử lại.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [searchParams]);

    const getResultType = (result: SearchResult): 'ishop' | 'icard' => {
        return result.cardType === 'CARD_TYPE.ISHOP' ? 'ishop' : 'icard';
    };

    const filteredResults = results.filter(result => {
        const resultType = getResultType(result);
        return activeFilter === 'all' || resultType === activeFilter;
    });

    return (
        <div className="relative z-10 flex h-full w-full flex-col mx-auto min-h-screen max-w-md bg-transparent shadow-2xl shadow-slate-200/50">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-200 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-white/20">
                <Link href="/">
                    <button className="group flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-slate-100">
                        <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-colors">arrow_back_ios_new</span>
                    </button>
                </Link>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight flex-1 text-center">Kết quả tìm kiếm</h2>
                <button className="group flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-slate-100">
                    <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-colors">filter_list</span>
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="sticky top-[72px] z-10 px-5 pt-2 pb-4 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-[2px]">
                <div className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100/80 p-1 ring-1 ring-inset ring-slate-200/50">
                    <label className="group relative flex h-full flex-1 cursor-pointer items-center justify-center rounded-xl transition-all duration-300">
                        <input
                            className="peer hidden"
                            name="filter_type"
                            type="radio"
                            value="all"
                            checked={activeFilter === 'all'}
                            onChange={() => setActiveFilter('all')}
                        />
                        <div className="absolute inset-0 rounded-xl bg-white shadow-sm opacity-0 scale-95 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"></div>
                        <span className="relative z-10 text-sm font-semibold text-slate-500 peer-checked:text-primary peer-checked:font-bold transition-colors">Tất cả</span>
                    </label>

                    <label className="group relative flex h-full flex-1 cursor-pointer items-center justify-center rounded-xl transition-all duration-300">
                        <input
                            className="peer hidden"
                            name="filter_type"
                            type="radio"
                            value="ishop"
                            checked={activeFilter === 'ishop'}
                            onChange={() => setActiveFilter('ishop')}
                        />
                        <div className="absolute inset-0 rounded-xl bg-white shadow-sm opacity-0 scale-95 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"></div>
                        <span className="relative z-10 text-sm font-semibold text-slate-500 peer-checked:text-ishop peer-checked:font-bold transition-colors">iShop</span>
                    </label>

                    <label className="group relative flex h-full flex-1 cursor-pointer items-center justify-center rounded-xl transition-all duration-300">
                        <input
                            className="peer hidden"
                            name="filter_type"
                            type="radio"
                            value="icard"
                            checked={activeFilter === 'icard'}
                            onChange={() => setActiveFilter('icard')}
                        />
                        <div className="absolute inset-0 rounded-xl bg-white shadow-sm opacity-0 scale-95 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"></div>
                        <span className="relative z-10 text-sm font-semibold text-slate-500 peer-checked:text-icard peer-checked:font-bold transition-colors">iCard</span>
                    </label>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-5">
                <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-6 w-1 rounded-full bg-primary"></span>
                    <h3 className="text-lg font-bold text-slate-800">
                        Kết quả cho: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">'{searchQuery}'</span>
                    </h3>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium mb-4">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-2">progress_activity</span>
                        <p className="text-gray-500">Đang tìm kiếm...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Không tìm thấy kết quả nào
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-12">
                        {filteredResults.map((result) => {
                            const resultType = getResultType(result);
                            return (
                                <Link key={result.id} href={`/detail/${result.id}`}>
                                    <div
                                        className={`group relative flex items-center justify-between gap-4 rounded-2xl bg-white p-3 pr-4 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden border border-slate-50`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${resultType === 'ishop' ? 'bg-ishop' : 'bg-icard'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                                        <div className="flex items-center gap-4">
                                            <div className={`flex size-14 items-center justify-center rounded-xl ${resultType === 'ishop' ? 'bg-ishop-bg text-ishop' : 'bg-icard-bg text-icard'} shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                                                <span className="material-symbols-outlined text-[28px]">
                                                    {resultType === 'ishop' ? 'storefront' : 'badge'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col justify-center gap-0.5">
                                                <span className={`text-xs font-semibold uppercase tracking-wider ${resultType === 'ishop' ? 'text-ishop/80' : 'text-icard/80'}`}>
                                                    {resultType === 'ishop' ? 'iShop' : 'iCard'}
                                                </span>
                                                <p className={`text-xl font-bold font-mono text-slate-800 leading-none ${resultType === 'ishop' ? 'group-hover:text-ishop' : 'group-hover:text-icard'} transition-colors`}>
                                                    {result.id}
                                                </p>
                                                {result.ownerName && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{result.ownerName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 ${resultType === 'ishop' ? 'group-hover:bg-ishop' : 'group-hover:bg-icard'} group-hover:text-white transition-all duration-300`}>
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="h-10"></div>
            </div>
        </div>
    );
}
