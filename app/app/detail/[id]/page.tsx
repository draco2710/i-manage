"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { logout } from '../../actions/logout';

interface CardDetail {
    id: number;
    packageId: string;
    private: number;
    cardType: string;
    phase: string;
    title: string;
    description: string;
    activatedDate: string;
    warrantyDays: number;
    endDate: string;
    ownerName: string;
    ownerPhoneNumber: string;
    ownerAddress?: string;
    status: string;
    metadata: {
        vcard?: {
            firstName?: string;
            lastName?: string;
            organization?: string;
            homePhone?: string;
            email?: string;
            address?: string;
            mobile?: string;
            title?: string;
        };
    };
}

export default function CardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [cardData, setCardData] = useState<CardDetail | null>(null);
    const [publicQR, setPublicQR] = useState('');
    const [privateQR, setPrivateQR] = useState('');
    const [publicUrl, setPublicUrl] = useState('');
    const [privateUrl, setPrivateUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for editable fields
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerAddress: '',
        ownerPhoneNumber: '',
        vcard: {
            firstName: '',
            lastName: '',
            organization: '',
            email: '',
            mobile: '',
            homePhone: '',
            address: '',
            title: '',
        }
    });

    const handleSave = async () => {
        if (!cardData) return;

        try {
            setIsSaving(true);
            setError('');

            // Build update payload with only changed fields
            const updatePayload: any = {};

            if (formData.ownerName !== cardData.ownerName) {
                updatePayload.ownerName = formData.ownerName;
            }
            if (formData.ownerAddress !== (cardData.ownerAddress || '')) {
                updatePayload.ownerAddress = formData.ownerAddress;
            }
            if (formData.ownerPhoneNumber !== cardData.ownerPhoneNumber) {
                updatePayload.ownerPhoneNumber = formData.ownerPhoneNumber;
            }

            // Check if vCard fields changed
            const vcardChanged =
                formData.vcard.firstName !== (cardData.metadata?.vcard?.firstName || '') ||
                formData.vcard.lastName !== (cardData.metadata?.vcard?.lastName || '') ||
                formData.vcard.organization !== (cardData.metadata?.vcard?.organization || '') ||
                formData.vcard.email !== (cardData.metadata?.vcard?.email || '') ||
                formData.vcard.mobile !== (cardData.metadata?.vcard?.mobile || '') ||
                formData.vcard.homePhone !== (cardData.metadata?.vcard?.homePhone || '') ||
                formData.vcard.address !== (cardData.metadata?.vcard?.address || '') ||
                formData.vcard.title !== (cardData.metadata?.vcard?.title || '');

            if (vcardChanged) {
                updatePayload.metadata = {
                    ...cardData.metadata,
                    vcard: formData.vcard
                };
            }

            // Only send if there are changes
            if (Object.keys(updatePayload).length === 0) {
                setIsEditMode(false);
                return;
            }

            const response = await fetch(`https://api.qrcare.net/api/QRIDs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                throw new Error('Không thể cập nhật thông tin');
            }

            const updatedData = await response.json();
            setCardData(updatedData);
            setIsEditMode(false);
        } catch (err) {
            console.error('Error saving card details:', err);
            setError('Không thể lưu thông tin. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchCardDetail = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await fetch(`https://api.qrcare.net/api/QRIDs/${id}`);

                if (!response.ok) {
                    throw new Error('Không thể tải thông tin thẻ');
                }

                const data: CardDetail = await response.json();
                setCardData(data);

                // Initialize form data
                setFormData({
                    ownerName: data.ownerName || '',
                    ownerAddress: data.ownerAddress || '',
                    ownerPhoneNumber: data.ownerPhoneNumber || '',
                    vcard: {
                        firstName: data.metadata?.vcard?.firstName || '',
                        lastName: data.metadata?.vcard?.lastName || '',
                        organization: data.metadata?.vcard?.organization || '',
                        email: data.metadata?.vcard?.email || '',
                        mobile: data.metadata?.vcard?.mobile || '',
                        homePhone: data.metadata?.vcard?.homePhone || '',
                        address: data.metadata?.vcard?.address || '',
                        title: data.metadata?.vcard?.title || '',
                    }
                });

                // Generate QR codes based on card type
                const baseUrl = 'https://m.ishowroom.vn/#!';
                let pubUrl = '';
                let privUrl = '';

                // Helper to get URLs
                switch (data.cardType) {
                    case 'CARD_TYPE.ISHOP':
                        pubUrl = `${baseUrl}/s/${id}/i/0/p/${data.private}`;
                        privUrl = `${baseUrl}/s-edit/${id}/p/${data.private}`;
                        break;
                    case 'CARD_TYPE.IPET':
                        pubUrl = `${baseUrl}/p/${id}/p/${data.private}`;
                        privUrl = `${baseUrl}/pet-edit/${id}/p/${data.private}`;
                        break;
                    case 'CARD_TYPE.IMEMBER':
                        pubUrl = `${baseUrl}/m/${id}/p/${data.private}`;
                        privUrl = `${baseUrl}/m-edit/${id}/p/${data.private}`;
                        break;
                    case 'CARD_TYPE.IDOC':
                    case 'CARD_TYPE.ISTAND':
                        pubUrl = `${baseUrl}/id/${id}/i/0/p/${data.private}`;
                        privUrl = `${baseUrl}/id-edit/${id}/p/${data.private}`;
                        break;
                    case 'CARD_TYPE.ICARD':
                    default:
                        // Default to iCard pattern
                        pubUrl = `${baseUrl}/n/${id}/p/${data.private}`;
                        privUrl = `${baseUrl}/edit-card/${id}/p/${data.private}`;
                        break;
                }

                setPublicUrl(pubUrl);
                setPrivateUrl(privUrl);

                const publicQRCode = await QRCode.toDataURL(pubUrl, {
                    width: 400,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });

                const privateQRCode = await QRCode.toDataURL(privUrl, {
                    width: 400,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });

                setPublicQR(publicQRCode);
                setPrivateQR(privateQRCode);
            } catch (err) {
                console.error('Error fetching card details:', err);
                setError('Không thể tải thông tin thẻ');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCardDetail();
    }, [id]);

    const getCardTypeName = (type?: string) => {
        switch (type) {
            case 'CARD_TYPE.ISHOP': return 'iShop';
            case 'CARD_TYPE.IPET': return 'iPet';
            case 'CARD_TYPE.IMEMBER': return 'iMember';
            case 'CARD_TYPE.IDOC': return 'iDoc';
            case 'CARD_TYPE.ISTAND': return 'iStand';
            default: return 'iCard';
        }
    };

    const isICard = cardData?.cardType === 'CARD_TYPE.ICARD' || !cardData?.cardType;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    if (error || !cardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy thông tin thẻ'}</p>
                <Link href="/">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg">Quay lại</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-x-hidden antialiased">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 px-6 md:px-10 border-b border-gray-200/50 dark:border-white/5">
                <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
                    <button
                        onClick={() => router.back()}
                        className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h2 className="text-text-main text-lg font-bold leading-tight flex-1 text-center truncate px-2">
                        Chi tiết {getCardTypeName(cardData?.cardType)}
                    </h2>
                    <div className="flex items-center justify-end gap-1">
                        {isEditMode ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        // Reset form data
                                        if (cardData) {
                                            setFormData({
                                                ownerName: cardData.ownerName || '',
                                                ownerAddress: cardData.ownerAddress || '',
                                                ownerPhoneNumber: cardData.ownerPhoneNumber || '',
                                                vcard: {
                                                    firstName: cardData.metadata?.vcard?.firstName || '',
                                                    lastName: cardData.metadata?.vcard?.lastName || '',
                                                    organization: cardData.metadata?.vcard?.organization || '',
                                                    email: cardData.metadata?.vcard?.email || '',
                                                    mobile: cardData.metadata?.vcard?.mobile || '',
                                                    homePhone: cardData.metadata?.vcard?.homePhone || '',
                                                    address: cardData.metadata?.vcard?.address || '',
                                                    title: cardData.metadata?.vcard?.title || '',
                                                }
                                            });
                                        }
                                    }}
                                    className="text-red-500 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="text-green-600 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-2xl">
                                        {isSaving ? 'progress_activity' : 'check'}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">edit</span>
                            </button>
                        )}
                        {!isEditMode && (
                            <button
                                onClick={() => logout()}
                                className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                title="Đăng xuất"
                            >
                                <span className="material-symbols-outlined text-2xl">logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Card Summary & QR */}
                    <div className="space-y-6">
                        {/* Card Visual Summary */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-600 shadow-xl p-8 group transition-all hover:shadow-2xl hover:shadow-primary/20">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-accent/40 rounded-full blur-3xl"></div>

                            <div className="flex flex-col gap-8 relative z-10 text-white">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <span className="bg-white/25 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full w-fit border border-white/30 shadow-sm flex items-center gap-1">
                                            <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            {cardData.status === 'QRID_STATUS.ACTIVE' ? 'Active' : 'Inactive'}
                                        </span>
                                        <h3 className="text-3xl font-bold leading-tight drop-shadow-sm mt-1">
                                            {cardData.title || getCardTypeName(cardData.cardType)}
                                        </h3>
                                        <p className="text-sky-100 text-sm font-medium opacity-90">ID: {cardData.id}</p>
                                    </div>
                                    <div className="size-24 bg-white rounded-2xl p-2 shadow-lg shrink-0 transform transition-transform group-hover:scale-105">
                                        {publicQR && <img alt="QR Code" className="w-full h-full object-contain" src={publicQR} />}
                                    </div>
                                </div>
                                <div className="text-xs text-sky-100 font-medium">
                                    <span>Kích hoạt: {new Date(cardData.activatedDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Codes Detail */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl shadow-black/5 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                Mã QR & Đường dẫn
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-background-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:shadow-lg">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-white/5">Public Link</span>
                                    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-50 w-full max-w-[200px]">
                                        {publicQR && <img alt="Public QR" className="w-full h-auto" src={publicQR} />}
                                    </div>
                                    <a
                                        href={publicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-primary text-white hover:brightness-110 active:scale-95 transition-all py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                        <span>Xem trang Public</span>
                                    </a>
                                </div>

                                <div className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-background-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:shadow-lg">
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-3 py-1 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-white/5">Private Link</span>
                                    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-50 w-full max-w-[200px]">
                                        {privateQR && <img alt="Private QR" className="w-full h-auto" src={privateQR} />}
                                    </div>
                                    <a
                                        href={privateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-accent text-white hover:brightness-110 active:scale-95 transition-all py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                                        <span>Xem trang Quản lý</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information & Forms */}
                    <div className="space-y-6">
                        {/* System Information */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl shadow-black/5 border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">dns</span>
                                Thông tin hệ thống
                            </h3>
                            <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-white/5">
                                <div className="py-4 flex justify-between items-center gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-background-dark rounded-xl px-2">
                                    <span className="text-text-secondary text-sm font-medium">Chủ sở hữu</span>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="bg-gray-50 dark:bg-background-dark text-text-main text-sm font-bold border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/40 outline-none w-[60%]"
                                        />
                                    ) : (
                                        <span className="text-text-main text-sm font-bold">{cardData.ownerName || 'Chưa cập nhật'}</span>
                                    )}
                                </div>
                                <div className="py-4 flex justify-between items-center gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-background-dark rounded-xl px-2">
                                    <span className="text-text-secondary text-sm font-medium">Số điện thoại</span>
                                    {isEditMode ? (
                                        <input
                                            type="tel"
                                            value={formData.ownerPhoneNumber}
                                            onChange={(e) => setFormData({ ...formData, ownerPhoneNumber: e.target.value })}
                                            className="bg-gray-50 dark:bg-background-dark text-text-main text-sm font-bold border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/40 outline-none w-[60%]"
                                        />
                                    ) : (
                                        <span className="text-text-main text-sm font-bold">{cardData.ownerPhoneNumber || 'Chưa cập nhật'}</span>
                                    )}
                                </div>
                                <div className="py-4 flex justify-between items-center gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-background-dark rounded-xl px-2">
                                    <span className="text-text-secondary text-sm font-medium">Gói dịch vụ</span>
                                    <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">{cardData.packageId}</span>
                                </div>
                                <div className="py-4 flex justify-between items-center gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-background-dark rounded-xl px-2">
                                    <span className="text-text-secondary text-sm font-medium">Hạn dùng</span>
                                    <span className="text-text-main text-sm font-bold italic">{new Date(cardData.endDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* vCard Details if applicable */}
                        {isICard && cardData.metadata?.vcard && (
                            <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xl shadow-black/5 border border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">contact_page</span>
                                    Thông tin Danh thiếp
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/10">
                                        <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white dark:border-slate-800 shrink-0">
                                            {(formData.vcard.lastName?.[0] || 'Q') + (formData.vcard.firstName?.[0] || 'R')}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {isEditMode ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Họ"
                                                        value={formData.vcard.lastName}
                                                        onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, lastName: e.target.value } })}
                                                        className="bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Tên"
                                                        value={formData.vcard.firstName}
                                                        onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, firstName: e.target.value } })}
                                                        className="bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none"
                                                    />
                                                </div>
                                            ) : (
                                                <h4 className="text-xl font-bold text-text-main">
                                                    {formData.vcard.lastName} {formData.vcard.firstName}
                                                </h4>
                                            )}
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    placeholder="Chức vụ"
                                                    value={formData.vcard.title}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, title: e.target.value } })}
                                                    className="w-full bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none font-bold text-primary"
                                                />
                                            ) : (
                                                <p className="text-primary font-bold text-sm">{formData.vcard.title}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                        {[
                                            { label: 'Công ty', value: formData.vcard.organization, key: 'organization', icon: 'business' },
                                            { label: 'Email', value: formData.vcard.email, key: 'email', icon: 'mail' },
                                            { label: 'Di động', value: formData.vcard.mobile, key: 'mobile', icon: 'smartphone' },
                                            { label: 'Địa chỉ', value: formData.vcard.address, key: 'address', icon: 'location_on' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-background-dark rounded-2xl transition-colors border border-transparent shadow-sm hover:border-gray-100 dark:hover:border-white/5 shadow-black/5">
                                                <div className="size-10 rounded-xl bg-gray-100 dark:bg-surface-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{item.label}</span>
                                                    {isEditMode ? (
                                                        <input
                                                            value={item.value}
                                                            onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, [item.key]: e.target.value } })}
                                                            className="bg-transparent border-b border-gray-200 dark:border-white/10 pb-1 text-sm font-bold text-text-main outline-none focus:border-primary"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-text-main truncate">{item.value || '---'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>


        </div>
    );
}
