const Author = require("../../models/Author");

module.exports = {
	Query: {
		allAuthors: () => Author.find().populate("quotes"),
		authorsAllQuotes: async (_, args, context, info) => {
			console.log(args);
			let quotes = await Author.find({ name: args.name })
				.populate("quotes")
				.select("name");

			return quotes;
		},
	},
};
