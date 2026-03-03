export default async ({ req, res, log, error }) => {
  try {
    // ခေါ်ဆိုမှု ရ၊ မရ စမ်းသပ်ရန်
    log("Request received!");
    
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { phoneNumber } = payload;

    const url = `https://apis.mytel.com.mm/myid/authen/v1.0/login/method/otp/get-otp?phoneNumber=${phoneNumber}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    log("Mytel Result: " + JSON.stringify(data));
    return res.json(data);
  } catch (err) {
    error("Error: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
