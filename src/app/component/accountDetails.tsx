'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, InitialAccounts } from '../utills';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

type Transfer = {
    date: string;
    destinationAccount: string;
    currency: string;
    amount: number;
};

type Props = {
    account: InitialAccounts;
};

export default function AccountSummaryModal({
    account
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const [futureTransfers, setFutureTransfers] = useState<Transfer[]>([]);

    useEffect(() => {
        if (!isOpen || (account?.future_total && Number(account.future_total) > 0)) return;

        const fetchFutureTransfers = async () => {
            try {
                const res = await fetch('/api/futuretransfers');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setFutureTransfers(data);
            } catch (err) {
                console.error('Error fetching future transfers:', err);
            }
        };

        fetchFutureTransfers();
    }, [isOpen, account]);


    console.log(futureTransfers)
    return (
        <>
            <button className="text-blue-500 text-xs cursor-pointer hover:underline"
                onClick={() => setIsOpen(true)}
            >
                Details
            </button>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-white rounded-lg max-w-md p-6 shadow-xl">
                        <DialogTitle className="text-black text-lg font-bold">Account Summary</DialogTitle>
                        <hr />
                        <p className='text-black mt-2'><strong>Available Balance:</strong> {formatCurrency(account.available_balance, account.currency)}</p>
                        <p className='text-black'><strong>Actual Balance:</strong> {formatCurrency(account.actual_balance, account.currency)}</p>
                        <p className='text-black'><strong>Total Future Transfers:</strong> {formatCurrency(account.future_total, account.currency)}</p>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="mt-4 text-gray-500 cursor-pointer px-3 py-1 rounded hover:underline"
                        >
                            Close
                        </button>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
