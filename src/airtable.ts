import Airtable from "airtable";

Airtable.configure({
    apiKey: process.env.AIRTABLE_TOKEN,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
const table = base("leaderboard");

async function fetchBySlackId(slackId: string) {
    const results = await table.select({
        maxRecords: 1,
        filterByFormula: `{slack_id} = "${slackId}"`
    }).all();

    return results.length > 0 ? results[0].id : null;
}

async function addFeedback(slackId: string, feedback: string, projects: string) {
    const recordId = await fetchBySlackId(slackId);

    if (!recordId) {
        return false;
    }

    await table.update(recordId, {
        "feedback": feedback,
        "projects": projects
    });
}

async function addGuild(slackId: string, guild: string) {
    const recordId = await fetchBySlackId(slackId);

    if (!recordId) {
        return false; 
    }

    await table.update(recordId, {
        "slack_id": slackId,
        "guild": guild
    });

    return true;
}

export {
    addFeedback,
    addGuild,
    fetchBySlackId
}