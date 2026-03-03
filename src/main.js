export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token } = payload;

  const commonHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'okhttp/4.9.1',
    'Accept-Language': 'my'
  };

  try {
    // ၁။ OTP တောင်းဆိုခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url, { headers: commonHeaders });
      return res.json(await response.json());
    }

    // ၂။ Login Verification
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          appVersion: "2.0.14",
          deviceId: "f433d8978f20b862",
          osApp: "ANDROID"
        })
      });
      const data = await response.json();
      return res.json(data);
    }

    // ၃။ Profile Data (MB/Balance) ဆွဲယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          ...commonHeaders,
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();
      
      // Dashboard UI နှင့် ကိုက်ညီအောင် ဖွဲ့စည်းပုံ ပြောင်းလဲပေးခြင်း
      return res.json({
        ocsAccount: {
          balance: result.data?.mainBalance || "0",
          voice: result.data?.voiceBalance || "0",
          data: result.data?.dataBalance || "0"
        }
      });
    }

    return res.json({ message: "Invalid Action" }, 400);
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }
};
