const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async function summarize(results) {
  const text = results
    .map(
      (r) =>
        `Tool: ${r.tool}\nCommand: ${r.command}\nOutput:\n${r.output}\n---\n`
    )
    .join("\n");

  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert cybersecurity auditor. Based on the raw tool outputs, provide a clear and concise security audit summary in markdown. Use bullet points. Prioritize any vulnerabilities, outdated software, misconfigurations, or missing headers.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.4,
    });

    return gptResponse.data.choices[0].message.content.trim();
  } catch (err) {
    return `Summary error: ${err.message}`;
  }
};
