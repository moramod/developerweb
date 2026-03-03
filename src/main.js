export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token } = payload;

  const commonHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'okhttp/4.9.1', // Android App အစစ်သုံးသော Agent
    'Accept-Language': 'my-MM'
  };

  try {
    // ၁။ OTP တောင်းဆိုခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url, { headers: commonHeaders });
      return res.json(await response.json());
    }

    // ၂။ Login Verification (ဖုန်းအစစ်အဖြစ် သတ်မှတ်စေမည့်အပိုင်း)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          deviceId: "f07a" + Math.random().toString(16).slice(2, 14), // Random Device ID
          deviceName: "OPPO PDVM00",
          osApp: "ANDROID",
          osVersion: "11",
          appVersion: "3.2.5",
          isRoot: false,
          isEmulator: false
        })
      });
      return res.json(await response.json());
    }

    // ၃။ MB နှင့် Balance အမှန်များကို ဆွဲယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { 
          ...commonHeaders,
          'Authorization': `Bearer ${token}` // Token ပါမှ MB အမှန်ပြမည်
        }
      });
      const result = await response.json();
      return res.json({
        balance: result.data?.mainBalance || "0",
        voice: result.data?.voiceBalance || "0",
        dataMB: result.data?.dataBalance || "0"
      });
    }
  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
