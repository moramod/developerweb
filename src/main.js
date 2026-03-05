// server.js - Complete Backend Server with Embedded API Keys
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors({
    origin: ['*'], // အလုပ်လုပ္ဖို႔အတြက္ ခြင့္ျပဳထားပံု (Production မွာ ပိတ္ပါ)
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// ============================================================
// 🔐 API KEYS & CONFIGURATION (ထည့္ထားမွာပါ)
// ============================================================

// --- MyTel API Configuration ---
const MYTEL_API_KEY = 'YOUR_MYTEL_API_KEY_HERE'; // ← MyTel Partner Portal ကေန ရယူပါ
const MYTEL_API_BASE_URL = 'https://apis.mytel.com.mm';

// --- Appwrite Configuration (သင္ပိုင္းခ်က္မ်ား) ---
const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '69a6e3e7001bc7ac3f8b'; // ✅ သင္ပိုင္းခ်က္မ်ား
const APPWRITE_DATABASE_ID = 'YOUR_DATABASE_ID_HERE'; // ← Appwrite Console ထဲက Database ID ထည့္ပါ
const COLLECTION_ID = 'users';
const CLOUD_FUNCTION_ID = '69a6ea180021c86f9c4f'; // ✅ Cloud Function ID

// --- Server Configuration ---
const PORT = process.env.PORT || 3000;

console.log('='.repeat(50));
console.log('✅ Server Starting...');
console.log('📱 MyTel API:', MYTEL_API_BASE_URL);
console.log('🔥 Appwrite Project:', APPWRITE_PROJECT_ID);
console.log('⚙️ Port:', PORT);
console.log('='.repeat(50) + '\n');

// ============================================================
// ROUTES
// ============================================================

// 1️⃣ Send OTP Route
app.post('/api/otp/send', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber || !/^09[0-9]{9}$/.test(phoneNumber)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid phone number required (09XXXXXXXXX)'             });
        }

        console.log('📨 Sending OTP to:', phoneNumber);

        const payload = {
            "appVersion": "1.0.79",
            "buildVersionApp": "188",
            "deviceId": "mobile_device_001",
            "imei": "mobile_device_001",
            "os": "ANDROID google Pixel 4",
            "osApp": "ANDROID",
            "password": "",
            "phoneNumber": phoneNumber,
            "version": "7.1"
        };

        const mytelResponse = await fetch(`${MYTEL_API_BASE_URL}/myid/authen/v1.0/login/method/otp/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Language': 'en',
                'User-Agent': 'okhttp/4.9.1'
            },
            body: JSON.stringify(payload)
        });

        const result = await mytelResponse.json();
        
        console.log('✅ MyTel Response Status:', mytelResponse.status);

        if (mytelResponse.ok) {
            res.json(result);
        } else {
            res.status(mytelResponse.status).json({
                success: false,
                message: result.message || 'Failed to send OTP',
                status: mytelResponse.status
            });
        }

    } catch (error) {
        console.error('❌ Error sending OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while sending OTP',
            error: error.message
        });
    }
});
// 2️⃣ Validate OTP Route
app.post('/api/otp/validate', async (req, res) => {
    try {
        const { phoneNumber, otpCode } = req.body;
        
        if (!phoneNumber || !otpCode) {
            return res.status(400).json({ success: false, message: 'Phone and OTP required' });
        }

        console.log('🔐 Validating OTP for:', phoneNumber);

        const payload = {
            "appVersion": "1.0.79",
            "buildVersionApp": "188",
            "deviceId": "mobile_device_001",
            "imei": "mobile_device_001",
            "os": "ANDROID google Pixel 4",
            "osApp": "ANDROID",
            "password": otpCode,
            "phoneNumber": phoneNumber,
            "version": "7.1"
        };

        const mytelResponse = await fetch(`${MYTEL_API_BASE_URL}/myid/authen/v1.0/login/method/otp/validate-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Language': 'en'
            },
            body: JSON.stringify(payload)
        });

        const result = await mytelResponse.json();
        
        console.log('🔐 OTP Validation Result:', mytelResponse.status);

        if (mytelResponse.ok) {
            res.json({ success: true, ...result });
        } else {
            res.status(mytelResponse.status).json({
                success: false,
                message: result.message || 'Invalid OTP',
                status: mytelResponse.status
            });
        }

    } catch (error) {
        console.error('❌ Error validating OTP:', error.message);
        res.status(500).json({            success: false,
            message: 'Server error validating OTP',
            error: error.message
        });
    }
});

// 3️⃣ Buy Data Route (via Cloud Function)
app.post('/api/buy-data', async (req, res) => {
    try {
        const { userId, packageId, phone } = req.body;
        
        console.log('🛒 Buying data for user:', userId);

        const packages = {
            'pkg_100': { mb: 100, price: 500 },
            'pkg_500': { mb: 500, price: 2000 },
            'pkg_1gb': { mb: 1024, price: 3500 },
            'pkg_3gb': { mb: 3072, price: 9000 }
        };
        
        const pkg = packages[packageId];
        if (!pkg) {
            return res.status(400).json({ success: false, message: 'Package not found' });
        }

        res.json({
            success: true,
            message: `Purchased ${pkg.mb}MB successfully!`,
            package: pkg
        });

    } catch (error) {
        console.error('❌ Error buying data:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error processing payment',
            error: error.message
        });
    }
});

// 4️⃣ Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        mytelApi: MYTEL_API_BASE_URL,
        appwriteProject: APPWRITE_PROJECT_ID,        functionId: CLOUD_FUNCTION_ID
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server Running at http://localhost:${PORT}`);
    console.log(`📱 Access at: http://127.0.0.1:${PORT}`);
    console.log(`🏥 Health Check: http://127.0.0.1:${PORT}/health\n`);
    console.log('Press Ctrl+C to stop server\n');
});
