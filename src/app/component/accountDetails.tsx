'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, InitialAccounts } from '../utills';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import axios from 'axios';
import LoadingSpinner from './loading';

type Transfer = {
    id: string;
    future_date: string;
    destination_account_id: string;
    destination_currency: string;
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
    const [loading, setLoading] = useState<boolean>();

    useEffect(() => {
        if (isOpen && (account?.future_total && Number(account.future_total) > 0)) {

            const fetchFutureTransfers = async () => {
                try {
                    setLoading(true);
                    const res = await axios(`/api/futuretransfers?account_id=${account.id}`);
                    setFutureTransfers(res.data.data);
                } catch (err) {
                    console.error('Error fetching future transfers:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchFutureTransfers();
        }
    }, [isOpen, account]);

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
                        <div className="mt-8">

                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Transfers</h2>
                            <div className="overflow-x-auto rounded-lg shadow-md">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-200 text-gray-700 text-sm uppercase text-left">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">To</th>
                                            <th className="px-6 py-3">Amount</th>
                                        </tr>
                                    </thead>
                                    {loading ? (
                                        <div className="flex justify-center items-center text-center">
                                            <LoadingSpinner />
                                        </div>

                                    ) : (
                                        futureTransfers?.length > 0 ? (
                                            futureTransfers.map(acct => (
                                                <tr key={acct.id} className="border-t text-gray-500">
                                                    <td className="px-6 py-4">{new Date(acct.future_date).toLocaleString()}</td>
                                                    <td className="px-6 py-4">{acct.destination_account_id}</td>
                                                    <td className="px-6 py-4">
                                                        {formatCurrency(acct.amount, acct.destination_currency)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4 text-gray-500">No future transfers</td>
                                            </tr>
                                        )
                                    )}

                                </table>
                            </div>
                        </div>



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
