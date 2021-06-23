const Quote = require("../models/Quote");
const Author = require("../models/Author");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const SECRET_KEY = process.env.SECRET_KEY;
const {
	validateRegisterInput,
	validateLoginInput,
} = require("../utils/validatorsUsers");

const { validateCreateQuoteInput } = require("../utils/validatorsQuotes");

const jwtToken = user => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{
			expiresIn: "1h",
		}
	);
};

module.exports = {
	Query: {
		quotes: async (_, args, context) => {
			const result = await Quote.find().populate("author");
			result.sort(function (a, b) {
				return new Date(b.createdAt) - new Date(a.createdAt);
			});

			return result;
		},
		quotesByUser: async (_, args, context) => {
			const { user } = context;
			const result = await Quote.find({
				postedBy: user.id,
			}).populate("author");
			return result;
		},
	},
	Mutation: {
		login: async (_, args) => {
			const { username, password } = args;
			const { valid, errors } = validateLoginInput(username, password);

			if (!valid) {
				throw new UserInputError("Errors", {
					errors,
				});
			}
			console.log(args);

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
		register: async (_, { username, email, password, confirmPassword }) => {
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);

			if (!valid) {
				throw new UserInputError("Errors", {
					errors,
				});
			}

			const user = await User.findOne({
				username,
			});

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
		createQuote: async (_, args, context) => {
			const { text, author } = args;
			const { valid, errors } = validateCreateQuoteInput(text, author);
			const findAuthor = await Author.findOne({
				name: author,
			});
			const quote = await Quote.findOne({
				text,
			});

			if (!valid) {
				throw new UserInputError("Errors", {
					errors,
				});
			}

			const createNewQuote = (authorId, userId) => {
				const newQuote = new Quote({
					text: text,
					author: authorId,
					postedBy: userId,
					createdAt: new Date().toISOString(),
				});

				return newQuote;
			};

			if (quote) {
				throw new UserInputError("This quote already exists", {
					errors: {
						text: "This quote already exists",
					},
				});
			}

			if (findAuthor) {
				const quoteResponse = await createNewQuote(
					findAuthor._id,
					context.user.id
				).save();

				return {
					text: quoteResponse.text,
					author: {
						name: author,
					},
				};
			} else {
				const newAuthor = new Author({
					name: author,
				});
				const res1 = await newAuthor.save();
				const res2 = await createNewQuote(
					res1._doc._id,
					context.user.id
				).save();

				return {
					...res2._doc,
					author: {
						name: author,
					},
				};
			}
		},
		deleteQuote: async (_, args, context) => {
			const { quoteId } = args;
			const quote = await Quote.findByIdAndDelete({
				_id: quoteId,
			});

			if (quote) {
				return "Quote deleted successfully";
			}
		},
	},
};
