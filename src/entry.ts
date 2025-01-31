import 'dotenv/config';
import { app } from './bolt';

import { parse } from 'yaml';
import fs from 'fs';

const configFile = fs.readFileSync('./src/config.yaml', 'utf8');
const CONFIG = parse(configFile);

await Promise.all(CONFIG['defaultChannels'].map(async (channel_id: string) => {
    try {
        await app.client.conversations.join({
            channel: channel_id,
        });
    } catch (e) {
        console.error(e);
    }
}));

import './flow';

import './quests/questHandlers/firstMessage';
import './quests/questHandlers/setProfilePicture';
import './quests/questHandlers/joinChannel';

await app.start(process.env.PORT || 3000);

app.logger.info('⚡️ Bolt app is running!'); 

export { CONFIG };