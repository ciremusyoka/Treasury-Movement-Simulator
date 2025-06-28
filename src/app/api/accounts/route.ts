import { NextResponse } from "next/server";
import pool from "../../utills/db";

// Get all accounts
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM accounts');
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ data: 'Internal Server Error' }, { status: 500 });
  }
}