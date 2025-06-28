
export const rates = {

    USD: {
        KES: 130,
        NGN: 1544

    },
    KES: {
        USD: 1 / 130,
        NGN: 1 / 12

    },

    NGN: {
        USD: 1 / 1544,
        KES: 12
    }

}


export const convert = (from: string, to: string, amount: number) => {
    if (from === to) {
        return amount
    }
    const rate = rates[from][to]
    return Number((rate * amount).toFixed(2))
}