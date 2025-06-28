'use client'

import { fetchAccountList, formatCurrency, InitialAccounts, } from "../app/utills/index";
import AccountSummaryModal from "./component/accountDetails";
import { useEffect, useState } from "react";
import LoadingSpinner from "./component/loading";


function AccountList() {
  const [accounts, setAccounts] = useState<InitialAccounts[]>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>();


  useEffect(() => {

    const fetchAccounts = async () => {
      setLoading(true)
      try {

        const data = await fetchAccountList('/');
        setAccounts(data)
      } catch (err: any) {

        setError("Internal server error")
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, []);





  if (error) return <div>{error}</div>;

  return (
    <>
      {loading ? <LoadingSpinner /> : (
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-6 rounded-lg shadow-xl mb-6">
          <h2 className="text-3xl font-extrabold mb-5 text-center tracking-tight"> Accounts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {accounts?.length > 0 ? accounts.map(account => (
              <div key={account.id} className="bg-white bg-opacity-10 p-5 rounded-lg border border-blue-400 border-opacity-30 backdrop-blur-sm shadow-md transition-transform transform hover:scale-105 hover:shadow-lg">
                <p className="text-sm font-semibold text-blue-500 ">{account.name}
                  <span className="text-xs pl-2 text-gray-900">({account.currency})</span>
                </p>
                <p className="text-sm md:text-base font-bold mt-2 text-gray-900">{formatCurrency(account.available_balance, account.currency)}</p>
                <AccountSummaryModal account={account} />
              </div>
            )) : (
              <p className="text-center text-blue-200 col-span-full">No accounts loaded.</p>
            )}
          </div>
        </div>
      )

      }
    </>
  )
};

export default AccountList;