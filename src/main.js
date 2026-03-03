export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token } = payload;

  try {
    // ၁။ OTP တောင်းဆိုခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url);
      return res.json(await response.json());
    }

    // ၂။ Login Verification (SMS ပို့ရန် အဓိကကျသော နေရာ)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          deviceId: "OPPO_PDVM00_MTOM_STORE", // တကယ့်ဖုန်းပုံစံမျိုး ပြောင်းထားသည်
          osApp: "ANDROID",
          osVersion: "11",
          appVersion: "3.2.5", // Version အသစ်
          deviceName: "OPPO PDVM00"
        })
      });
      const data = await response.json();
      return res.json(data);
    }

    // ၃။ MB နှင့် Balance အမှန်များကို ဆွဲယူခြင်း
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`, // Token ပါမှ MB ပြမည်
          'Accept-Language': 'my' 
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
    return res.json({ error: err.message }, 500);
  }
};
