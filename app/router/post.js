// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();
const sharp = require('sharp');
const path = require('path')
const config = require('../config')

router.post("/add", async (request, response, next) => {


    if (!request.files || Object.keys(request.files).length === 0) {
        response.status(400).send('No files were uploaded.');
        return;
    }
    const dao = db.getInstance();
    let uploadPath;
    const {
        nametr,
        nameen,
        tagtr,
        tagen,
        cattr,
        caten,
        posttr,
        posten,
        group_lang,
        create,
        slugtr,
        slugen,
        langtr,
        langen
    } = request.body

    let sampleFile = request.files.file.data;
    let filename = nametr + ".jpg"
    await sharp(sampleFile)
        .resize(400, 370).jpeg({quality: 80})
        .toFile(path.resolve('public/posts/' + filename)).then(() => {
            uploadPath = config.prod ? config.urlProd : config.urlLocal
            uploadPath += ["posts", filename].join('/')
        }).catch((err) => {
            response.status(400).send('Upload error');
        });

    const dt = [nametr, cattr, tagtr, posttr, create, slugtr, langtr, group_lang, uploadPath,
        nameen, caten, tagen, posten, create, slugen, langen, group_lang, uploadPath]

    dao.run('insert into posts ("name","cat","tags","post","create","slug","lang","group_lang","image_url") values(?,?,?,?,?,?,?,?,?)' +
        ' ,(?,?,?,?,?,?,?,?,?)',
        dt)
        .then(async () => {
            response.json({message: "success", status: 1})
        })
        .catch((err) => {
            response.json({message: err, status: 0})
        });

})


router.put("/update", (request, response, next) => {
    const dao = db.getInstance();
    const {nametr, nameen, update, id} = request.body;
    dao.run('update cats set "nametr"=? ,"nameen"=? , "update"=? where "id"=?', [nametr, nameen, update, id])
        .then(async (user) => {
            dao.all('SELECT * FROM cats', []).then((data) => {
                response.json(data)
            })
        })
        .catch((err) => {
            console.log(JSON.stringify(err))
        });
})

router.get("/getByName", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT name FROM posts', []).then((data) => {
        response.json(data)
    })
})

router.delete("/getById", (request, response, next) => {
    const dao = db.getInstance();
    const query = 'SELECT  posts.* , tags.nametr as tagtr,tags.nameen as tagen\n' +
        ', cats.nametr as cattr,cats.nameen as caten\n' +
        'FROM posts \n' +
        'left join tags on posts.tags = tags.id \n' +
        'inner join cats on cats.id=posts.cat \n' +
        'where tags.id in (posts.tags)\n' +
        '\n and posts.group_lang=?'
    const {id} =request.query
    dao.all(query,
        [id]).then((data) => {
        response.json(data)
    })
})

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
