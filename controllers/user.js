const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Token = require("../models/token");
const BondLotto = require("../models/bondLotto");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  //Validate email
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    res.status(400);
    throw new Error("Email has already been register");
  }

  const user = await User.create({ name, email, password });

  if (user) {
    // Generate token
    const jwtToken = generateToken(user._id);

    res.cookie("token", jwtToken, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    //generate verification code and hash it
    const verificationCode = generateString(7);
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(verificationCode, salt);

    //find and remove old token
    let oldToken = await Token.findOne({ userId: user._id });

    if (oldToken) {
      await oldToken.deleteOne();
    }

    // create new token
    const newToken = await new Token({
      userId: user._id,
      token: hashedCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * (60 * 1000),
    }).save();

    const message = `
         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">
        <div style="background-color: #FF5D2E; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0;">Welcome!</h1>
        </div>
        <div style="padding: 20px;">
            <p style="text-transform: capitalize;">Hi <strong>${user.name}</strong>,</p>
            <p> Please use the following verification code to complete your sign-up process:</p>
            <p style="font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0;">${verificationCode}</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Best regards,<br>Secure Auth</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; color: #777777;">
            <p style="margin: 0;">&copy; 2024 Secure Auth. All rights reserved.</p>
        </div>
    </div>
</body>`;

    const subject = "Verify your Email";
    const send_to = email;
    const send_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, send_from);
      res
        .status(201)
        .json({ user, msg: "Email has been sent", verificationCode, newToken });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent , Please try Again.");
    }
  } else {
    res.status(400);
    throw new Error("Unable to register account, Please try again.");
  }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  //Validate user
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User does not exist, Please sign up.");
  }

  //Validate password
  const checkPassword = await bcrypt.compare(password, user.password);

  if (user && checkPassword) {
    // Generate token
    const jwtToken = generateToken(user._id);

    res.cookie("token", jwtToken, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    const verificationCode = generateString(7);
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(verificationCode, salt);

    //find and remove old token
    let oldToken = await Token.findOne({ userId: user._id });

    if (oldToken) {
      await oldToken.deleteOne();
    }
    // create new token
    const newToken = await new Token({
      userId: user._id,
      token: hashedCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * (60 * 1000),
    }).save();

    const message = `
         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">
        <div style="background-color: #FF5D2E; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0;">Welcome!</h1>
        </div>
        <div style="padding: 20px;">
            <p style="text-transform: capitalize;">Hi <strong>${user.name}</strong>,</p>
            <p> Please use the following verification code to complete your sign-up process:</p>
            <p style="font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0;">${verificationCode}</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Best regards,<br>Secure Auth</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; color: #777777;">
            <p style="margin: 0;">&copy; 2024 Secure Auth. All rights reserved.</p>
        </div>
    </div>
</body>`;
    const subject = "Verify your Email";
    const send_to = email;
    const send_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, send_from);
      res
        .status(201)
        .json({ newToken, msg: "Email has been sent", verificationCode });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent , Please try Again.");
    }
  } else {
    res.status(400);
    throw new Error("Invalid email or password.");
  }
});

// resend
const resend = asyncHandler(async (req, res) => {
  const user = req.user;

  //Validate user
  if (!user) {
    res.status(400);
    throw new Error("User does not exist, Please sign up.");
  }

  if (user) {
    // Generate token
    const jwtToken = generateToken(user._id);

    res.cookie("token", jwtToken, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    const verificationCode = generateString(7);
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(verificationCode, salt);

    //find and remove old token
    let oldToken = await Token.findOne({ userId: user._id });

    if (oldToken) {
      await oldToken.deleteOne();
    }
    // create new token
    const newToken = await new Token({
      userId: user._id,
      token: hashedCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * (60 * 1000),
    }).save();

    const message = `
         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px; overflow: hidden;">
                <div style="background-color: #FF5D2E; padding: 20px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0;">Verification Code</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>Please use the following verification code to complete your sign-in process:</p>
                    <p style="font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0;">${verificationCode}</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Best regards,<br>Secure Auth</p>
                </div>
                <div style="background-color: #f4f4f4; padding: 10px; text-align: center; color: #777777;">
                    <p style="margin: 0;">&copy; 2024 Secure Auth. All rights reserved.</p>
                </div>
            </div>
        </body>`;
    const subject = "Verify your Email";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, send_from);
      res
        .status(201)
        .json({ newToken, msg: "Email has been sent", verificationCode });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent , Please try Again.");
    }
  } else {
    res.status(400);
    throw new Error("Invalid email or password.");
  }
});

