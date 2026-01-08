// TypeScript type definitions for iCom system

// ============================================
// Core iCom Types
// ============================================

export interface IComProfile {
    id: string;
    card_type: 'ICOM';
    name: string;
    full_name?: string;
    slogan?: string;
    description?: string;
    logo?: string;
    banner?: string;
    theme_color?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    allowed_industries?: string; // JSON string
    operating_areas?: string; // JSON string
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    require_approval?: string; // "true" or "false" as string
    auto_activate?: string; // "true" or "false" as string
    max_members?: number;
    total_members: number;
    active_members: number;
    created: string; // ISO 8601 timestamp
    modified: string; // ISO 8601 timestamp
    board?: BoardMember[];
    actions?: ActionButton[];
}

export interface CreateIComRequest {
    name: string; // required
    full_name?: string;
    slogan?: string;
    description?: string;
    logo?: string;
    banner?: string;
    theme_color?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    allowed_industries?: string[];
    operating_areas?: string[];
    require_approval?: boolean;
    auto_activate?: boolean;
    max_members?: number;
}

export interface UpdateIComRequest {
    name?: string;
    full_name?: string;
    slogan?: string;
    description?: string;
    logo?: string;
    banner?: string;
    theme_color?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    allowed_industries?: string[];
    operating_areas?: string[];
    require_approval?: boolean;
    auto_activate?: boolean;
    max_members?: number;
}

export interface IComResponse extends IComProfile {
    board: BoardMember[];
    actions: ActionButton[];
}

export interface IComListResponse {
    icoms: IComProfile[];
    total: number;
    page: number;
    limit: number;
}

// ============================================
// Board Member Types
// ============================================

export interface BoardMember {
    member_id: string;
    user_id?: string;
    name: string;
    role: string;
    contact?: string;
    avatar?: string;
    bio?: string;
}

export interface AddBoardMemberRequest {
    user_id?: string;
    name: string; // required
    role: string; // required
    contact?: string;
    avatar?: string;
    bio?: string;
}

export interface UpdateBoardMemberRequest {
    user_id?: string;
    name?: string;
    role?: string;
    contact?: string;
    avatar?: string;
    bio?: string;
}

// ============================================
// Action Button Types
// ============================================

export interface ActionButton {
    action_id: string;
    type: string; // 'zalo', 'facebook', 'messenger', 'website', 'phone', 'email', 'custom'
    title: string;
    url: string;
    icon?: string;
    order?: number;
}

export interface AddActionRequest {
    type: string; // required
    title: string; // required
    url: string; // required
    icon?: string;
    order?: number;
}

export interface UpdateActionRequest {
    type?: string;
    title?: string;
    url?: string;
    icon?: string;
    order?: number;
}

// ============================================
// Member/iShop Types
// ============================================

export interface MemberSummary {
    shop_id: string;
    name: string;
    logo?: string;
    industry: string;
    sub_industry?: string;
    province?: string;
    district?: string;
    ward?: string;
    rank?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    joined_date: string; // ISO 8601
    lat?: number;
    lng?: number;
    distance?: string; // in km (for geo-search results)
}

export interface MembershipDetail extends MemberSummary {
    description?: string;
    banner?: string;
    image_urls?: string; // JSON string
    street?: string;
    phone?: string;
    email?: string;
    website?: string;
    role?: string;
    package_id?: string;
    private?: string;
    icoms?: string;
}

export interface AddMemberRequest {
    name: string; // required
    description?: string;
    logo?: string;
    banner?: string;
    image_urls?: string[];
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    lat: number; // REQUIRED
    lng: number; // REQUIRED
    phone?: string;
    email?: string;
    website?: string;
    industry: string; // required
    sub_industry?: string;
    rank?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    role?: string;
}

export interface UpdateMemberStatusRequest {
    rank?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    role?: string;
}

export interface UpdateMemberOrderRequest {
    display_order: number; // required, >= 1
}

export interface MemberListResponse {
    members: MemberSummary[];
    total: number;
    page: number;
    limit: number;
}

export interface FilterMembersRequest {
    query?: string;
    industry?: string;
    sub_industry?: string;
    province?: string;
    district?: string;
    ward?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    rank?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    page?: number;
    limit?: number;
}

export interface GeoSearchRequest {
    lat: number; // required
    lng: number; // required
    radius: number; // required
    unit: 'km' | 'mi'; // required
}

// ============================================
// Analytics & Stats Types
// ============================================

export interface IComStats {
    total_members: number;
    active_members: number;
    industry_breakdown: Record<string, number>;
    district_breakdown: Record<string, number>;
}

export interface LeaderboardEntry {
    shop_id: string;
    name: string;
    logo?: string;
    score: number; // total likes or interactions
    rank: number;
}

export interface LeaderboardResponse {
    type: 'likes' | 'interactions';
    entries: LeaderboardEntry[];
}

export interface ToggleLikeRequest {
    visitor_id: string; // required, UUID v4
    source: 'icom' | 'ishop'; // required
}

// ============================================
// iShop Types
// ============================================

export interface IShopProfile {
    id: string;
    card_type: 'ISHOP';
    package_id?: string;
    private?: string;
    icoms?: string;
    name: string;
    description?: string;
    logo?: string;
    banner?: string;
    image_urls?: string; // JSON string
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    website?: string;
    industry: string;
    sub_industry?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    created: string;
    modified: string;
}

export interface IShopMembership {
    shop_id: string;
    icom_id: string;
    icom_name: string;
    rank?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    joined_date: string;
    role?: string;
    benefits?: string;
}

export interface CreateIShopRequest {
    name: string; // required
    description?: string;
    logo?: string;
    banner?: string;
    image_urls?: string[];
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    website?: string;
    industry: string; // required
    sub_industry?: string;
}

export interface UpdateIShopRequest {
    name?: string;
    description?: string;
    logo?: string;
    banner?: string;
    image_urls?: string[];
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    website?: string;
    industry?: string;
    sub_industry?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// ============================================
// Common Response Types
// ============================================

export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface MessageResponse {
    message: string;
}
