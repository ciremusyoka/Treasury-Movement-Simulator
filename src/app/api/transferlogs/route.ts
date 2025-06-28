import { NextResponse } from "next/server";
import pool from "../../utills/db";

// Get all accounts
export async function GET(res: any) {
    const { searchParams } = new URL(res.url);
    const accountNumber = searchParams.get('account_id');
    const currency = searchParams.get('currency');

    try {
        let whereClause = "WHERE is_future_dated = FALSE"

        if (currency) {
            whereClause = `${whereClause} AND destination_currency = '${currency}'`
        }

        if (accountNumber) {
            whereClause = `${whereClause} AND destination_account_id = '${accountNumber}'`
        }

        const query = `SELECT * FROM transactions ${whereClause}`

        const result = await pool.query(query);
        return NextResponse.json({ data: result.rows });
    } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json({ data: 'Internal Server Error' }, { status: 500 });
    }
}