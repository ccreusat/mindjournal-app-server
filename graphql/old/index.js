const quotesResolvers = require("./quotes");
const usersResolvers = require("./users");
const authorsResolvers = require("./authors");

module.exports = {
  Query: {
    ...quotesResolvers.Query,
    ...authorsResolvers.Query,
    ...usersResolvers.Query,
  },
  Mutation: {
    ...quotesResolvers.Mutation,
    ...usersResolvers.Mutation,
  },
};
