const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFeedbackSummary(comments) {
  const messages = [
    { 
      role: "system", 
      content: "You are an assistant for a football coach or staff member. Summarize the feedback objectively based on the comments provided by the user, focusing on the player's performance and engagement over time."
    },
    { 
      role: "user", 
      content: `Here are feedback comments you provided about a player's performance and behavior: ${comments.join("; ")}.\nGenerate a short and objective summary (max 100 words) for your own review, highlighting key points about the player's performance and engagement.`}
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
}

module.exports = { generateFeedbackSummary };
