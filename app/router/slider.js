const db = require("../db/query");
const router = require("express").Router();
const sharp = require('sharp');
const path = require("path");

router.post("/add", async(request, response, next) => {
    if (!request.files || Object.keys(request.files).length === 0) {
        response.status(400).send('No files were uploaded.');
        return;
    }
    const { posttr, posten, alttr, alten, langtr, langen, group } = request.body
    let uploadPath = "";
    let sampleFile = request.files.filetr.data;
    let filename = alttr + Math.random() + ".jpg"
    await sharp(sampleFile)
        .resize(500, 370).jpeg({ quality: 90 })
        .toFile(path.resolve('public/sliders/' + filename)).then(() => {
            uploadPath += ["sliders", filename].join('/')
        }).catch((err) => {
            response.status(400).send('Upload error');
        });

    let uploadPathEn = "";
    let sampleFileEn = request.files.fileen.data;
    let filenameEn = alten + Math.random() + ".jpg"
    await sharp(sampleFileEn)
        .resize(500, 370).jpeg({ quality: 90 })
        .toFile(path.resolve('public/sliders/' + filenameEn)).then(() => {
            uploadPathEn += ["sliders", filenameEn].join('/')
        }).catch((err) => {
            response.status(400).send('Upload error');
        });

    const dao = db.getInstance();
    dao.get('select (ord+1) as orders from slider where lang=? order by ord desc limit 1', ["tr"]).then((data) => {
        dao.run('insert into slider(image_url,table_id,ord,lang,grp,alt) values(?,?,?,?,?,?)', [uploadPath, posttr, data ? data.orders : 1, langtr, group, alttr])

    })

    dao.get('select (ord+1) as orders from slider where lang=? order by ord desc limit 1', ["en"]).then((data) => {
        dao.run('insert into slider(image_url,table_id,ord,lang,grp,alt) values(?,?,?,?,?,?)', [uploadPathEn, posten, data ? data.orders : 1, langen, group, alten])
    })

    response.json({ message: "success", status: 1 })
})

router.get("/getAll", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT * FROM slider order by ord', []).then((data) => {
        let g = data.map(async(i) => {
            const split = i.table_id
            let qr = " id=?"
            let obj = i
            const q = "select slug from posts where " + qr
            await dao.get(q,
                split).then((d) => {
                obj["post_href"] = d.slug
            })
            return obj
        })

        Promise.all(g).then(async(d) => {
            response.json(d)
        })
    })
})

router.get("/getPosts", (request, response, next) => {
    const dao = db.getInstance();
    dao.all('SELECT lang,name,id FROM posts', []).then((data) => {
        response.json(data)
    })
})

router.get("/getByGroup", (request, response, next) => {
    let { grp } = request.query
    const dao = db.getInstance();
    dao.all('SELECT * FROM slider where grp=? ', [grp]).then((data) => {
        response.json(data)
    })
})


router.put("/setOrder", async(request, response, next) => {
    let { list } = request.body
    list = list.split(',')
    const dao = db.getInstance();
    list.forEach(async(i, index) => {
        await dao.run(`update slider set "ord"=? where "id"=?`, [index + 1, i])
            .catch((e) => {
                throw e
            })
    });
    response.json({ message: "success", status: 1 })

})



router.put("/update", async(request, response, next) => {

    const { posttr, posten, alttr, alten, idtr, iden } = request.body
    let data = [posttr, alttr, idtr],
        data2 = [posttr, alttr, idtr],
        q = 'update slider set table_id=?,alt=? where id=?',
        q2 = 'update slider set table_id=?,alt=? where id=?'
    if (request.files.filetr) {
        let uploadPath = "";
        let sampleFile = request.files.filetr.data;
        let filename = alttr + Math.random() + ".jpg"
        await sharp(sampleFile)
            .resize(500, 370).jpeg({ quality: 90 })
            .toFile(path.resolve('public/sliders/' + filename)).then(() => {
                uploadPath += ["sliders", filename].join('/')
            }).catch((err) => {
                response.status(400).send('Upload error');
            });
        data = [uploadPath, posttr, alttr, idtr]
        q = 'update slider set image_url=?,table_id=?,alt=? where id=?'
    }
    if (request.files.fileen) {
        let uploadPathEn = "";
        let sampleFileEn = request.files.fileen.data;
        let filenameEn = alten + Math.random() + ".jpg"
        await sharp(sampleFileEn)
            .resize(500, 370).jpeg({ quality: 90 })
            .toFile(path.resolve('public/sliders/' + filenameEn)).then(() => {
                uploadPathEn += ["sliders", filenameEn].join('/')
            }).catch((err) => {
                response.status(400).send('Upload error');
            });
        data2 = [uploadPathEn, posttr, alttr, idtr]
        q2 = 'update slider set image_url=?,table_id=?,alt=? where id=?'

    }
    const dao = db.getInstance();
    dao.run(q, data)
    dao.run(q2, data2)
    response.json({ message: "success", status: 1 })
})

router.delete("/delete", (request, response, next) => {
    const dao = db.getInstance();
    const { grp } = request.query;
    dao.run('delete from slider where grp=?', [grp]).then((data) => {
        response.json({ status: 1, "message": "success" })
    })
})
module.exports = router;