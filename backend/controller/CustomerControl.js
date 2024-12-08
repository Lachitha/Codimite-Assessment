import Customer from "../model/CustomerModel.js";
import Token from "../model/Token.js";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";
import { resetPassword } from "../utils/emailTemplate.js";
import crypto from "crypto";

const hashPassword = (password) => {
	return crypto.createHash("sha256").update(password).digest("hex");
};

const register = async (req, res) => {
	try {
		console.log("Request body:", req.body);
		const existingCustomer = await Customer.findOne({ email: req.body.email });
		if (existingCustomer) {
			return res.status(409).json({
				status: false,
				message: "Email already exists",
				data: undefined,
			});
		}

		const hashedPassword = hashPassword(req.body.password);
		const customer = new Customer({ ...req.body, password: hashedPassword });
		const savedCustomer = await customer.save();

		return res.status(201).json({
			status: true,
			message: "Customer created successfully",
			data: savedCustomer,
		});
	} catch (err) {
		console.error("Error creating customer:", err);
		return res.status(500).json({
			status: false,
			message: err.message,
			data: undefined,
		});
	}
};

const login = async (req, res) => {
	try {
		const customer = await Customer.findOne({ email: req.body.email }).exec();
		if (!customer) {
			return res.status(401).json({
				status: false,
				message: "User not found",
				data: undefined,
			});
		}

		const passwordMatch = hashPassword(req.body.password) === customer.password;
		if (passwordMatch) {
			const token = jwt.sign(
				{
					email: customer.email,
					customerId: customer._id,
				},
				process.env.JWT_KEY,
				{
					expiresIn: "1h",
				}
			);

			const tokenDoc = await Token.findOneAndUpdate(
				{ _customerId: customer._id, tokenType: "login" },
				{ token },
				{ new: true, upsert: true }
			).exec();

			return res.status(200).json({
				status: true,
				message: "Auth successful",
				data: {
					token: tokenDoc.token,
					customer,
				},
			});
		} else {
			return res.status(401).json({
				status: true,
				message: "Wrong password",
				data: undefined,
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			status: false,
			message: "Server Error",
			data: undefined,
		});
	}
};

const logout = async (req, res) => {
	try {
		await Token.findOneAndDelete({
			_customerId: req.customerId,
			tokenType: "login",
		}).exec();

		return res.status(200).json({
			status: true,
			message: "Logout successful",
			data: undefined,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			status: false,
			message: "Server Error",
			data: undefined,
		});
	}
};

const authUser = async (req, res) => {
	const customerId = req.customerId;
	try {
		const customer = await Customer.findById(customerId);
		if (!customer) {
			return res.status(401).json({
				status: false,
				message: "User not found",
				data: undefined,
			});
		}
		return res.status(200).json({
			status: true,
			message: "User found",
			data: customer,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: false,
			message: "Error retrieving user",
			data: undefined,
		});
	}
};

const forgetPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const customer = await Customer.findOne({ email });

		if (!customer) {
			return res.status(401).json({
				status: false,
				message: "User not found",
				data: undefined,
			});
		}

		const token = jwt.sign(
			{
				email: customer.email,
				customerId: customer._id,
			},
			process.env.JWT_RESET_PW_KEY,
			{
				expiresIn: "20m",
			}
		);

		const tokenDoc = await Token.findOneAndUpdate(
			{ _customerId: customer._id, tokenType: "resetPassword" },
			{ token: token },
			{ new: true, upsert: true }
		);

		if (tokenDoc) {
			const emailTemplate = resetPassword(email, token);
			sendEmail(emailTemplate);
			res.status(200).json({
				status: true,
				message: "Email sent successfully",
				data: undefined,
			});
		} else {
			return res.status(401).json({
				status: false,
				message: "Error saving token",
				data: undefined,
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: false,
			message: "Error sending email",
			data: undefined,
		});
	}
};

const resetPasswordcon = async (req, res) => {
	const token = req.params.token;
	const password = req.body.password;

	try {
		const decoded = jwt.verify(token, process.env.JWT_RESET_PW_KEY);
		const customer = await Customer.findById(decoded.customerId);
		console.log("customer:", customer);

		if (!customer) {
			return res.status(404).json({
				status: true,
				message: "Customer not found or invalid token",
				data: undefined,
			});
		}

		customer.password = hashPassword(password);
		await customer.save();

		await Token.findOneAndDelete({
			_customerId: decoded.customerId,
			tokenType: "resetPassword",
		});

		res.status(200).json({
			status: true,
			message: "Password reset successful",
			data: undefined,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: false,
			message: "Error resetting password",
			data: undefined,
		});
	}
};

export { register, login, logout, authUser, forgetPassword, resetPasswordcon };
