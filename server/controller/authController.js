const User = require('../models/User.js')
const OTP = require('../models/OTP.js')
const bcrypt = require('bcryptjs')
const { sendOtpEmail } = require('../utils/email.js')
const jwt = require('jsonwebtoken')

const generateToken = (id, role) => {
    return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn:'7d'})
}

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            error: "User already exists"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({name,email,password,hashedPassword, role:'user', isVerified:false})

        const otp = Math.floor(1000000 + Math.random() * 9000000).toString();
        console.log(`Otp for ${email}: ${otp}  `)
        await OTP.create({ email, otp, action: "account_verification" });
        await sendOtpEmail(email, otp, 'account_verification')

        res.status(201).json({
              message: "User registered successfully. Please check your email for OTP to verify your account.",
              email:user.email
          });

    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}

// Login User 
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            error:"Invalid Credentials"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            error: "Invalid Credentials.Please Sign up first"
        });
    }

    if (!user.isVerified && user.role === 'user') {
        const otp = Math.floor(1000000 + Math.random() * 9000000).toString();
        await OTP.deleteMany({ email, action: 'account_verification' });
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOtpEmail(email, otp, 'account_verification');
        return res.status(400).json({
            error:"Account not verified. A new OTP has been sent to your email."
        })
    }

    res.json({
        message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token:generateToken(user._id,user.role)
    })
}

// verify OTP 
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });

    if (!otpRecord) {
        return res.status(400).json({
            error: "Invalid or expired OTP"
        });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, action: 'account_verification' });
    res.json({
        message: "Account verified successfully. You can now login",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token:generateToken(user._id,user.role)
    })
}