const https = require('https');
const { PAYSTACK_SECRET_KEY } = require('../config/config');
const { ErrorHandler } = require('../utils/errorHandler');
const crypto = require('crypto');
const axios = require('axios');

// Initialize payment
exports.initializePayment = async (email, amount) => {
  try {
    const params = {
      email: email,
      amount: amount // Paystack requires amount in kobo
    };

    const response = await axios.post('https://api.paystack.co/transaction/initialize', params, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.status) {
      throw new ErrorHandler(response.status || 400, response.data.message, response.data.data);
    }

    return response.data.data;
  } catch (error) {
    if (error.response) {
      // Error from Paystack API
      throw new ErrorHandler(error.response.status || 500, error.response.data.message, error.response.data.data);
    } else {
      // General request error
      throw new ErrorHandler(500, 'Request to Paystack failed', error);
    }
  }
};


// Verify payment function
exports.getVerifyPayment = async (reference) => {
  try {
    const paystackSecretKey = PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      throw new ErrorHandler(500, 'Paystack secret key is not found');
    }

    // Send GET request to verify the transaction
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      }
    });

    // Check the status of the response
    if (!response.data.status) {
      throw new ErrorHandler(response.status || 400, response.data.message, response.data.data);
    }

    // Map Paystack statuses to your internal statuses
    const statusMap = {
      success: 'VERIFIED',
      abandoned: 'ABANDONED',
      failed: 'FAILED',
      reversed: 'REVERSED',
      pending: 'PENDING',
      ongoing: 'PENDING',
      processing: 'PENDING',
      queued: 'PENDING',
    };

    const paymentStatus = statusMap[response.data.data.status] || 'UNKNOWN';

    // Filter the required data
    const filteredData = {
      amount: response.data.data.amount,
      gateway_response: response.data.data.gateway_response,
      channel: response.data.data.channel,
      ip_address: response.data.data.ip_address,
      fees: response.data.data.fees,
      authorization: response.data.data.authorization,
      customer: response.data.data.customer,
      transaction_id: response.data.data.id,
      status: paymentStatus, // Use mapped status
      reference: response.data.data.reference,
      paid_at: response.data.data.paid_at,
      created_at: response.data.data.created_at,
    };

    // Return the filtered data
    return filteredData;
    
  } catch (error) {
    if (error.response) {
      // Handle errors from Paystack API
      throw new ErrorHandler(error.response.status, error.response.data.message, error.response.data.data);
    } else {
      // Handle other errors (network issues, etc.)
      throw new ErrorHandler(500, 'Request to Paystack failed', error);
    }
  }
};

// ====== TODO: Implement the Webhook Method ====== //

// const secret = PAYSTACK_SECRET_KEY;
// const webhookUrl = "https://webhook.site/0715af72-8101-4e93-8c11-945a7dc239db";

// app.post(webhookUrl, function(req, res) {
//     //validate event
//     const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
//     if (hash == req.headers['x-paystack-signature']) {
//     // Retrieve the request's body
//     const event = req.body;
//     // Do something with event  
//     }
//     res.send(200);
// });

