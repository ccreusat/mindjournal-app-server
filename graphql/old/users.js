const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
	validateRegisterInput,
	validateLoginInput,
} = require("../../utils/validatorsUsers");
const SECRET_KEY = process.env.SECRET_KEY;

const User = require("../../models/User");

const jwtToken = user => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: "1h" }
	);
};

module.exports = {
	Query: {
		users: async () => {
			const result = await User.find();
			return result;
		},
	},
	Mutation: {
		login: async (_, { loginInput: { username, password } }) => {
			const { valid, errors } = validateLoginInput(username, password);

			if (!valid) {
				throw new UserInputError("Errors", { errors });
			}

			const user = await User.findOne({ username });

			if (!user) {
				throw new UserInputError("User doesn't exist", {
					errors: {
						username: "User doesn't exist",
					},
				});
			}

			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				throw new UserInputError("Wrong password", {
					errors: {
						password: "Wrong password",
					},
				});
			}

			const token = jwtToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},
		register: async (
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) => {
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);

			if (!valid) {
				throw new UserInputError("Errors", { errors });
			}

			const user = await User.findOne({ username });

			if (user) {
				throw new UserInputError("User already exists", {
					errors: {
						username: "This user already exists",
					},
				});
			}

			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();

			const token = jwtToken(res);

			return {
				...res._doc,
				id: res._id,
				token,
			};
		},
	},
};
