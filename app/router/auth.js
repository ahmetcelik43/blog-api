const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const db = require('../db/query')
const config = require('../config')
const secret = config.secret


router.post("/login", (request, response, next) => {
    const dao = db.getInstance();
    const { email, password, remember } = request.body
    dao.get('SELECT email,name,id,password FROM users where email = ?', [email])
        .then(async(user) => {
            try {
                const match = await bcrypt.compare(password, user.password);
                delete user["password"]
                const token = jwt.sign((user), secret, { expiresIn: remember ? "5h" : "1h" })
                if (match) {
                    return response.json({ status: 1, messsage: "Success", token: token })

                } else {
                    return response.json({ status: 0, messsage: "Invalid Credentials" })
                }
            } catch (e) {
                console.log(e)
                return response.json({ status: 0, messsage: e })
            }
        })
        .catch((err) => {
            return response.json({ status: 0, messsage: err })
                // console.log(JSON.stringify(err))
        });

})

router.get("/user", (request, response, next) => {
    const token = request.query.token
    jwt.verify(token, secret, (error, decoded) => {
        if (error)
            return response.json({ status: 0 })
        else {
            return response.json({ status: 1, user: decoded })
                // request.decode = decoded;
        }
    });
})


module.exports = router;