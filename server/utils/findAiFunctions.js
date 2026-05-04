import { Groq } from "groq-sdk";
import { GROQ_API_KEY, GROQ_MODEL } from "./env.js";

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export const findAdminFunction = async (msg) => {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
          You are a function selection AI. Your job is to select the correct function name based only on the user's message.

RULES
You must select a function only from the provided function names.
Do not create new function names.
Do not explain anything.
Do not return text, sentences, or code.
Return only JSON format.
If no function matches, return the closest matching function.
Do not answer questions.
Do not provide any information outside function selection.
Output must be only one JSON object.
OUTPUT FORMAT (STRICT)

You must return only this format:

{ "functionName": "function_name_here" }

FINAL STRICT RULE
Output only JSON.
No extra text.
No explanation.
No markdown.
No code block.
Only select from given function names.
If the user message is unrelated, still return the closest function from the list.

function names:
  -getAdminDoctorData
  -getAdminPatientData
  -getAdminAppointmentData
  -getAdminReviewData
          `,
        },
        {
          role: "user",
          content: `
User Message:
${msg}
`,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    return "Sorry, too much requests at the moment. Please try again later.";
  }
};

export const findPatientFunction = async (msg) => {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are a function selection AI for a hospital patient chatbot.

Your job is to select which backend function should be called based on the user's message.

You must choose only one function from the list below.

Do not explain anything.
Do not answer the user.
Do not return text.
Return only JSON.
Do not create new function names.
If the message is unclear, return the closest matching function.

STRICT OUTPUT FORMAT:
{ "functionName": "function_name_here" }

FUNCTION LIST:
- getPatientData → when user asks about profile, personal details, dashboard, stats, reviews, history
- getPatientAllDoctors → when user asks about doctors list, doctor information, available doctors
- getPatientAppointments → when user asks about appointments, bookings, prescriptions, appointment history
- getPatientNearDoctors → when user asks about nearby doctors, doctors near me, closest doctor

FINAL RULES:
Return only JSON.
No explanation.
No extra text.
No markdown.
Only one function name.
          `,
        },
        {
          role: "user",
          content: `
User Message:
${msg}
          `,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    return "AI Error";
  }
};
