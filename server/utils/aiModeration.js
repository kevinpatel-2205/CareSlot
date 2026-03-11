import { Groq } from "groq-sdk";
import { GROQ_API_KEY } from "./env.js";

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export const checkReviewWithAI = async (comment) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
          You are a moderation AI for a healthcare review platform.

Your job is to check if a patient review contains:
- abusive language
- hate speech
- harassment
- threats
- profanity
- personal attacks using offensive words

IMPORTANT RULES:

1. Honest criticism, negative feedback, or poor experience descriptions are ALLOWED.
2. Statements like:
   - "This doctor is not good"
   - "I had a bad experience"
   - "The doctor didn't help me"
   - "Very rude staff"
   - "Treatment didn't work"

   should be APPROVED because they are normal reviews.

3. Only reject the review if it contains:
   - insults (idiot, stupid, useless doctor, etc.)
   - abusive or vulgar language
   - threats
   - hate speech toward race, religion, gender, etc.
   - harassment or bullying

4. Strong criticism without abusive words is allowed.

5. If the review is rejected, provide a short reason.

Return ONLY valid JSON in this format:

{
  "approved": true
}

OR

{
  "approved": false,
  "reason": "short reason if rejected"
}
          `,
        },
        {
          role: "user",
          content: comment,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    return JSON.parse(result);
  } catch (error) {
    return {
      approved: false,
      reason: "AI moderation failed",
    };
  }
};
