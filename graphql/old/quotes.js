const { UserInputError } = require("apollo-server-errors");
const { validateCreateQuoteInput } = require("../../utils/validatorsQuotes");
const Quote = require("../../models/Quote");

module.exports = {
  Query: {
    quotes: async () => {
      // const result = await Quote.find().populate("author").exec();
      const result = await Quote.find().populate("author");

      console.log(result);
      result.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return result;
    },
  },
  Mutation: {
    // TODO: Validators create quote
    createQuote: async (
      _,
      { createQuoteInput: { text, author }, args, context, info }
    ) => {
      const { valid, errors } = validateCreateQuoteInput(text, author);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const quote = await Quote.findOne({ text });

      if (quote) {
        throw new UserInputError("This quote already exists", {
          errors: {
            text: "This quote already exists",
          },
        });
      }
      const newQuote = new Quote({
        text,
        author,
        createdAt: new Date().toISOString(),
      });

      const res = await newQuote.save();

      return {
        ...res._doc,
      };
    },
  },
};
