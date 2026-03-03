export default async ({ req, res, log, error }) => {
  const payload = JSON.parse(req.body);
  const { action, phoneNumber, otpCode } = payload;

  try {
    if (action === 'send') {
      // Mytel OTP Request URL
      const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      const data = await response.json();
      log("Mytel Response: " + JSON.stringify(data));
      return res.json(data);
    }

    if (action === 'verify') {
      const response = await fetch(`https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`, {
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
    error("API Error: " + err.message);
    return res.json({ errorCode: "500", message: err.message }, 500);
  }
};
