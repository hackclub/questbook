import { App } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  
  // socket mode
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

export { app };