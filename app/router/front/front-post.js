// const jwt = require("jsonwebtoken");
const db = require("../../db/query");
const redis = require("../../db/redis");
// const bcrypt = require("bcrypt");
const router = require("express").Router();
const config = require('../../config')
const sharp = require('sharp');
const path = require("path");
const axios = require('axios');


router.get("/getAll", async(request, response, next) => {

    /*   const client = redis.getInstance()
    const cats = await client.get('posts')
    if (cats) {
        return response.json(JSON.parse(cats))
    }
*/
    const { lang } = request.query
    const dao = db.getInstance();
    const query = 'SELECT  posts.* \n' +
        ', cats.nametr as cattr,cats.nameen as caten\n' +
        'FROM posts \n' +
        'inner join cats on cats.id=posts.cat where posts.lang=? \n'
    dao.all(query, [lang]).then(async(data) => {
        response.json(data)
            /* let g = data.map(async(i) => {
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

             Promise.all(g).then(async(d) => {
                 await client.set('posts', JSON.stringify(d))
                 response.json(d)
             })
             */

    })
})

router.get("/get", async(request, response, next) => {

    const dao = db.getInstance()
    dao.all('SELECT * FROM cats', []).then(async(data) => {

        response.json(data)
    })
})

router.post("/upload", async(request, response, next) => {
    let uploadPath = "";
    const file = request.files.file
    const sampleFile = file.data;
    const filename = Math.random() + ".jpg"
    const url = config.prod ? config.urlProd : config.urlLocal
    await sharp(sampleFile)
        .resize(600, 370).jpeg({ quality: 90 })
        .toFile(path.resolve('public/post-image/' + filename)).then(() => {
            uploadPath += ["post-image", filename].join('/')
            response.json({ location: ([url, uploadPath].join('/')) })
        }).catch((err) => {
            response.status(400).send('Upload error');
        });

})

router.get("/getSlider", (request, response, next) => {
    const { lang } = request.query
    const dao = db.getInstance()
    dao.all('SELECT slider.image_url,slider.alt,posts.slug FROM slider inner join posts on slider.table_id=posts.id where slider.lang=?', [lang]).then(async(data) => {
        response.json(data)
    })
})


router.get("/getCats", (request, response, next) => {
    const dao = db.getInstance()

    dao.all('SELECT cats.*,count(posts.id) FROM cats inner join posts on cats.id=posts.cat group by posts.cat', []).then(async(data) => {
        response.json(data)
    })
})

router.get("/getCatWithPostNumber", (request, response, next) => {
    const { lang } = request.query
    const dao = db.getInstance()
    dao.all('SELECT cats.*,count(posts.id) as postNumber FROM cats left join posts on cats.id=posts.cat where posts.lang=? GROUP BY cats.id', [lang])
        .then((data) => {
            response.json(data)
        })
})

router.get("/getSearch", async(request, response, next) => {
    /*  const client = redis.getInstance()
      const cats = await client.get('search')
      if (cats) {
          return response.json(JSON.parse(cats))
      }
     */
    const dao = db.getInstance()
    const { locale } = request.query
    dao.all('SELECT name,slug,image_url from posts where lang=?', [locale]).then(async(data) => {
        // await client.set('search', JSON.stringify(data))
        response.json(data)
    })
})

router.get("/getTags", async(request, response, next) => {
    const client = redis.getInstance()
    const cats = await client.get('tags')
    if (cats) {
        return response.json(JSON.parse(cats))
    }
    const dao = db.getInstance()
    dao.all('SELECT * from tags', []).then(async(data) => {
        await client.set('tags', JSON.stringify(data))
        response.json(data)
    })
})

router.get("/getRelated", (request, response, next) => {
    const { cat, lang, id } = request.query
    const dao = db.getInstance()
    dao.all('SELECT posts.* from posts inner join cats on cats.id=posts.cat where cats.id=? and posts.lang=? and posts.id<>?', [cat, lang, id]).then((data) => {
        response.json(data)
    })
})


router.get("/getBySlug", async(request, response, next) => {

    const dao = db.getInstance();
    const { slug, locale } = request.query
    dao.get("select id from posts where group_lang = (select group_lang from posts where slug=?) and lang=?", [slug, locale]).then(async(d) => {

        const query = 'SELECT  posts.* \n' +
            ', cats.nametr as cattr,cats.nameen as caten,cats.id as catid \n' +
            'FROM posts \n' +
            'inner join cats on cats.id=posts.cat \n' +
            ' where posts.id=?'

        if (d) {
            dao.get(query, [d.id]).then(async(data) => {

                const split = data.tags.split(',')
                let qr = []
                split.forEach((i, index) => {
                    qr.push(" id=?")
                })
                let obj = data
                const q = "select id,nametr,nameen from tags where " + qr.join(' or ')
                await dao.all(q,
                        split).then((d) => {
                        obj["tagler"] = d
                    })
                    //await client.set('postSlug', JSON.stringify(obj))
                response.json(obj)

            })
        } else {
            response.json({})
        }

    })

})


router.get("/getCatWithPosts", async(request, response, next) => {

    const dao = db.getInstance();
    const { cat, lang } = request.query
    dao.get("select id from cats where nametr=? or nameen=?", [cat, cat]).then(async(d) => {

        const query = 'SELECT  posts.* \n' +
            ', cats.nametr as cattr,cats.nameen as caten,cats.id as catid \n' +
            'FROM posts \n' +
            'inner join cats on cats.id=posts.cat \n' +
            ' where posts.cat=? and posts.lang=?'

        if (d) {
            dao.all(query, [d.id, lang]).then((data) => {
                response.json(data)
            })
        } else {
            response.json([])
        }

    })

})

router.get("/recaptcha", (request, response, next) => {
    const { token } = request.query

    if (!token) {
        response.end(
            JSON.stringify({
                success: false,
                message: 'Invalid token'
            })
        );
        return;
    }

    axios
        .get(`https://www.google.com/recaptcha/api/siteverify?secret=${"6LcrbZIhAAAAAJ3X0LU-ujFLRwRZreR5OqA2uOM3"}&response=${token}`)
        .then(res => {
            console.log(res.data)
            const dt = res.data
            if (dt.success && dt.score > 0.5) {
                response.end(
                    JSON.stringify({
                        success: true,
                        message: 'Token verifyed'
                    })
                );
            } else {
                response.end(
                    JSON.stringify({
                        success: false,
                        message: 'Invalid token'
                    })
                );
            }
        })
        .catch(error => {
            console.error(error);
        });
})
router.get("/getByPost", (request, response, next) => {
    const { postId } = request.query;
    const dao = db.getInstance();
    dao.all('SELECT comments.* FROM comments inner join posts on posts.id=comments.post_id where comments.status=1 and posts.id=?', [postId]).then((data) => {
        console.log(data)
        response.json(data)
    })
})
module.exports = router;