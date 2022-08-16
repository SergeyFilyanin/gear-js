import { CronJob } from 'cron';
import { KAFKA_TOPICS } from '@gear-js/common';

import configuration from '../config/configuration';

import { kafkaProducer } from '../kafka/producer';
import { genesisHashesCollection } from './genesis-hashes-collection';

let cron: CronJob;

const cronTime = configuration().cron.time;

function schedulerGenesisHashes(){
  return {
    async start() {
      await kafkaProducer.sendByTopic(KAFKA_TOPICS.TEST_BALANCE_GENESIS, 'testBalance.genesis');
      cron = new CronJob(cronTime, async function () {
        genesisHashesCollection.clear();
        await kafkaProducer.sendByTopic(KAFKA_TOPICS.TEST_BALANCE_GENESIS, 'testBalance.genesis');
      });
      cron.start();
    }
  };
}

export { schedulerGenesisHashes };