'use client';

import Link from 'next/link';
import { MembershipDetail } from '@/features/icom/types/icom';
import { useMemberDetail } from '@/features/icom-members/hooks/useMemberDetail';
import { useIShop } from '@/features/icom/hooks/useIShop';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MemberDetailContainerProps {
    icomId: string;
    shopId: string;
    member: MembershipDetail;
}

/**
 * MemberDetailContainer provides a read-only view of an iCom member's profile and membership.
 */
export default function MemberDetailContainer({ icomId, shopId, member: initialMember }: MemberDetailContainerProps) {
    const { data: memberData, isLoading: isMemberLoading } = useMemberDetail(icomId, shopId);
    const { data: ishopData, isLoading: isShopLoading } = useIShop(shopId);

    // Merge data from both sources for the full view
    // iShop data is authoritative for profile info, memberData for iCom-specifics
    const member = {
        ...initialMember,
        ...ishopData,
        ...memberData,
    };

    if ((isMemberLoading || isShopLoading) && !memberData && !ishopData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            {/* Header: Name and Quick Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center">
                    <Link
                        href={`/icom/${icomId}/members`}
                        className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-900"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                        <div className="mt-1 flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {member.status}
                            </span>
                            <span className="text-sm text-gray-500">{member.industry}</span>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/icom/${icomId}/members/${shopId}/edit`}
                    className="flex items-center justify-center rounded-lg bg-icom-teal px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-teal-600 active:scale-95"
                >
                    <span className="material-symbols-outlined mr-2 text-lg">edit</span>
                    Edit Member Info
                </Link>
            </div>

            {/* Profile Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Stats & Meta */}
                <div className="space-y-6">
                    {/* Membership Card */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-icom-sm">
                        <div className="bg-icom-gradient-blue p-4 text-white">
                            <h3 className="font-bold">Membership Info</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Rank</p>
                                <div className="flex items-center text-gray-900 font-semibold">
                                    <span className="material-symbols-outlined mr-2 text-icom-blue">military_tech</span>
                                    {member.rank || 'BRONZE'}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Role</p>
                                <div className="text-gray-900">{member.role || 'Member'}</div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Joined Date</p>
                                <div className="text-gray-900">
                                    {member.joined_date ? new Date(member.joined_date).toLocaleDateString('vi-VN') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-icom-sm">
                        <div className="bg-icom-gradient p-4 text-white">
                            <h3 className="font-bold">Contact Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {member.phone && (
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined mr-3 text-icom-teal">call</span>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{member.phone}</p>
                                        <p className="text-gray-500 italic">Primary Phone</p>
                                    </div>
                                </div>
                            )}
                            {member.email && (
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined mr-3 text-icom-teal">mail</span>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{member.email}</p>
                                        <p className="text-gray-500 italic">Work Email</p>
                                    </div>
                                </div>
                            )}
                            {member.website && (
                                <div className="flex items-start">
                                    <span className="material-symbols-outlined mr-3 text-icom-teal">language</span>
                                    <div className="text-sm">
                                        <a href={member.website} target="_blank" rel="noopener noreferrer" className="font-medium text-icom-teal hover:underline line-clamp-1">
                                            {member.website.replace(/^https?:\/\//, '')}
                                        </a>
                                        <p className="text-gray-500 italic">Official Website</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Banner and Logo if any */}
                    {(member.banner || member.logo) && (
                        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-icom-sm">
                            {member.banner ? (
                                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${member.banner})` }} />
                            ) : (
                                <div className="h-full w-full bg-icom-gradient-blue opacity-20" />
                            )}

                            {member.logo && (
                                <div className="absolute bottom-6 left-6 h-24 w-24 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg">
                                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${member.logo})` }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="rounded-2xl bg-white p-8 shadow-icom-sm">
                        <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900">
                            <span className="material-symbols-outlined mr-2 text-icom-teal">info</span>
                            About Business
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-600">
                            {member.description || 'No description provided for this business.'}
                        </div>

                        {member.sub_industry && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                    {member.sub_industry}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Gallery Section */}
                    {member.image_urls && (
                        <div className="rounded-2xl bg-white p-8 shadow-icom-sm">
                            <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900">
                                <span className="material-symbols-outlined mr-2 text-icom-teal">imagesmode</span>
                                Gallery
                            </h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {(() => {
                                    try {
                                        const urls = typeof member.image_urls === 'string'
                                            ? JSON.parse(member.image_urls)
                                            : Array.isArray(member.image_urls) ? member.image_urls : [];

                                        if (!Array.isArray(urls)) return <p className="text-sm text-gray-500">Invalid gallery data</p>;
                                        if (urls.length === 0) return <p className="text-sm text-gray-500">No images available</p>;

                                        return urls.map((url: string, index: number) => (
                                            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                <img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover transition-transform hover:scale-110" />
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <p className="text-sm text-gray-500">Error loading gallery</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Location Info */}
                    <div className="rounded-2xl bg-white p-8 shadow-icom-sm">
                        <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900">
                            <span className="material-symbols-outlined mr-2 text-icom-teal">location_on</span>
                            Location
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Full Address</p>
                                <p className="text-gray-900 font-medium">
                                    {[member.street, member.ward, member.district, member.province].filter(Boolean).join(', ')}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Latitude</p>
                                    <p className="font-mono text-gray-900">{member.lat || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Longitude</p>
                                    <p className="font-mono text-gray-900">{member.lng || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="rounded-2xl bg-white p-8 shadow-icom-sm">
                        <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900">
                            <span className="material-symbols-outlined mr-2 text-icom-teal">settings_suggest</span>
                            System Information
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Shop ID</p>
                                <p className="font-mono text-sm text-gray-900">{member.id || member.shop_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-sm text-gray-900">
                                    {member.created ? new Date(member.created).toLocaleString('vi-VN') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Last Modified</p>
                                <p className="text-sm text-gray-900">
                                    {member.modified ? new Date(member.modified).toLocaleString('vi-VN') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Shop Status</p>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {member.status || 'UNKNOWN'}
                                </span>
                            </div>
                            {/* New Fields from Request */}
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Package ID</p>
                                <p className="font-mono text-sm text-gray-900">{member.package_id || 'None'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Private Code</p>
                                <p className="font-mono text-sm text-gray-900">{member.private || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Linked iComs</p>
                                <p className="font-mono text-sm text-gray-900">{member.icoms || 'None'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Card Type</p>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                    {member.card_type || 'ISHOP'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
