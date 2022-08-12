// const jwt = require("jsonwebtoken");
const db = require("../../db/query");
// const bcrypt = require("bcrypt");
const router = require("express").Router();


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
                obj["tagler"] = d
            })
            return obj
        })

        Promise.all(g).then((d) => {
            response.json(d)
        })
    })
})

router.get("/get", (request, response, next) => {
    const dao = db.getInstance()
    dao.all('SELECT * FROM cats', []).then((data) => {
        response.json(data)
    })
})

router.get("/getBySlug", (request, response, next) => {
    const dao = db.getInstance();
    const { slug } = request.query
    const query = 'SELECT  posts.* \n' +
        ', cats.id as catid \n' +
        'FROM posts \n' +
        'inner join cats on cats.id=posts.cat \n' +
        ' where posts.slug=?'

    dao.get(query, [slug]).then(async(data) => {
        let g = data.map(async(i) => {
            const split = i.tags.split(',')
            let qr = []
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

module.exports = router;