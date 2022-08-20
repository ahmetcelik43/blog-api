const jwt = require("jsonwebtoken");
const config = require('../config')
const secret = config.secret
module.exports = (request, response, next) => {
    const token = request.headers["x-auth-token"]
    if (!token)
        response.send("Token bulunmamaktadır.");
    else {
        jwt.verify(token, secret, (error, decoded) => {
            if (error)
                response.status(403).send(error);
            else {
                request.decode = decoded;
                next();
            }
        });
    }
};