//validate email
const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Please enter verification code");
  }

  const userToken = await Token.findOne({
    userId: req.user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Token has expired.");
  }

  //Validate password
  const checkCode = await bcrypt.compare(code, userToken.token);

  if (!checkCode) {
    res.status(404);
    throw new Error("Invalid Token");
  }

  res.status(200).json("Token validated successfully, login");
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  //Valid Request
  if (!email) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  //Check if user exist
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const tokenDoc = await Token.findOneAndUpdate(
    { userId: user._id },
    {
      resetToken: hashToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * (60 * 1000),
    },
    { new: true } // Return the updated document
  );

  // await new Token({
  //   userId: user._id,
  //   token: verificationCode,
  //   createdAt: Date.now(),
  //   expiresAt: Date.now() + 30 * (60 * 1000),
  // }).save();

  const reset_link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = ` 
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <h2 style="color: #333333; margin: 0;">Reset Your Password</h2>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 20px; color: #333333;">
                      <p style="margin: 0 0 20px;">Hello, ${user.name}</p>
                      <p style="margin: 0 0 20px;">We received a request to reset your password. Click the button below to reset it:</p>
                      <p style="text-align: center;">
                          <a href=${reset_link} target="_blank" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #FF5D2E; border-radius: 5px; text-decoration: none;">Reset Password</a>
                      </p>
                      <p style="margin: 20px 0 0;">If you didn't request a password reset, please ignore this email or contact support if you have questions.</p>
                      <p style="margin: 0;">Thank you,</p>
                      <p style="margin: 0;">The SecureAuth Team</p>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 20px 0; color: #999999; font-size: 12px;">
                      <p style="margin: 0;">[Your Company] | [Your Address]</p>
                      <p style="margin: 0;"><a href="[unsubscribe_link]" style="color: #999999; text-decoration: none;">Unsubscribe</a></p>
                  </td>
              </tr>
          </table>
  </body>`;

  const subject = "Forgot Password";
  const send_to = email;
  const send_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, send_from);
    res.status(201).json({
      tokenDoc,
      hashToken,
      resetToken,
      resetLink: reset_link,
      msg: "Email has been sent",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent , Please try Again.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const tokenDoc = await Token.findOne({
    resetToken: hashToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const updatedUserDoc = await User.findByIdAndUpdate(
    tokenDoc.userId,
    {
      password: hashedPassword,
    },
    { new: true } // Return the updated document
  );

  res.status(201).json(updatedUserDoc);
});

//get user
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//logout
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    //   sameSite: "none",
    //   secure: true,
  });

  res.status(200).json("Successfully Logged Out");
});

// BONDLOTTO API

//Create user bond lotto account
const createBondLottoAccount = asyncHandler(async (req, res) => {
  const bondLottoDoc = await BondLotto.create({ user: req.user._id });

  res.status(200).json(bondLottoDoc);
});

//genrate investment code
const generateInvestmentCode = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (amount < 1000) {
    res.status(400);
    throw new Error("Investment must be above 1000 naira");
  }

  const numberOfCode = amount / 1000;

  // Array to store the generated unique IDs
  const codes = [];

  // Iterate over the set number to generate unique IDs
  for (let i = 0; i < numberOfCode; i++) {
    const uniqueId = generateUniqueId();
    codes.push({ index: i + 1, lotto_code: uniqueId });
  }

  res.status(200).json({ amount, numberOfCode, codes });
});

//get user bond lotto account
const getBondLottoAccount = asyncHandler(async (req, res) => {
  const bondLottoDoc = await BondLotto.find({ user: req.user._id }).populate(
    "user"
  );

  res.status(200).json(bondLottoDoc);
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  createBondLottoAccount,
  generateInvestmentCode,
  getBondLottoAccount,
  getUser,
  forgetPassword,
  resetPassword,
  logout,
  resend,
};
