"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { logout } from '../../../actions/logout';

interface IShopAction {
    name: string;
    enable: boolean;
    icon: string;
    url: string;
    title: string;
    subTitle?: string;
    value?: {
        url?: string;
        btnEnable?: boolean;
        bannerUrl?: string;
        title?: string;
        content?: string;
        btnText?: string;
    };
    valueType: 'URL' | 'POPUP' | string;
}

interface FabAction {
    enable: boolean;
    text: string;
    icon: string;
    value: any;
}

interface IShopMetadata {
    title: string;
    backgroundUrl: string;
    ishop: {
        name: string;
        content: string;
        id: string;
    };
    ishopHeader: {
        bannerUrl: string;
        content: string;
    };
    ishopFooter: any;
    actions: IShopAction[];
    fab_actions: {
        left: FabAction;
        center: FabAction;
        right: FabAction;
    };
    hotline: string;
    email: string;
    manager: {
        fullName: string;
        email: string;
        phoneNumber: string;
    };
}

interface IShopDetail {
    id: number;
    packageId: string;
    private: number;
    cardType: string;
    phase: string;
    activatedDate: string;
    warrantyDays: number;
    endDate: string;
    status: string;
    metadata: IShopMetadata;
}

export default function IShopDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [data, setData] = useState<IShopDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [publicQR, setPublicQR] = useState('');
    const [privateQR, setPrivateQR] = useState('');
    const [publicUrl, setPublicUrl] = useState('');
    const [privateUrl, setPrivateUrl] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`https://api.qrcare.net/api/QRIDs/${id}`);
                if (!res.ok) throw new Error('Không thể tải thông tin iShop');
                const json = await res.json();
                setData(json);

                // Generate QR codes
                const baseUrl = 'https://m.ishowroom.vn/#!';
                const pubUrl = `${baseUrl}/s/${id}/i/0/p/${json.private}`;
                const privUrl = `${baseUrl}/s-edit/${id}/p/${json.private}`;

                const pubQR = await QRCode.toDataURL(pubUrl, { width: 400, margin: 1 });
                const privQR = await QRCode.toDataURL(privUrl, { width: 400, margin: 1 });

                setPublicQR(pubQR);
                setPrivateQR(privQR);
                setPublicUrl(pubUrl);
                setPrivateUrl(privUrl);
            } catch (err) {
                console.error(err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy thông tin iShop'}</p>
                <Link href="/">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg">Quay lại</button>
                </Link>
            </div>
        );
    }

    const { metadata } = data;

    return (
        <div className="relative w-full min-h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-x-hidden antialiased">
            {/* Background Image with Overlay */}
            {metadata.backgroundUrl && (
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                    style={{ backgroundImage: `url(${metadata.backgroundUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 px-6 md:px-10 border-b border-gray-200/50 dark:border-white/5">
                <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
                    <button
                        onClick={() => router.back()}
                        className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h2 className="text-text-main text-lg font-bold leading-tight flex-1 text-center truncate px-2">
                        {metadata.ishop?.name || 'Chi tiết iShop'}
                    </h2>
                    <button
                        onClick={() => logout()}
                        className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 hover:dark:bg-red-900/20 transition-colors"
                        title="Đăng xuất"
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 relative z-10 p-4 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar: Management & Shop Identity (Sticky on Desktop) */}
                    <aside className="lg:w-1/3 w-full space-y-8 lg:sticky lg:top-[88px]">
                        {/* Shop Brand Identity Card */}
                        <section className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 border border-white/20 dark:border-white/5 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/20">iShop</span>
                                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-green-500/20 flex items-center gap-1">
                                        <span className="size-1 bg-green-500 rounded-full animate-pulse"></span>
                                        {data.status === 'QRID_STATUS.ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-black text-text-main leading-tight mb-2">
                                    {metadata.ishop?.name}
                                </h1>
                                <p className="text-xs text-text-secondary font-mono tracking-wider opacity-60">ID: {data.id}</p>
                            </div>
                        </section>

                        {/* QR Codes Dashboard Panel */}
                        <section className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 border border-white/20 dark:border-white/5">
                            <h3 className="text-sm font-black text-text-main mb-6 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">qr_code_2</span>
                                Mã QR Quản lý
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                <div className="flex flex-col items-center gap-4 p-5 rounded-3xl bg-gray-50/50 dark:bg-background-dark/50 border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-surface-dark shadow-sm w-full">
                                    <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-gray-50 w-full max-w-[160px]">
                                        {publicQR && <img src={publicQR} alt="Public QR" className="w-full h-auto" />}
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Public ID</span>
                                    <a
                                        href={publicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-primary text-white hover:brightness-110 active:scale-95 transition-all py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                        <span>Xem Public</span>
                                    </a>
                                </div>

                                <div className="flex flex-col items-center gap-4 p-5 rounded-3xl bg-gray-50/50 dark:bg-background-dark/50 border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-surface-dark shadow-sm w-full">
                                    <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-gray-50 w-full max-w-[160px]">
                                        {privateQR && <img src={privateQR} alt="Private QR" className="w-full h-auto" />}
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">Owner Private</span>
                                    <a
                                        href={privateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-accent text-white hover:brightness-110 active:scale-95 transition-all py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                                        <span>Quản lý</span>
                                    </a>
                                </div>
                            </div>
                        </section>

                        {/* Contact & Support Section */}
                        <section className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 border border-white/20 dark:border-white/5">
                            <h3 className="text-sm font-black text-text-main mb-6 uppercase tracking-widest">Hỗ trợ & Liên hệ</h3>
                            <div className="space-y-4">
                                {metadata.hotline && (
                                    <a href={`tel:${metadata.hotline}`} className="group flex items-center gap-4 p-3 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/5">
                                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[20px]">call</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-primary/60 leading-none mb-1">Hotline</span>
                                            <span className="text-sm font-black text-primary">{metadata.hotline}</span>
                                        </div>
                                    </a>
                                )}
                                {metadata.manager?.fullName && (
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-background-dark/50 border border-transparent">
                                        <div className="size-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-text-secondary">
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-gray-400 leading-none mb-1">Quản lý</span>
                                            <span className="text-sm font-bold text-text-main">{metadata.manager.fullName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Desktop Static FABs */}
                        <section className="hidden lg:block space-y-3">
                            <h3 className="text-sm font-black text-text-main mb-4 uppercase tracking-widest opacity-40 px-4">Tác vụ nhanh</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {metadata.fab_actions?.center?.enable && (
                                    <button className="w-full h-14 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white font-black shadow-glow flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10">
                                        <span className="material-symbols-outlined text-2xl">{metadata.fab_actions.center.icon || 'check_circle'}</span>
                                        <span>{metadata.fab_actions.center.text || 'Checkin'}</span>
                                    </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {metadata.fab_actions?.left?.enable && (
                                        <button className="h-14 rounded-3xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-lg flex items-center justify-center text-text-main hover:bg-primary hover:text-white transition-all border border-white/20">
                                            <span className="material-symbols-outlined text-2xl">{metadata.fab_actions.left.icon || 'person'}</span>
                                        </button>
                                    )}
                                    {metadata.fab_actions?.right?.enable && (
                                        <button className="h-14 rounded-3xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-lg flex items-center justify-center text-text-main hover:bg-secondary hover:text-white transition-all border border-white/20">
                                            <span className="material-symbols-outlined text-2xl">{metadata.fab_actions.right.icon || 'phone'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* Main Content Area */}
                    <div className="lg:flex-1 w-full space-y-8">
                        {/* Shop Header (Banner + Content) */}
                        <section className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border border-white/20 dark:border-white/5">
                            {metadata.ishopHeader?.bannerUrl && (
                                <div className="relative h-64 md:h-96 overflow-hidden">
                                    <img
                                        src={metadata.ishopHeader.bannerUrl}
                                        alt="Banner"
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                            )}
                            <div className="p-8 md:p-12 relative">
                                <h1 className="text-3xl md:text-5xl font-black text-text-main mb-8 leading-tight">
                                    {metadata.ishop?.name}
                                </h1>
                                {metadata.ishopHeader?.content && (
                                    <div
                                        className="prose prose-lg md:prose-xl dark:prose-invert text-text-secondary max-w-none leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: metadata.ishopHeader.content }}
                                    />
                                )}
                                <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-100 dark:border-white/5 pt-8">
                                    <div className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Gói dịch vụ</p>
                                        <p className="font-bold text-text-main">{data.packageId}</p>
                                    </div>
                                    <div className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Kích hoạt</p>
                                        <p className="font-bold text-text-main">{new Date(data.activatedDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Hết hạn</p>
                                        <p className="font-bold text-secondary">{new Date(data.endDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Actions Grid (Major Links) */}
                        {metadata.actions && metadata.actions.length > 0 && (
                            <section className="space-y-6 pb-20">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-3">
                                        <span className="material-symbols-outlined text-yellow-400 p-1.5 rounded-xl bg-yellow-400/20">bolt</span>
                                        Tiện ích & Dịch vụ
                                    </h3>
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{metadata.actions.filter(a => a.enable).length} items</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {metadata.actions.filter(a => a.enable).map((action, idx) => (
                                        <a
                                            key={idx}
                                            href={action.valueType === 'URL' ? action.value?.url : '#'}
                                            target={action.valueType === 'URL' ? "_blank" : "_self"}
                                            className="group flex flex-col gap-5 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-6 h-full rounded-[2rem] shadow-xl border border-white/20 dark:border-white/5 hover:scale-[1.03] active:scale-[0.98] transition-all hover:bg-white dark:hover:bg-surface-dark hover:border-primary/30"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="size-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                    <span className="material-symbols-outlined text-3xl">{action.icon || 'link'}</span>
                                                </div>
                                                <span className="material-symbols-outlined text-text-secondary opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all translate-x-[-10px] group-hover:translate-x-0">arrow_forward_ios</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-text-main text-xl mb-1 group-hover:text-primary transition-colors leading-tight">{action.title}</h4>
                                                {action.subTitle && <p className="text-xs text-text-secondary leading-relaxed opacity-80">{action.subTitle}</p>}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile-Only Floating Action Buttons */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-8">
                <div className="max-w-md mx-auto w-full px-6 flex justify-between items-center pointer-events-auto">
                    {metadata.fab_actions?.left?.enable && (
                        <button className="group size-16 rounded-3xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-2xl flex items-center justify-center text-text-main active:scale-90 transition-all border border-white/20">
                            <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">{metadata.fab_actions.left.icon || 'person'}</span>
                        </button>
                    )}

                    {/* Center FAB */}
                    {metadata.fab_actions?.center?.enable && (
                        <button className="flex-1 max-w-[200px] h-16 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white font-black shadow-glow flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-white/10 ring-4 ring-white/5">
                            <span className="material-symbols-outlined text-3xl">{metadata.fab_actions.center.icon || 'check_circle'}</span>
                            <span className="text-base uppercase tracking-wider">{metadata.fab_actions.center.text || 'Checkin'}</span>
                        </button>
                    )}

                    {metadata.fab_actions?.right?.enable && (
                        <button className="group size-16 rounded-3xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-2xl flex items-center justify-center text-text-main active:scale-90 transition-all border border-white/20">
                            <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">{metadata.fab_actions.right.icon || 'phone'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
