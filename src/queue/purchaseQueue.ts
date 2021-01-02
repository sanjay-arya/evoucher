import * as Queue from 'bee-queue';
import config from '../config/config';

const purchaseQueue = new Queue('purchase', config.redisConfig);

export default (purchase) => {
    return purchaseQueue.createJob(purchase).save();
};