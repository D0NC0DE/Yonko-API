const https = require('https');
const { PAYSTACK_SECRET_KEY } = require('../config/config');
const { ErrorHandler } = require('../utils/errorHandler');

// Initialize payment
exports.initializePayment = (email, amount) => {
  return new Promise((resolve, reject) => {
    const params = JSON.stringify({
      "email": email,
      "amount": amount * 100
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (!response.status) {
            const statusCode = res.statusCode || 400;
            reject(new ErrorHandler(statusCode, response.message, response.data));
          } else {
            resolve(response.data);
          }
        } catch (error) {
          reject(new ErrorHandler(500, 'Failed to parse response from Paystack', error));

        }
      });

    });

    req.on('error', (error) => {
      reject(new ErrorHandler(500, 'Request to Paystack failed', error));
    });

    req.write(params);
    req.end();
  });
};

