require('dotenv').config();
const ngrok = require('ngrok');
const axios = require('axios');

(async function() {
    try {
        const url = await ngrok.connect(5000); // Ensure this matches your server port
        console.log(`Ngrok tunnel started: ${url}`);

        // Wait a few seconds to ensure the server is ready
        await new Promise(resolve => setTimeout(resolve, 5000));  

        console.log(`Updating webhook with: ${url}/api/payments/receive-hook`);

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
