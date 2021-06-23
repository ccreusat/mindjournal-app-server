const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
function getTokenPayload(token) {
	return jwt.verify(token, SECRET_KEY, function (err, decoded) {
		return decoded;
	});
}

module.exports = {
	getTokenPayload,
};
