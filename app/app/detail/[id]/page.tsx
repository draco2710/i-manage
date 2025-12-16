"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';

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

    // Determine if we should show vCard info (mainly for iCard, maybe iMember/iDoc too? defaulting to just iCard for now as per previous logic)
    // Actually, user only mentioned vCard info for "iCard (Danh thiếp cá nhân)".
    const isICard = cardData?.cardType === 'CARD_TYPE.ICARD' || !cardData?.cardType; // Default to true if undefined or explicitly iCard

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    if (error || !cardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light p-4">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy thông tin thẻ'}</p>
                <Link href="/">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg">Quay lại</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-md mx-auto h-screen bg-background-light flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex-none sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 pt-6 pb-2 justify-between border-b border-border-subtle">
                <Link href="/">
                    <button className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                    </button>
                </Link>
                <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    Chi tiết {getCardTypeName(cardData?.cardType)}
                </h2>
                <div className="flex w-10 items-center justify-end">
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
                                className="text-red-500 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="text-green-600 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {isSaving ? 'progress_activity' : 'check'}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
                <div className="p-4">
                    {/* Card Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-xl p-6 mb-6 group transition-all hover:shadow-2xl hover:shadow-primary/20">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-accent/40 rounded-full blur-3xl"></div>

                        <div className="flex flex-col gap-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-2 flex-1 pr-2">
                                    <span className="bg-white/25 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full w-fit border border-white/30 shadow-sm flex items-center gap-1">
                                        <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        {cardData.status === 'QRID_STATUS.ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                    <h3 className="text-white text-2xl font-bold leading-tight drop-shadow-sm mt-1">
                                        {cardData.title || getCardTypeName(cardData.cardType)}
                                    </h3>
                                    <p className="text-sky-100 text-sm font-medium opacity-90">ID: {cardData.id}</p>
                                </div>
                                <div className="size-20 bg-white rounded-2xl p-1.5 shadow-lg shrink-0 transform transition-transform group-hover:scale-105">
                                    {publicQR && <img alt="QR Code" className="w-full h-full object-contain" src={publicQR} />}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-sky-100 font-medium">
                                    <span>Kích hoạt: {new Date(cardData.activatedDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* QR Codes Section */}
                    <div className="mb-8">
                        <h3 className="text-text-main text-base font-bold mb-4 flex items-center gap-2 px-1">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                            </div>
                            Mã QR & Đường dẫn
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 rounded-md p-2 border border-border-subtle flex flex-col items-center shadow-soft hover:shadow-lg transition-all duration-300 group overflow-hidden">
                                <span className="text-primary text-[10px] font-bold mb-2 uppercase tracking-widest bg-primary/5 px-2 py-0.5">Public</span>
                                {/* <div className="bg-white p-2 rounded-sm w-full mb-3 border border-gray-100 shadow-inner group-hover:scale-[1.02] transition-transform"> */}
                                {publicQR && <img alt="Public QR Code" className="w-full h-auto object-contain" src={publicQR} />}
                                {/* </div> */}
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-primary/10 text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors py-1 text-xs rounded-b-md font-bold flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[8px]">qr_code_scanner</span>
                                    <span>Quét QR</span>
                                </a>
                            </div>

                            <div className="bg-accent/5 rounded-md p-2 border border-border-subtle flex flex-col items-center shadow-soft hover:shadow-lg transition-all duration-300 group">
                                <span className="text-accent text-[10px] font-bold mb-2 uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-full">Private</span>
                                {/* <div className="bg-white p-2 rounded-xl w-full mb-3 border border-gray-100 shadow-inner group-hover:scale-[1.02] transition-transform"> */}
                                {privateQR && <img alt="Private QR Code" className="w-full h-auto object-contain" src={privateQR} />}
                                {/* </div> */}
                                <a
                                    href={privateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-accent/10 text-accent hover:bg-accent/5 active:bg-accent/10 transition-colors py-1 rounded-md text-xs font-bold flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[8px]">qr_code_scanner</span>
                                    <span>Quét QR</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="mb-8">
                        <h3 className="text-text-main text-base font-bold mb-4 flex items-center gap-2 px-1">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-[20px]">dns</span>
                            </div>
                            Thông tin hệ thống
                        </h3>
                        <div className="bg-surface rounded-3xl overflow-hidden border border-border-subtle shadow-soft divide-y divide-gray-50">
                            <div className="flex justify-between items-center p-4 hover:bg-background-light transition-colors group">
                                <span className="text-text-secondary text-sm font-medium">Mã gói</span>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">{cardData.packageId}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 hover:bg-background-light transition-colors group">
                                <span className="text-text-secondary text-sm font-medium">Chủ sở hữu</span>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="text-text-main text-sm font-semibold border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50 text-right w-[60%]"
                                    />
                                ) : (
                                    <span className="text-text-main text-sm font-semibold">{cardData.ownerName || 'N/A'}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center p-4 hover:bg-background-light transition-colors group">
                                <span className="text-text-secondary text-sm font-medium">SĐT đăng ký</span>
                                {isEditMode ? (
                                    <input
                                        type="tel"
                                        value={formData.ownerPhoneNumber}
                                        onChange={(e) => setFormData({ ...formData, ownerPhoneNumber: e.target.value })}
                                        className="text-text-main text-sm font-semibold border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50 text-right w-[60%]"
                                    />
                                ) : (
                                    <span className="text-text-main text-sm font-semibold">{cardData.ownerPhoneNumber || 'N/A'}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center p-4 hover:bg-background-light transition-colors group">
                                <span className="text-text-secondary text-sm font-medium">Loại thẻ</span>
                                <span className="text-text-main text-sm font-semibold">{getCardTypeName(cardData.cardType)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* vCard Info (only for iCard) */}
                {isICard && cardData.metadata?.vcard && (
                    <div className="mb-6">
                        <h3 className="text-text-main text-base font-bold mb-4 flex items-center gap-2 px-1">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-[20px]">contact_page</span>
                            </div>
                            Thông tin vCard
                        </h3>
                        <div className="bg-surface rounded-3xl p-5 border border-border-subtle shadow-soft flex flex-col gap-6">
                            <div className="flex items-center gap-5 border-b border-gray-100 pb-5">
                                <div className="size-20 rounded-full bg-gradient-to-br from-primary to-blue-600 overflow-hidden shrink-0 border-[3px] border-white shadow-lg ring-2 ring-primary/20 flex items-center justify-center text-white font-bold text-2xl">
                                    {(formData.vcard.firstName?.[0] || '') + (formData.vcard.lastName?.[0] || '')}
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    {isEditMode ? (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Họ"
                                                    value={formData.vcard.lastName}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, lastName: e.target.value } })}
                                                    className="flex-1 min-w-0 text-text-main font-bold text-lg border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Tên"
                                                    value={formData.vcard.firstName}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, firstName: e.target.value } })}
                                                    className="flex-1 min-w-0 text-text-main font-bold text-lg border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Chức vụ"
                                                value={formData.vcard.title}
                                                onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, title: e.target.value } })}
                                                className="w-full text-primary font-bold text-sm bg-primary/5 px-2 py-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Công ty"
                                                value={formData.vcard.organization}
                                                onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, organization: e.target.value } })}
                                                className="w-full text-text-secondary text-xs font-medium border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-text-main font-bold text-xl leading-tight truncate">
                                                {`${formData.vcard.lastName || ''} ${formData.vcard.firstName || ''}`.trim() || cardData.ownerName}
                                            </h4>
                                            {formData.vcard.title && (
                                                <p className="text-primary font-bold text-sm bg-primary/5 px-2 py-0.5 rounded-md w-fit max-w-full truncate">
                                                    {formData.vcard.title}
                                                </p>
                                            )}
                                            {formData.vcard.organization && (
                                                <p className="text-text-secondary text-xs font-medium truncate">{formData.vcard.organization}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                {(isEditMode || formData.vcard.email) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="size-9 rounded-xl bg-background-light flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wide">Email</span>
                                            {isEditMode ? (
                                                <input
                                                    type="email"
                                                    value={formData.vcard.email}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, email: e.target.value } })}
                                                    className="w-full text-text-main text-sm font-medium border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <span className="text-text-main text-sm font-medium break-all">{formData.vcard.email}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(isEditMode || formData.vcard.mobile || formData.vcard.homePhone) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="size-9 rounded-xl bg-background-light flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-[20px]">call</span>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wide">Điện thoại</span>
                                            {isEditMode ? (
                                                <input
                                                    type="tel"
                                                    value={formData.vcard.mobile || formData.vcard.homePhone}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, mobile: e.target.value } })}
                                                    className="w-full text-text-main text-sm font-medium border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <span className="text-text-main text-sm font-medium">
                                                    {formData.vcard.mobile || formData.vcard.homePhone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(isEditMode || formData.vcard.address) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="size-9 rounded-xl bg-background-light flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wide">Địa chỉ</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.vcard.address}
                                                    onChange={(e) => setFormData({ ...formData, vcard: { ...formData.vcard, address: e.target.value } })}
                                                    className="w-full text-text-main text-sm font-medium border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <span className="text-text-main text-sm font-medium">{formData.vcard.address}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Floating Action Button */}
            <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none z-50">
                <button className="pointer-events-auto shadow-glow bg-primary text-white font-bold h-14 rounded-full px-8 flex items-center gap-2 hover:scale-105 transition-all active:scale-95 border border-white/20 hover:bg-primary-dark">
                    <span className="material-symbols-outlined">center_focus_weak</span>
                    <span>Quét thẻ</span>
                </button>
            </div>
        </div >



    )
}
