import { CRON_JOB_EXPRESSION } from '../config/config';
import { subscribedFeedService } from '../service/SubscribedFeedService';
import { Logger } from '../utils/Logger';

const cron = require('node-cron');
const logger = Logger.getInstance('cron');

export const startJob = async () => {
    cron.schedule(CRON_JOB_EXPRESSION, async () => {
        subscribedFeedService.processAllFeeds();
        logger.info('Started cron job..');
    });
};