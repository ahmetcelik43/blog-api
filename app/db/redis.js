const client = require('redis')

class PrivateRedis {

    constructor() {
        try {
            const client2 = client.createClient({
                socket: {
                    host: 'redis-16055.c55.eu-central-1-1.ec2.cloud.redislabs.com',
                    port: "16055"
                },
                password: '249EmSzbG8i1vuwwFN2vcm1h4UAYP9jk'
            })
            client2.connect();
            client2.on('error', (err) => console.log('Redis Client Error', err));
            console.log('Redis connected!')
            this.redis = client2
        } catch (error) {

        }

    }

    get(type) {
        return redis.instance.redis.get(type)
    }
    set(type, val) {
        return redis.instance.redis.set(type, val)
    }
}
class redis {

    static getInstance() {
        if (!redis.instance) {
            redis.instance = new PrivateRedis();
        }
        return redis.instance;
    }

    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
}

module.exports = redis