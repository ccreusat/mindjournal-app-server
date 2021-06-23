const { ApolloServer } = require("apollo-server");
require("dotenv").config();

const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const PORT = process.env.PORT || 4000;

const { getTokenPayload } = require("./config");

const server = new ApolloServer({
	typeDefs,
	resolvers,
	cors: true,
	context: ({ req }) => {
		// Get the user token from the headers.
		let headers = req.headers;
		let authorization = headers.authorization;
		let token = authorization || "";

		// Try to retrieve a user with the token
		const user = getTokenPayload(token.replace(/^Bearer\s+/, ""));

		// Add the user to the context
		return {
			user,
		};
	},
	playground: true,
	introspection: true,
});

const uri = process.env.MONGO_URI;
mongoose
	.connect(uri, {
		useNewUrlParser: true,
	})
	.then(() => {
		console.log("MongoDB Connected");
		return server.listen({
			port: PORT,
		});
	})
	.then(res => {
		console.log(`Server running at ${res.url}`);
	});
