const functions = require('firebase-functions');

const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = functions.config().anthropic.key;

exports.generateNickname = functions.https.onCall(async (data, context) => {
  const { firstName } = data;

  if (!firstName) {
    throw new functions.https.HttpsError('invalid-argument', 'First name is required');
  }

  try {
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 30,
      messages: [{ role: "user", content: `Generate a cool, short nickname for someone named ${firstName}. The nickname should include their name or part of their name. It should be gansta. Just return the nickname, nothing else.` }],
    });

    console.info('Completion complete', msg);
    return { nickname: msg.content[0].text.trim() };
  } catch (error) {
    console.error('Error generating nickname:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate nickname');
  }
});
