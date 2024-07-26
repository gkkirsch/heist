const functions = require('firebase-functions');
const axios = require('axios');

const ANTHROPIC_API_KEY = functions.config().anthropic.key;
const API_URL = 'https://api.anthropic.com/v1/chat/completions';

exports.generateNickname = functions.https.onCall(async (data, context) => {
  const { firstName } = data;

  if (!firstName) {
    throw new functions.https.HttpsError('invalid-argument', 'First name is required');
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 30,
        messages: [
          {
            role: "user",
            content: `Generate a cool, short nickname for someone named ${firstName}. Just return the nickname, nothing else.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
        }
      }
    );

    return { nickname: response.data.choices[0].message.content.trim() };
  } catch (error) {
    console.error('Error generating nickname:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate nickname');
  }
});
