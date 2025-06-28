
"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NavBar = () => {
    const pathname = usePathname()
    return (
        <header className="bg-white shadow-sm py-4 mb-6 sticky top-0 z-10 border-b border-gray-200">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center md:justify-between">
                    <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight mb-4 md:mb-0">TreasuryFlow</h1>
                    <div className="flex space-x-4">
                        <Link href="/"

                            className={`px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${pathname === '/'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Accounts
                        </Link>
                        <Link href="/transferfunds"

                            className={`px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${pathname === '/transferfunds'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Transfer Funds
                        </Link>
                        <Link href="/transferlogs"

                            className={`px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${pathname === '/transferlogs'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Transfer Logs
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default NavBar;
