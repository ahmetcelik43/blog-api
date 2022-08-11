// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();

router.get("/get", (request, response, next) => {
    const dao = db.getInstance();
    const {page} = request.query
    dao.get('SELECT * FROM meta where page=:id', [page]).then((data)=>{
        console.log(data)
        response.json(data)
    })
})
module.exports = router;
