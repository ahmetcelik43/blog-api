// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();


router.get("/get", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT * FROM cats', []).then((data) => {
        response.json(data)
    })
})


module.exports = router;