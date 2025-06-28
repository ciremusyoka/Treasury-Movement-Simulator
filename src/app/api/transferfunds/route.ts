import { convert, rates } from "@/app/utills/convertion";
import pool from "../../utills/db";
import { randomUUID } from "crypto";
import { jsonResponse } from "@/app/utills/response";
import { isEmpty } from "@/app/utills";
import { NextResponse } from "next/server";

export type TransferFunds = {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    sourceCurrency: string,
    destinationCurrency: string,
}

export async function POST(req) {

    const body = await req.json();

    const {
        sourceAccountId,
        destinationAccountId,
        amount,
        sourceCurrency,
        destinationCurrency,
        note = "",
        transferDate
    } = body;

    const client = await pool.connect();

    try {

        if (
            isEmpty(sourceAccountId) ||
            isEmpty(destinationAccountId) ||
            isEmpty(amount) ||
            isEmpty(sourceCurrency) ||
            isEmpty(destinationCurrency)
        ) {
            return NextResponse.json({ data: "Required fields are missing" }, { status: 400 });
        }


        if (destinationAccountId === sourceAccountId) {
            return NextResponse.json({ data: "No internal transfer" }, { status: 400 })
        }
        await client.query('BEGIN');

        // Select and lock both accounts to prevent concurrent updates
        const res = await client.query(
            `SELECT id, available_balance
       FROM accounts
       WHERE id = ANY($1)
       ORDER BY id
       FOR UPDATE`,
            [[sourceAccountId, destinationAccountId]]
        );

        if (res.rowCount !== 2) {
            throw new Error('One or both accounts not found');
        }

        const sourceAccount = res.rows.find(row => row.id === sourceAccountId)
        if ((sourceAccount.available_balance - amount) < 1) {
            return NextResponse.json({ data: "Insufficient balance in source account for direct transfer" }, { status: 400 })
        }


        const converted_amount = convert(sourceCurrency, destinationCurrency, amount);
        const fxRate = rates[sourceCurrency][destinationCurrency]
        // Debit source account
        if (transferDate) {

            await client.query(
                `UPDATE accounts
                SET available_balance = available_balance - $1,
                future_total = future_total + $1
                WHERE id = $2`,
                [amount, sourceAccountId]
            );

        } else {
            await client.query(
                `UPDATE accounts
                SET available_balance = available_balance - $1,
                    actual_balance = available_balance - $1
                WHERE id = $2`,
                [amount, sourceAccountId]
            );

            await client.query(
                `UPDATE accounts
                SET available_balance = available_balance + $1,
                    actual_balance = available_balance + $1
                WHERE id = $2`,
                [converted_amount, destinationAccountId]
            );

        }



        // Credit destination account





        console.log("++++++++++++++++++++++++++222")

        const is_future_dated = transferDate ? true : false;

        //const future_date = transferDate ? transferDate : ;

        // Insert transaction record
        const id = randomUUID();
        await client.query(
            `INSERT INTO transactions (
            id, source_account_id, destination_account_id,
            amount, destination_currency, source_currency,
            fx_rate, converted_amount,note, is_future_dated, future_date, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11, CURRENT_TIMESTAMP)`,
            [
                id,
                sourceAccountId,
                destinationAccountId,
                amount,
                destinationCurrency,
                sourceCurrency,
                fxRate,
                converted_amount,
                note,
                is_future_dated,
                transferDate
            ]
        );
        await client.query('COMMIT');
        return NextResponse.json({ data: "successfuly created" }, { status: 201 });
    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ data: error }, { status: 500 });
    } finally {
        client.release();
    }
}