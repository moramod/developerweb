export default async ({ req, res, log, error }) => {
  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, phoneNumber, otpCode, token } = payload;

  const commonHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'okhttp/4.9.1',
    'Accept-Language': 'my',
    'Host': 'apis.mytel.com.mm'
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
          buildVersionApp: "281",
          deviceId: "f433d8978f20b862",
          imei: "f433d8978f20b862",
          os: "ANDROID OPPO PDVM00",
          osApp: "ANDROID",
          version: "11"
        })
      });
      const data = await response.json();
      log("Login Response: " + JSON.stringify(data));
      return res.json(data);
    }

    // ၃။ Profile Data (MB/Balance) ဆွဲယူခြင်း - ဤနေရာတွင် အဓိကပြင်ဆင်ထားသည်
    if (action === 'get_profile') {
      // MyID ရဲ့ သတ်မှတ်ထားသော API Path အမှန်
      const url = `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          ...commonHeaders,
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const result = await response.json();
      log("Profile Raw Response: " + JSON.stringify(result));

      // သင်ပေးထားတဲ့ Dashboard HTML နဲ့ ကိုက်ညီအောင် Data mapping လုပ်ခြင်း
      // MyID API response structure အပေါ်မူတည်၍ လိုအပ်သလို ပြောင်းလဲနိုင်သည်
      if (result.code === 200 || result.status === "SUCCESS") {
        return res.json({
          code: 200,
          ocsAccount: {
            balance: result.data?.mainBalance || "0",
            voice: result.data?.voiceBalance || "0",
            data: result.data?.dataBalance || "0" // HTML ထဲတွင် id="b-data" အတွက်
          }
        });
      } else {
        return res.json({ error: "Profile Not Found", code: 404 });
      }
    }

    return res.json({ message: "Invalid Action" }, 400);
  } catch (err) {
    error("Server Error: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
