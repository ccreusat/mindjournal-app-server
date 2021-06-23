const { gql } = require("apollo-server");

const typeDefs = gql`
	type Quote {
		id: ID
		text: String!
		author: Author
		createdAt: String!
	}

	type Author {
		name: String!
	}

	type User {
		id: ID
		email: String
		username: String!
		token: String
		createdAt: String
	}

	input RegisterInput {
		username: String!
		email: String!
		password: String!
		confirmPassword: String!
	}

	input LoginInput {
		username: String!
		password: String!
	}

	input CreateQuoteInput {
		text: String!
		author: String!
	}

	type Query {
		quotes: [Quote]!
		quotesByUser: [Quote]!
		# getUser: User!
	}

	type Mutation {
		register(
			username: String!
			email: String!
			password: String!
			confirmPassword: String!
		): User!
		login(username: String!, password: String!): User!
		createQuote(text: String!, author: String!): Quote!
		deleteQuote(quoteId: ID!): String!
	}
`;

module.exports = typeDefs;
