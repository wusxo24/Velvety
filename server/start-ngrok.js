require('dotenv').config();
const ngrok = require('ngrok');
const axios = require('axios');

(async function() {
    try {
        const url = await ngrok.connect(3000); // Adjust port if needed
        console.log(`Ngrok tunnel started: ${url}`);

        // Automatically update the PayOS webhook
        const response = await axios.post('https://api-merchant.payos.vn/confirm-webhook', {
            webhookUrl: `${url}/api/payments/receive-hook`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.PAYOS_CLIENT_ID, 
                'x-api-key': process.env.PAYOS_API_KEY
            }
        });

        console.log('✅ Webhook URL updated successfully!', response.data);
    } catch (error) {
        console.error('❌ Failed to update webhook:', error.response?.data || error.message);
    }
})();