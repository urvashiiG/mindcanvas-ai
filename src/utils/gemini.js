import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function askNova(prompt) {
 const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

 const result = await model.generateContent(`
You are Nova AI inside MindCanvas.

Rules:
- Give short and professional answers.
- Use headings and bullet points.
- Do not use markdown symbols like ** or *.
- Keep answers concise.
- Maximum 8 lines unless user asks for details.

User Question:
${prompt}
`);

  return result.response.text();
}