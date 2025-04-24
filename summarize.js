const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function summarizeResults(results) {
  const text = results
    .map(r => `[${r.tool}]\n${r.output.slice(0, 1000)}`) // Truncate overly long output
    .join('\n\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a cybersecurity analyst. Summarize the scan results in a concise, professional tone. Point out any risks or findings clearly.'
      },
      {
        role: 'user',
        content: `Here are the scan results:\n${text}`
      }
    ],
    temperature: 0.4
  });

  return completion.choices[0].message.content.trim();
};
