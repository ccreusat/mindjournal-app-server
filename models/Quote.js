const { model, Schema } = require("mongoose");

const quoteSchema = new Schema({
	text: String,
	author: String,
	createdAt: String,
	postedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: "Author",
	},
});

module.exports = model("Quote", quoteSchema);
