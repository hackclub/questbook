import 'dotenv/config';
import { app } from './bolt';

import './quiz';

await app.start(process.env.PORT || 3000);

app.logger.info('⚡️ Bolt app is running!'); 