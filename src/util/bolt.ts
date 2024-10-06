import env from "./env.js";

import bolt from '@slack/bolt';

const { App } = bolt;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET
});

export default app;