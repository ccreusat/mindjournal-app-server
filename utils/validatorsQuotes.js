module.exports.validateCreateQuoteInput = (text, author) => {
  const errors = {};
  if (text.trim() === "") {
    errors.text = "Text must not be empty";
  }
  if (author.trim() === "") {
    errors.author = "Author must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
