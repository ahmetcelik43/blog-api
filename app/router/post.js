// const jwt = require("jsonwebtoken");
const db = require("../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();
const sharp = require('sharp');
const path = require('path')
const config = require('../config')


router.post("/add", async(request, response, next) => {


    if (!request.files || Object.keys(request.files).length === 0) {
        response.status(400).send('No files were uploaded.');
        return;
    }
    const dao = db.getInstance();
    let uploadPath = "";
    let uploadPathMin = ""
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
        langen,
        alttr,
        alten
    } = request.body

    let sampleFile = request.files.file.data;
    let filename = slugtr + ".jpg"
    await sharp(sampleFile)
        .resize(600, 250).jpeg({ quality: 90 })
        .toFile(path.resolve('public/posts/' + filename)).then(() => {
            uploadPath += ["posts", filename].join('/')
        }).catch((err) => {
            response.status(400).send('Upload error');
        });
    let filenameMin = slugtr + "_min.jpg"

    await sharp(sampleFile)
        .resize(130, 130).jpeg({ quality: 90 })
        .toFile(path.resolve('public/posts/' + filenameMin)).then(() => {
            uploadPathMin += ["posts", filenameMin].join('/')
        }).catch((err) => {
            response.status(400).send('Upload error');
        });

    const dt = [nametr, cattr, tagtr, posttr, create, slugtr, langtr, group_lang, uploadPath, alttr, uploadPathMin,
        nameen, caten, tagen, posten, create, slugen, langen, group_lang, uploadPath, alten, uploadPathMin
    ]

    dao.run('insert into posts ("name","cat","tags","post","create","slug","lang","group_lang","image_url","alt","min_img") values(?,?,?,?,?,?,?,?,?,?,?)' +
            ' ,(?,?,?,?,?,?,?,?,?,?)',
            dt)
        .then(async() => {
            response.json({ message: "success", status: 1 })
        })
        .catch((err) => {
            response.json({ message: err, status: 0 })
        });

})


router.put("/update", async(request, response, next) => {
    let uploadPathMin = ""
    let uploadPath = "";
    const {
        nametr,
        nameen,
        tagtr,
        tagen,
        cattr,
        caten,
        posttr,
        posten,
        update,
        slugtr,
        slugen,
        alttr,
        alten,
        idtr,
        iden
    } = request.body

    let d1 = [nametr, cattr, tagtr, posttr, update, slugtr, alttr, idtr]
    let q1 = `update posts set "name"=? , "cat"=?,"tags"=?,"post"=?,"update"=?,"slug"=?,"alt"=? where "id"=?`
    let d2 = [nameen, caten, tagen, posten, update, slugen, alten, iden]

    if (request.files) {
        let sampleFile = request.files.file.data;
        let filename = slugtr + ".jpg"
        await sharp(sampleFile)
            .resize(600, 250).jpeg({ quality: 90 })
            .toFile(path.resolve('public/posts/' + filename)).then(() => {
                uploadPath += ["posts", filename].join('/')
            }).catch((err) => {
                response.status(400).send('Upload error');
            });

        let filenameMin = slugtr + "_min.jpg"

        await sharp(sampleFile)
            .resize(130, 130).jpeg({ quality: 90 })
            .toFile(path.resolve('public/posts/' + filenameMin)).then(() => {
                uploadPathMin += ["posts", filenameMin].join('/')
            }).catch((err) => {
                response.status(400).send('Upload error');
            });
        d1 = [nametr, cattr, tagtr, posttr, update, slugtr, uploadPath, uploadPathMin, alttr, idtr]
        d2 = [nameen, caten, tagen, posten, update, slugen, uploadPath, uploadPathMin, alten, iden]
        q1 = `update posts set "name"=? , "cat"=?,"tags"=?,"post"=?,"update"=?,"slug"=?,"image_url"=?,"min_img"=?,"alt"=? where "id"=?`

    }

    const dao = db.getInstance();

    // const dt = [nametr, cattr, tagtr, posttr, update, slugtr, uploadPath, alttr,idtr],
    //     dt2=[nameen, caten, tagen, posten, update, slugen, uploadPath, alten,iden]

    await dao.run(q1, d1)
        .then(async() => {
            await dao.run(q1, d2)
                .then(() => {
                    response.json({ message: "success", status: 1 })
                })
                .catch((err) => {
                    console.log("err2")
                    response.status(500).json({ message: err, status: 0 })
                });
        })
        .catch((err) => {
            console.log("err1")
            response.status(500).json({ message: err, status: 0 })
        });


})

router.get("/getByName", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT name FROM posts', []).then((data) => {
        response.json(data)
    })
})


router.get("/getByNames", (request, response, next) => {
    const dao = db.getInstance();
    const { tr, en } = request.query
    dao.all('SELECT name FROM posts where name!=? and name!=?', [tr, en]).then((data) => {
        response.json(data)
    })
})


router.get("/getById", (request, response, next) => {
    const dao = db.getInstance();
    const query = 'SELECT  posts.* \n' +
        ', cats.id as catid \n' +
        'FROM posts \n' +
        'inner join cats on cats.id=posts.cat \n' +
        ' where posts.group_lang=?'
    const { group_lang } = request.query
    dao.all(query, [group_lang]).then(async(data) => {
        let g = data.map(async(i) => {
            const split = i.tags.split(',')
            let qr = [],
                temp
            split.forEach((i, index) => {
                qr.push(" id=?")
            })
            let obj = i
            const q = "select id,nametr,nameen from tags where " + qr.join(' or ')
            await dao.all(q,
                split).then((d) => {
                obj["tagler"] = d
            })
            return obj
        })

        Promise.all(g).then((d) => {
            response.json(d)
        })
    })
})

router.get("/getAll", (request, response, next) => {
    const dao = db.getInstance();
    const query = 'SELECT  posts.* \n' +
        ', cats.nametr as cattr,cats.nameen as caten\n' +
        'FROM posts \n' +
        'inner join cats on cats.id=posts.cat \n'
    dao.all(query, []).then(async(data) => {
        let g = data.map(async(i) => {
            const split = i.tags.split(',')
            let qr = [],
                temp
            split.forEach((i, index) => {
                qr.push(" id=?")
            })
            let obj = i
            const q = "select id,nametr,nameen from tags where " + qr.join(' or ')
            await dao.all(q,
                split).then((d) => {
                obj["aa"] = d
            })
            return obj
        })

        Promise.all(g).then((d) => {
            response.json(d)
        })
    })
})
router.delete("/delete", (request, response, next) => {
    const dao = db.getInstance();
    const { grp } = request.query;
    dao.run('delete from posts where grp=?', [grp]).then((data) => {
        response.json({ status: 1, "message": "success" })
    })
})

module.exports = router;