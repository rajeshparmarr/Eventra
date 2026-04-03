const User = require('../models/User.js')

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    let userExists = await User.findOne(email);
    if (userExists) {
        return res.status(400).json({
            error: "User already exists"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({
            message:"User registered successfully"
        })

        const otp = Math.floor(1000000 + Math.random() * 9000000).toString();
        console.log(`Otp for ${email}: ${otp}  `)
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}