import { GoogleGenAI } from '@google/genai';
import { StockData } from '@/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateAnalysis(symbol: string, data: StockData) {
  const prompt = `
    Analyze the following financial data for ${symbol}:
    
    Insider Transactions:
    ${JSON.stringify(data.insiderTransactions)}
    
    Recent News:
    ${JSON.stringify(data.news)}
    
    Stock Price Movement:
    ${JSON.stringify(data.prices)}
    
    Task:
    Provide a concise correlation analysis between insider trades, news, and price movements.
    Return the response in the following format:
    1. Key Patterns (bullet points)
    2. Actionable Insight (one sentence)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });
  
  if (!response.text) {
    throw new Error('Empty response from Gemini');
  }
  
  return response.text;
}
