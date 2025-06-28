import {  Calendar } from 'lucide-react';
import { fetchAccountList, formatCurrency } from "../utills";
import axios from 'axios';
import { Filters } from './filters';
import LoadingSpinner from '../component/loading';

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
    let loading = true



    if (currency) {
        queryParams = `currency=${currency}`
        // console.log("queryParams:::=> 1", queryParams);
    }

    if (account_id) {
        const query = `account_id=${account_id}`
        if (queryParams) {
            queryParams = `${queryParams}&${query}`
            // console.log("queryParams:::=> 2", queryParams);
        } else {
            queryParams = `${query}`
            // console.log("queryParams:::=> 3", queryParams);
        }
    }

    if (queryParams) {
        url = `${url}?${queryParams}`
        // console.log("queryParams:::=> 4", url);
    }
    let transactions = []
    let error = ''


    try {
        transactions = await getAllTransferLogs(url);
    } catch (e) {
        error = JSON.stringify(e)
    } finally {
        loading = false
    }

    const fetchAccounts = async () => {
        try {

            return await fetchAccountList(base_url);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                // console.log('Unexpected error:', error);
                error = "Internal server error"
            } else {
                // console.log('Unexpected error:', err);
                error = "Internal server error"
            }
        } finally {
            loading = false
        }

    }
    const accounts = await fetchAccounts();

    if (error) return <div>{error}</div>;

    const accountsMap = {}
    accounts.forEach(acc => accountsMap[acc.id] = acc);



    return (
        <div className="bg-white py-6 md:px-6 px-2 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Transaction Log</h2>

            <Filters accounts={accounts} filterCurrency={currency} filterAccount={account_id} />
            {loading ? <LoadingSpinner /> : (
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
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};


export default TransactionLog;