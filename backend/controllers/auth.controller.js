import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email address" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const existingUserByEmail = await User.findOne({ email: email });
        if (existingUserByEmail) {
            return res
                .status(400)
                .json({ success: false, message: "Email already exists" });
        }

        const existingUserByUsername = await User.findOne({
            username: username,
        });
        if (existingUserByUsername) {
            return res
                .status(400)
                .json({ success: false, message: "Username already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];
        const image =
            PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            image,
        });

        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        return res.status(201).json({
            success: true,
            user: {
                ...newUser._doc,
                password: "",
            },
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcryptjs.compare(
            password,
            user.password
        );
        if (!isPasswordCorrect) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);

        return res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                password: "",
            },
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt-netflix");
        return res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

export const authCheck = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
