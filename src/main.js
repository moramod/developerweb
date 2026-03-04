export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token, packageCode } = payload;

  const commonHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'okhttp/4.9.1',
    'Accept-Language': 'my'
  };

  try {
    // ၁။ OTP တောင်းခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url, { headers: commonHeaders });
      return res.json(await response.json());
    }

    // ၂။ Login Verify လုပ်ခြင်း
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber, password: otpCode,
          appVersion: "2.0.14", deviceId: "f433d8978f20b862", osApp: "ANDROID"
        })
      });
      return res.json(await response.json());
    }

    // ၃။ Profile Data ဆွဲခြင်း
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

    // ၄။ Package ဝယ်ခြင်း (GG3, S91 စသည်ဖြင့် Dynamic ဝယ်ယူနိုင်သည်)
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
    return res.json({ error: err.message }, 500);
  }
};
