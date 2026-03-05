// server.js
require('dotenv').config(); // .env ဖိုင်ကို ဖတ်မယ်
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// --- ⚠️ API Keys & Configuration (from .env) ---
const MYTEL_API_BASE = process.env.MYTEL_API_URL || 'https://apis.mytel.com.mm';
const APP_VERSION = process.env.APP_VERSION || '1.0.79';
const BUILD_VERSION = process.env.BUILD_VERSION || '188';
const VERSION_OS = process.env.OS_VERSION || '7.1';
const OS_TYPE = process.env.OS_TYPE || 'ANDROID google Pixel 4';
const DEVICE_ID = process.env.DEVICE_ID || 'b40c086522809d13';

// --- Route: Validate OTP (MyTel API Call) ---
app.post('/myid/authen/v1.0/login/method/otp/validate-otp', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        
        if (!phoneNumber || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number and OTP required' 
            });
        }

        // Prepare Request Body
        const requestBody = {
            "appVersion": APP_VERSION,
            "buildVersionApp": BUILD_VERSION,
            "deviceId": DEVICE_ID,
            "imei": DEVICE_ID,
            "os": OS_TYPE,
            "osApp": "ANDROID",
            "password": password,      // ✅ This is your OTP!
            "phoneNumber": phoneNumber,
            "version": VERSION_OS
        };

        console.log('🔐 Sending OTP Validation to MyTel API...');

        // Call MyTel API
        const mytelResponse = await fetch(`${MYTEL_API_BASE}/myid/authen/v1.0/login/method/otp/validate-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',                'Accept-Language': 'en',
                'User-Agent': 'okhttp/4.9.1'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await mytelResponse.json();

        console.log('✅ MyTel Response:', result);

        // Return the API response to frontend
        res.status(mytelResponse.status).json(result);

    } catch (error) {
        console.error('❌ Error validating OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'OTP validation failed: ' + error.message
        });
    }
});

// Route: Send OTP (Optional - if you need to send first)
app.post('/myid/authen/v1.0/login/method/otp/send', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        const requestBody = {
            "appVersion": APP_VERSION,
            "buildVersionApp": BUILD_VERSION,
            "deviceId": DEVICE_ID,
            "imei": DEVICE_ID,
            "os": OS_TYPE,
            "osApp": "ANDROID",
            "phoneNumber": phoneNumber,
            "version": VERSION_OS
        };

        const mytelResponse = await fetch(`${MYTEL_API_BASE}/myid/authen/v1.0/login/method/otp/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Language': 'en'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await mytelResponse.json();
        res.status(mytelResponse.status).json(result);
    } catch (error) {
        console.error('❌ Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', version: '1.0.0' });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Using MyTel API Base: ${MYTEL_API_BASE}`);
});
