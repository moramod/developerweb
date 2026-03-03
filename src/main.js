export default async ({ req, res, log, error }) => {
  // Request Body ကို ယူခြင်း
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode } = payload;

  log(`Action received: ${action} for ${phoneNumber}`);

  try {
    // ၁။ OTP ပို့ရန် တောင်းဆိုခြင်း
    if (action === 'send') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    }

    // ၂။ Login ဝင်ရန် (OTP စစ်ဆေးရန်)
    if (action === 'verify') {
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          password: otpCode, // OTP ကုဒ်ကို password အနေနဲ့ ပို့ရပါသည်
          deviceId: "MTom_Store_" + phoneNumber,
          osApp: "ANDROID",
          appVersion: "1.0.96"
        })
      });
      const data = await response.json();
      return res.json(data);
    }

    return res.json({ message: "Invalid action" }, 400);

  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
