import axios from "axios";

export interface InitialAccounts {
    id: string;
    name: string;
    currency: string;
    available_balance: number;
    actual_balance?: number
    future_total?: number

};






// Helper function to format numbers to currency
export const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export const currency: string[] = ["KES", "USD", "NGN"]


export const fetchAccountList = async (base_url: string) => {
    try {
        const response = await axios.get(`${base_url}api/accounts`);
        return response.data.data;
    } catch (err) {
        throw (err)
    }
}

export function isEmpty(value: string | number) {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}