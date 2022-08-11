// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();

router.post("/add", (request, response, next) => {
    const dao = db.getInstance();
    const {nametr,nameen,create} = request.body;
    dao.run('insert into cats ("nametr","nameen","create") values(?,?,?)', [nametr,nameen,create])
        .then(async (user) => {
            dao.all('SELECT * FROM cats', []).then((data)=>{
                response.json(data)
            })
        })
        .catch((err)=>{
            console.log(JSON.stringify(err))
        });
})


router.put("/update", (request, response, next) => {
    const dao = db.getInstance();
    const {nametr,nameen,update,id} = request.body;
    dao.run('update cats set "nametr"=? ,"nameen"=? , "update"=? where "id"=?', [nametr,nameen,update,id])
        .then(async (user) => {
            dao.all('SELECT * FROM cats', []).then((data)=>{
                response.json(data)
            })
        })
        .catch((err)=>{
            console.log(JSON.stringify(err))
        });
})

router.get("/get", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT * FROM cats', []).then((data)=>{
        response.json(data)
    })
})

router.delete("/delete", (request, response, next) => {
    const dao = db.getInstance();
    const {id} = request.query;
    dao.run('delete from cats where id=:id', [id]).then((data)=>{
        dao.all('SELECT * FROM cats', []).then((data)=>{
            response.json(data)
        })
    })
})


module.exports = router;
