/**
 * @file Check if the environment is properly configured
 */

import dotenv from 'dotenv/config';

function getEnv(environmentVar: string): NonNullable<string> {
  if (!(environmentVar in process.env)) {
    console.error(`Error: Environment variable ${environmentVar} is not set.`);
    process.exit(1);
  }

  return process.env[environmentVar] as NonNullable<string>;
}

export default {
  SLACK_BOT_TOKEN: getEnv('SLACK_BOT_TOKEN'),
  SLACK_SIGNING_SECRET: getEnv('SLACK_SIGNING_SECRET'),
  PORT: 3000, //i'm bored, let's just hardcode this
}