const jwt = require("jsonwebtoken");
const db = require("../db/query");
const bcrypt = require("bcrypt");
const router = require("express").Router();

router.get("/index", (request, response, next) => {
    const dao = new db()
    dao.get('SELECT * FROM users', [])
        .then(async (user) => {
           response.json(user)
        })
        .catch((err)=>{
            console.log(JSON.stringify(err))
        });
})



module.exports = router;
