const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = (request, response, next) => {
    const token =request.headers["x-auth-token"]
    if (!token)
        response.send("Token bulunmamaktadır.");
    else {
        jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
            if (error)
                response.status(403).send(error);
            else {
                request.decode = decoded;
                next();
            }
        });
    }
};
