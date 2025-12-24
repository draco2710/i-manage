'use server';

import { redirect } from 'next/navigation';

type SearchType = 'all' | 'ishop' | 'icard';

interface SearchResult {
    id: string;
    ownerName?: string;
    private?: string | number;
    cardType?: string;
    packageId?: string;
}

function buildFilter(searchType: SearchType, searchQuery: string, skip?: number, limit?: number, fields?: any) {
    const searchPattern = `%${searchQuery}%`;
    let filter: any = {};

    if (searchType === 'all') {
        filter = {
            where: {
                or: [
                    { id: { like: searchPattern } },
                    { ownerName: { ilike: searchPattern } }
                ]
            }
        };
    } else if (searchType === 'ishop') {
        filter = {
            where: {
                and: [
                    { cardType: "CARD_TYPE.ISHOP" },
                    {
                        or: [
                            { id: { like: searchPattern } },
                            { ownerName: { ilike: searchPattern } }
                        ]
                    }
                ]
            }
        };
    } else {
        // icard
        filter = {
            where: {
                and: [
                    { cardType: { neq: "CARD_TYPE.ISHOP" } },
                    {
                        or: [
                            { id: { like: searchPattern } },
                            { ownerName: { ilike: searchPattern } }
                        ]
                    }
                ]
            }
        };
    }

    // Default fields if not specified
    if (fields) {
        filter.fields = fields;
    } else {
        filter.fields = {
            id: true,
            ownerName: true,
            private: true,
            cardType: true,
            packageId: searchType === 'all' ? true : undefined
        };
    }

    if (skip !== undefined) filter.skip = skip;
    if (limit !== undefined) filter.limit = limit;

    return filter;
}

export async function searchQRIDs(searchType: SearchType, searchQuery: string) {
    if (!searchQuery || searchQuery.trim() === '') {
        return { error: 'Vui lòng nhập từ khóa tìm kiếm' };
    }

    const searchParams = new URLSearchParams({
        q: searchQuery,
        type: searchType,
    });

    redirect(`/search?${searchParams.toString()}`);
}

/**
 * Fetches only the count of search results to optimize performance.
 * As requested, it only requests the 'id' field initially.
 */
export async function fetchSearchCount(searchType: SearchType, searchQuery: string): Promise<number> {
    // Only fetch IDs to count
    const filter = buildFilter(searchType, searchQuery, undefined, undefined, { id: true });
    const baseUrl = 'https://api.qrcare.net/api/QRIDs';
    const url = `${baseUrl}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Count failed: ${response.status}`);
    }

    const results = await response.json();
    return Array.isArray(results) ? results.length : 0;
}

// Updated to support skip and limit
export async function fetchSearchResults(
    searchType: SearchType,
    searchQuery: string,
    skip: number = 0,
    limit: number = 20
): Promise<SearchResult[]> {
    const filter = buildFilter(searchType, searchQuery, skip, limit);
    const baseUrl = 'https://api.qrcare.net/api/QRIDs';
    const url = `${baseUrl}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
    }

    return response.json();
}
