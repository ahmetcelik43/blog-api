const sqlite3 = require('sqlite3')
const Promise = require('bluebird')

class PrivateSingleton {
    constructor() {
        this.db = new sqlite3.Database(__dirname + "/db.db", (err) => {
            if (err) {
                console.log('Could not connect to database', err)
            } else {
                const sql = 'pragma journal_mode = WAL;pragma synchronous = normal;pragma temp_store = memory;' +
                    ' pragma mmap_size = 30000000000;'
                db.instance.db.run(sql, [], function(err) {
                    if (err) {
                        console.log('Error running sql ' + sql)
                        console.log(err)
                    } else {}
                })
            }
        })

    }

    //create/update/delete
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.instance.db.run(sql, params, function(err) {
                if (err) {
                    console.log('Error running sql ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    // resolve({ id: this.lastID })
                    resolve()
                }
            })
        })
    }

    //get
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.instance.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.instance.db.all(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

}

class db {

    static getInstance() {
        if (!db.instance) {
            db.instance = new PrivateSingleton();
        }
        return db.instance;
    }

    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
}



module.exports = db