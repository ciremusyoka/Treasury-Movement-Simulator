import React, { useMemo } from 'react';
import { ChevronDown, Filter, Calendar } from 'lucide-react';
import { fetchAccountList, formatCurrency } from "../utills";
import axios from 'axios';
import { Filters } from './filters';

const base_url: string | undefined = process.env.BASE_URL

const getAllTransferLogs = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.data.data;
    } catch (err) {
        throw (err)
    }
}

async function TransactionLog({
    searchParams
}: any) {

    const { currency, account_id } = await searchParams
    let url = `${base_url}api/transferlogs`
    let queryParams = ''

    if (currency) {
        queryParams = `currency=${currency}`

        console.log("queryParams:::=> 1", queryParams);

    }

    if (account_id) {
        const query = `account_id=${account_id}`
        if (queryParams) {
            queryParams = `${queryParams}&${query}`
            console.log("queryParams:::=> 2", queryParams);
        } else {
            queryParams = `${query}`
            console.log("queryParams:::=> 3", queryParams);
        }
    }

    if (queryParams) {
        url = `${url}?${queryParams}`
        console.log("queryParams:::=> 4", url);
    }
    console.log("queryParams:::=> 5", url);
    let transactions = []
    let error = ''


    try {
        transactions = await getAllTransferLogs(url);
    } catch (e) {
        error = JSON.stringify(e)
    }

    const fetchAccounts = async () => {
        try {

            return await fetchAccountList(base_url);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.log('Unexpected error:', error);
                error = "Internal server error"
            } else {
                console.log('Unexpected error:', err);
                error = "Internal server error"
            }
        }

    }
    const accounts = await fetchAccounts();

    if (error) return <div>{error}</div>;

    const accountsMap = {}
    accounts.forEach(acc => accountsMap[acc.id] = acc);


    // const transactions = [];
    // const accounts = initialAccountsList;

    // const accountNamesMap = useMemo(() => {
    //     const map = {};
    //     accounts.forEach(acc => {
    //         map[acc.id] = acc.name;
    //     });
    //     return map;
    // }, [accounts]);

    // const filteredTransactions = useMemo(() => {
    //     return transactions.filter(tx => {
    //         const matchesAccount = filterAccount ?
    //             (tx.sourceAccount === filterAccount || tx.destinationAccount === filterAccount) : true;
    //         const matchesCurrency = filterCurrency ?
    //             (tx.currency === filterCurrency) : true;
    //         const matchesSearch = searchTerm ?
    //             (tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 accountNamesMap[tx.sourceAccount]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 accountNamesMap[tx.destinationAccount]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 String(tx.amount).includes(searchTerm)) : true;
    //         return matchesAccount && matchesCurrency && matchesSearch;
    //     }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
    // }, [transactions, filterAccount, filterCurrency, searchTerm, accountNamesMap]);

    // const uniqueCurrencies = useMemo(() => [...new Set(accounts.map(acc => acc.currency))], [accounts]);

    return (
        <div className="bg-white py-6 md:px-6 px-2 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Transaction Log</h2>

            <Filters accounts={accounts} filterCurrency={currency} filterAccount={account_id} />

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions?.length > 0 ? transactions.map(tx => (
                            <tr key={tx.id} className={tx.isFutureDated ? 'bg-yellow-50 bg-opacity-70 text-gray-600 italic' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                        {tx.isFutureDated && <Calendar className="w-4 h-4 mr-2 text-yellow-500" />}
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{accountsMap[tx.source_account_id].name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{accountsMap[tx.destination_account_id].name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount, tx.destination_currency)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.note || '-'}</td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.isFutureDated ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {tx.isFutureDated ? 'Future-Dated' : 'Completed'}
                                    </span>
                                </td> */}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default TransactionLog;