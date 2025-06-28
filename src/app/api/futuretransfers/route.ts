import { NextResponse } from "next/server";
import pool from "../../utills/db";

// Get all accounts
export async function GET(res) {
    const { searchParams } = new URL(res.url);
    const accountNumber = searchParams.get('account_id');

    try {
        let whereClause = "WHERE is_future_dated = TRUE"

        if (accountNumber) {
            whereClause = `${whereClause} AND source_account_id = '${accountNumber}'`
        }

        const query = `SELECT * FROM transactions ${whereClause}`

        const result = await pool.query(query);
        return NextResponse.json({ data: result.rows });
    } catch (error) {
        return NextResponse.json({ data: 'Internal Server Error' }, { status: 500 });
    }
}