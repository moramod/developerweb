export default async ({ req, res, log, error }) => {

  try {

    const payload =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { action, phoneNumber, otpCode, token, packageCode } = payload;

    if (!action) {
      return res.json({ error: "Missing action" }, 400);
    }

    const commonHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "okhttp/4.9.1",
      "Accept-Encoding": "gzip",
      "Host": "apis.mytel.com.mm"
    };

    const safeJson = async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    };

    /* ================= SEND OTP ================= */

    if (action === "send") {

      if (!phoneNumber) {
        return res.json({ error: "Phone required" }, 400);
      }

      const url =
        `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;

      const response = await fetch(url, {
        method: "GET",
        headers: commonHeaders
      });

      const data = await safeJson(response);
      return res.json(data);
    }

    /* ================= VERIFY ================= */

    if (action === "verify") {

      if (!phoneNumber || !otpCode) {
        return res.json({ error: "Phone and OTP required" }, 400);
      }

      const url =
        `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/validate-otp`;

      const response = await fetch(url, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({
          phoneNumber,
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

      const data = await safeJson(response);
      log("Login Response: " + JSON.stringify(data));

      return res.json(data);
    }

    /* ================= PROFILE ================= */

    if (action === "get_profile") {

      if (!phoneNumber || !token) {
        return res.json({ error: "Phone and token required" }, 400);
      }

      const url =
        `https://apis.mytel.com.mm/myid/api/v1.0/user/profile-info?msisdn=${phoneNumber}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${token}`
        }
      });

      const result = await safeJson(response);

      return res.json({
        ocsAccount: {
          balance: result?.data?.mainBalance || "0",
          voice: result?.data?.voiceBalance || "0",
          data: result?.data?.dataBalance || "0"
        }
      });
    }

    /* ================= BUY PACKAGE ================= */

    if (action === "buy_package") {

      if (!phoneNumber || !token || !packageCode) {
        return res.json({ error: "Missing fields" }, 400);
      }

      const formattedMsisdn =
        phoneNumber.startsWith("+")
          ? phoneNumber
          : `+95${phoneNumber.replace(/^0/, "")}`;

      const url =
        `https://apis.mytel.com.mm/csm/v1.0/api/vas-package/${packageCode}/register`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          msisdn: formattedMsisdn,
          isRenew: false
        })
      });

      const data = await safeJson(response);
      return res.json(data);
    }

    return res.json({ error: "Invalid action" }, 400);

  } catch (err) {
    error("Server Error: " + err.message);
    return res.json({ error: "Internal Server Error" }, 500);
  }
};
