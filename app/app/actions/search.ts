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

function buildFilter(searchType: SearchType, searchQuery: string) {
    const searchPattern = `%${searchQuery}%`;

    if (searchType === 'all') {
        return {
            where: {
                or: [
                    { id: { like: searchPattern } },
                    { ownerName: { ilike: searchPattern } }
                ]
            },
            fields: {
                id: true,
                ownerName: true,
                private: true,
                cardType: true,
                packageId: true
            }
        };
    }

    if (searchType === 'ishop') {
        return {
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
            },
            fields: {
                id: true,
                ownerName: true,
                private: true
            }
        };
    }

    // icard
    return {
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
        },
        fields: {
            id: true,
            ownerName: true,
            private: true,
            cardType: true
        }
    };
}

export async function searchQRIDs(searchType: SearchType, searchQuery: string) {
    if (!searchQuery || searchQuery.trim() === '') {
        return { error: 'Vui lòng nhập từ khóa tìm kiếm' };
    }

    // Just redirect to search page with query params
    // The search page will fetch the data itself
    const searchParams = new URLSearchParams({
        q: searchQuery,
        type: searchType,
    });

    redirect(`/search?${searchParams.toString()}`);
}

// Export the fetch function so search page can use it
export async function fetchSearchResults(searchType: SearchType, searchQuery: string): Promise<SearchResult[]> {
    const filter = buildFilter(searchType, searchQuery);
    const baseUrl = 'https://api.qrcare.net/api/QRIDs'; // Fixed double slash
    const url = `${baseUrl}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache search results
    });

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
    }

    return response.json();
}
