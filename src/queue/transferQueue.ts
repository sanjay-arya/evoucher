import * as Queue from 'bee-queue';
import * as fs from 'fs';
import config from '../config/config';

const transferQueue = new Queue('transferQueue', config.redisConfig);

export default () => {
    transferQueue.process(async (job, done) => {
        let {code, image} = job.data;
        // Notify the client via push notification, web socket or email etc.
        console.log(job.data)
        try {
            fs.writeFileSync(`public/qr/${code}.png`, image, {encoding: 'base64'});
            // fs.writeFileSync(`../../public/qr/${code}.png`, image, {encoding: 'base64'});
        } catch (error) {
            console.log(error);    
        }
        done();
    })
};