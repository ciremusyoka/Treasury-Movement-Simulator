'use client'

import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { currency, InitialAccounts } from "../utills";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export type FiltersProps = {
    accounts: InitialAccounts[];
    filterCurrency: string;
    filterAccount: string;
}

export function Filters({
    accounts,
    filterCurrency = '',
    filterAccount = '',
}: FiltersProps) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const updateQuery = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (params.has(key) && !value) {
            params.delete(key)
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-4 mb-4">

            <div className="relative flex-grow min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                    key={filterAccount || "all-account"}
                    // value={filterAccount}
                    defaultValue={filterAccount}
                    onChange={(e) => updateQuery('account_id', e.target.value)}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-full appearance-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                    <option value="">All Accounts</option>
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name} </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <div className="relative flex-grow min-w-[120px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                    key={filterCurrency || "all-currency"}
                    // value={filterCurrency}
                    defaultValue={filterCurrency}
                    onChange={(e) => updateQuery('currency', e.target.value)}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-full appearance-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                    <option value="">All Currencies</option>
                    {currency.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            {(filterAccount || filterCurrency) && (
                <Link
                    href='/transferlogs'
                    className="flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm"
                >
                    Clear Filters
                </Link>
            )}
        </div>
    )
}