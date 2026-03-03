export default async ({ req, res, log, error }) => {
  // Frontend မှ ပေးပို့လိုက်သော Data ကို JSON အဖြစ်ပြောင်းလဲခြင်း
  const payload = JSON.parse(req.body);
  const { action, phoneNumber, otpCode } = payload;

  try {
    // ၁။ OTP ပို့ရန် (Action: send)
    if (action === 'send') {
      const sendUrl = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(sendUrl);
      const data = await response.json();
      return res.json(data);
    }

    // ၂။ Login ဝင်ရန် OTP စစ်ဆေးခြင်း (Action: verify)
    if (action === 'verify') {
      const validateUrl = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(validateUrl, {
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
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    error("Server Error: " + err.message);
    return res.json({ errorCode: "500", message: "Server connection failed" }, 500);
  }
};
