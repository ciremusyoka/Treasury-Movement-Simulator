"use client"
import { fetchAccountList, formatCurrency, InitialAccounts, } from "../utills";
import React, { useState, useMemo, useEffect, } from 'react';
import { convert, rates } from "../utills/convertion";
import axios from "axios";
import { increment } from "firebase/firestore/lite";

const base_url: string | undefined = process.env.NEXT_PUBLIC_BASE_URL

const TransferForm = () => {
    const [sourceAccount, setSourceAccount] = useState('');
    const [destinationAccount, setDestinationAccount] = useState('');
    const [amount, setAmount] = useState<number | null>(null);
    const [isFutureDated, setIsFutureDated] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [accounts, setAccounts] = useState<InitialAccounts[]>([]);
    const [error, setError] = useState<string | null>(null)
    const [note, setNote] = useState<string>("");
    const [transferDate, setTransferDate] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {

                const accountList = await fetchAccountList(base_url);
                setAccounts(accountList);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError("Internal server error");
                } else {
                    setError("Internal server error");
                }
            }

        }
        fetchAccounts();
    }, [])



    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 15000);

        return () => clearTimeout(timer);
    }, [message]);




    const availableSourceAccounts = useMemo(() => accounts.filter(acc => acc.id !== destinationAccount), [accounts, destinationAccount]);
    const availableDestinationAccounts = useMemo(() => accounts.filter(acc => acc.id !== sourceAccount), [accounts, sourceAccount]);
    const srcAcc = useMemo(() => {
        if (!sourceAccount) return undefined
        return accounts.find(acc => acc.id === sourceAccount)
    }, [accounts, sourceAccount])
    const destAcc = useMemo(() => {
        if (!destinationAccount) return undefined;
        return accounts.find(acc => acc.id === destinationAccount)
    }, [accounts, destinationAccount]);

    const convertedAmount = useMemo(() => {
        if (!destAcc || !srcAcc || !amount) return undefined
        return convert(srcAcc?.currency as string, destAcc?.currency as string, amount)
    }, [destAcc, srcAcc, amount])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const srcAcc = accounts.find(acc => acc.id === sourceAccount);
        const destAcc = accounts.find(acc => acc.id === destinationAccount);
        const transferAmount = amount;



        if (!srcAcc || !destAcc) {
            setMessage({ type: 'error', text: 'Please select valid source and destination accounts.' });
            return;
        }

        if (isNaN(transferAmount) || transferAmount <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
            return;
        }

        if (Number(srcAcc.available_balance) < transferAmount) {
            setMessage({ type: 'error', text: 'Insufficient balance in source account for direct transfer.' });
            return;
        }


        try {
            const base_url = process.env.NEXT_PUBLIC_BASE_URL
            await axios.post(`${base_url}api/transferfunds`, {
                sourceAccountId: srcAcc.id,
                destinationAccountId: destAcc.id,
                amount,
                sourceCurrency: srcAcc.currency,
                destinationCurrency: destAcc.currency,
                note,
                transferDate
            });


            setMessage({ type: 'success', text: 'Transfer successful!' });
            setSourceAccount('');
            setDestinationAccount('');
            setAmount(null);
            setIsFutureDated(false);
            setTransferDate("")
        } catch (error) {
            setMessage({ type: 'error', text: `Transfer failed: ${error.message}` });
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Move Money</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="sourceAccount" className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                    <select
                        id="sourceAccount"
                        value={sourceAccount}
                        onChange={(e) => setSourceAccount(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        required
                    >
                        <option value="">Select source account</option>
                        {availableSourceAccounts.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.available_balance, account.currency)})
                            </option>
                        ))}
                    </select>
                    {srcAcc?.available_balance && amount && <p className="text-green-500 text-xs">New balance {srcAcc.available_balance - amount} {srcAcc.currency}</p>}
                </div>
                <div>
                    <label htmlFor="destinationAccount" className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                    <select
                        id="destinationAccount"
                        value={destinationAccount}
                        onChange={(e) => setDestinationAccount(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        required
                    >
                        <option value="">Select destination account</option>
                        {availableDestinationAccounts.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                    {destAcc?.available_balance && convertedAmount && <p className="text-green-500 text-xs">New balance {Number(destAcc.available_balance) + Number(convertedAmount)} {destAcc.currency}</p>}
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount || ''}
                        onChange={(e) => setAmount(e.target.value as any)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 5000"
                        min="1"
                        step="10"
                        max={srcAcc?.available_balance}

                    />
                    {destAcc?.currency && srcAcc?.currency && destAcc.currency !== srcAcc.currency &&
                        <p className="text-green-500 text-xs">Conversion rate: 1 {srcAcc.currency} = {rates[srcAcc.currency][destAcc.currency]} {destAcc.currency}</p>
                    }
                    {amount && Number(amount) > Number(srcAcc?.available_balance) && (
                        <p className="text-red-500 text-xs mt-1"> Please enter amount less than source account balance</p>
                    )}
                </div>
                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                    <input
                        type="text"
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Q3 Payouts"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="futureDated"
                        type="checkbox"
                        checked={isFutureDated}
                        onChange={(e) => setIsFutureDated(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="futureDated" className="ml-2 block text-sm text-gray-900">
                        Set Future-Dated Transfer
                    </label>
                </div>
                {isFutureDated && (
                    <div className="mt-2">
                        <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700">
                            Transfer Date
                        </label>
                        <input
                            id="transferDate"
                            type="datetime-local"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        {transferDate && new Date(transferDate) < new Date() && (
                            <p className="text-red-500 text-xs mt-1">Please enter a date from today or later</p>
                        )}
                    </div>
                )}
                {message.text && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    Initiate Transfer
                </button>
            </form>
        </div>
    );
};

export default TransferForm;