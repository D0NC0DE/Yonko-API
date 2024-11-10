function calculateFee(price) {
    const decimalFee = 0.015;           // 1.5% fee
    const flatFee = 100 * 100;          // Flat fee of 100 Naira in kobo
    const feeCap = 2000 * 100;          // Maximum cap for fees in kobo
    let applicableFee;
    let finalAmount;

    // Calculate applicable fee based on price threshold
    if (price < 2500 * 100) {
        applicableFee = price * decimalFee; // Only percentage fee
    } else {
        applicableFee = (price * decimalFee) + flatFee; // Percentage fee + flat fee
    }

    // Apply fee cap if applicable
    if (applicableFee > feeCap) {
        finalAmount = price + feeCap;
    } else if (price < 2500 * 100) {
        // Below 2500 Naira: calculate final amount with percentage fee only
        finalAmount = Math.round(price / (1 - decimalFee)) + 1;
    } else {
        // 2500 Naira and above: calculate final amount with both fees
        finalAmount = Math.round((price + flatFee) / (1 - decimalFee)) + 1;
    }

    // Calculate service fee as the difference between final amount and original price
    const serviceFee = finalAmount - price;
    
    return {
        finalAmount: finalAmount,  // Final amount to charge (in kobo)
        serviceFee: serviceFee     // Total fee applied (in kobo)
    };
}

// Export the function
module.exports = calculateFee;
