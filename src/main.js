export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token } = payload;

  // MyID Official Headers (ဒီ Key တွေက အရေးကြီးပါတယ်)
  const myidHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'your-app-static-api-key-here', // ဒီနေရာမှာ MyID ရဲ့ Public Key လိုအပ်နိုင်ပါတယ်
    'User-Agent': 'okhttp/4.9.1',
    'Accept-Language': 'my-MM',
    'X-OS-TYPE': 'ANDROID',
    'X-APP-VERSION': '3.2.5'
  };

  try {
    // ၁။ OTP ပို့ခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url, { headers: myidHeaders });
      return res.json(await response.json());
    }

    // ၂။ Login Verification
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: myidHeaders,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode,
          deviceId: "f07a" + Math.random().toString(16).slice(2, 10),
          deviceName: "OPPO PDVM00",
          osApp: "ANDROID",
          appVersion: "3.2.5"
        })
      });
      const data = await response.json();
      return res.json(data);
    }

    // ၃။ Profile (MB) ဆွဲယူခြင်း - ဒီနေရာမှာ Token Header ထည့်ရမှာပါ
    if (action === 'get_profile') {
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      const response = await fetch(url, {
        headers: { 
          ...myidHeaders,
          'Authorization': `Bearer ${token}` // Token အမှန်ပါမှ MB တက်ပါလိမ့်မယ်
        }
      });
      const result = await response.json();
      
      // API Result ကို Log ထုတ်ကြည့်ပါ (ဘာပြန်လာလဲ သိရအောင်)
      log(JSON.stringify(result));

      return res.json({
        balance: result.data?.mainBalance || "0",
        voice: result.data?.voiceBalance || "0",
        dataMB: result.data?.dataBalance || "0",
        fullResponse: result // Error ရှာဖို့အတွက် response အပြည့်ထည့်ပေးထားပါတယ်
      });
    }
  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
