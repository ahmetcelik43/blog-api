// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();

router.post("/add", (request, response, next) => {
    const dao = db.getInstance();
    const { username, create, post_id, comment } = request.body;
    dao.run('insert into comments ("username","create","post_id","comment") values(?,?,?,?)', [username, create, post_id, comment])
        .then(async(user) => {
            response.json({ message: "success", status: 1 })
        })
        .catch((err) => {
            console.log(JSON.stringify(err))
        });
})


router.put("/setStatus", (request, response, next) => {
    const dao = db.getInstance();
    const { id, status } = request.query;
    dao.run('update comments set "status"=?  where "id"=?', [status, id])
        .then(async(user) => {
            response.json({ message: "success", status: 1 })
        })
        .catch((err) => {
            console.log(JSON.stringify(err))
        });
})



router.delete("/delete", (request, response, next) => {
    const dao = db.getInstance();
    const { id } = request.query;
    dao.run('delete from comments where id=?', [id]).then((data) => {
        response.json({ message: "success", status: 1 })
    })
})



module.exports = router;