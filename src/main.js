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

    // ၂။ Login Verification (သင်ပေးပို့သော Data Structure အတိုင်း ပြင်ထားသည်)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode, // သင်ပို့ပေးသော password နေရာတွင် OTP ထည့်မည်
          appVersion: "2.0.14",
          buildVersionApp: "281",
          deviceId: "f433d8978f20b862",
          imei: "f433d8978f20b862",
          os: "ANDROID OPPO PDVM00",
          osApp: "ANDROID",
          version: "11"
        })
      });
      const data = await response.json();
      log("Mytel Response: " + JSON.stringify(data));
      return res.json(data);
    }

    // ၃။ Profile Data (MB/Balance) ဆွဲယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { 
          ...commonHeaders,
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();
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
