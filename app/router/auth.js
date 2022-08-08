const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const db = require('../db/query')
require('dotenv').config();
router.get("get-token", (request, response, next) => {
    const {password,email} = request.body;
    const payLoad = {
        password,
        email
    };
    const token = jwt.sign(payLoad, process.env.TOKEN_SECRET, {expiresIn: "2h"});
    response.json({
        status: true,
        token
    });
})

router.post("/login", (request, response, next) => {
    const dao = new db()
    dao.get('SELECT email,name,id,password FROM users where email = ?', [request.body.email])
        .then(async (user) => {
            try {
                const match = await bcrypt.compare(request.body.password, user.password);
                delete user["password"]
                const token = jwt.sign((user), process.env.TOKEN_SECRET, {expiresIn: "2h"})
                if (match) {
                    return response.json({status:1,messsage:"Success",token: token})

                } else {
                    return response.json({status:0,messsage:"Invalid Credentials"})
                }
            } catch (e) {
                console.log(e)
                return response.json({status:0,messsage:e})
            }
        })
        .catch((err) => {
            return response.json({status:0,messsage:err})
            // console.log(JSON.stringify(err))
        });

})

router.get("/user", (request, response, next) => {
    const token = request.query.token
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
        if (error)
            return response.json({status:0})
        else {
            return response.json({status:1,user:decoded})
            // request.decode = decoded;
        }
    });
})


module.exports = router;