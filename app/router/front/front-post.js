// const jwt = require("jsonwebtoken");
const db = require("../../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();


router.get("/getAll", (request, response, next) => {
    const dao = db.getInstance();
    const query = 'SELECT  posts.* , tags.nametr as tagtr,tags.nameen as tagen\n' +
        ', cats.nametr as cattr,cats.nameen as caten\n' +
        'FROM posts \n' +
        'left join tags on posts.tags = tags.id \n' +
        'inner join cats on cats.id=posts.cat \n' +
        'where tags.id in (posts.tags)\n' +
        '\n'
    dao.all(query,
        []).then((data) => {
        response.json(data)
    })
})


module.exports = router;
