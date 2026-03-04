export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token, packageCode } = payload;

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

    // ၂။ Login အတည်ပြုခြင်း (Message ကျလာစေရန် Device Info ထည့်ထားသည်)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          appVersion: "2.0.14",
          buildVersionApp: "281",
          deviceId: "f433d8978f20b862",
          imei: "f433d8978f20b862",
          os: "ANDROID OPPO PDVM00", // သင်ပြထားသော Device Model
          osApp: "ANDROID",
          version: "11" // သင်ပြထားသော Version
        })
      });
      const data = await response.json();
      log("Login Response: " + JSON.stringify(data));
      return res.json(data);
    }

    // ၃။ Profile (MB/Balance) အချက်အလက်ယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { ...commonHeaders, 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      return res.json({
        ocsAccount: {
          balance: result.data?.mainBalance || "0",
          voice: result.data?.voiceBalance || "0",
          data: result.data?.dataBalance || "0"
        }
      });
    }

    // ၄။ Package ဝယ်ယူခြင်း (GG3, S91 စသည်ဖြင့်)
    if (action === 'buy_package') {
      const url = `https://apis.mytel.com.mm/csm/v1.0/api/vas-package/${packageCode}/register`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...commonHeaders, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          msisdn: phoneNumber.startsWith('+') ? phoneNumber : `+95${phoneNumber.replace(/^0/, '')}`,
          isRenew: false
        })
      });
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
