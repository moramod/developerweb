export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode } = payload;

  try {
    // ၁။ OTP ပို့ခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url);
      return res.json(await response.json());
    }

    // ၂။ OTP စစ်ဆေးခြင်း (Login)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          deviceId: "MTom_Store_" + phoneNumber,
          osApp: "ANDROID",
          appVersion: "1.0.96"
        })
      });
      return res.json(await response.json());
    }

    // ၃။ Profile Data (MB/Balance) ဆွဲယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'my' }
      });
      const result = await response.json();
      
      // Variable Name များကို UI နှင့် ကိုက်ညီအောင် ပြန်ပို့ပေးခြင်း
      return res.json({
        balance: result.data?.mainBalance || "0",
        voice: result.data?.voiceBalance || "0",
        dataMB: result.data?.dataBalance || "0"
      });
    }

    return res.json({ message: "Invalid Action" }, 400);
  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
