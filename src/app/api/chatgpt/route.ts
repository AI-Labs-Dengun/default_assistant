import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json();

    // Read instructions and knowledge from public directory
    const instructions = await fs.readFile(path.join(process.cwd(), 'public', 'AI_INSTRUCTIONS.md'), 'utf-8');
    const knowledge = await fs.readFile(path.join(process.cwd(), 'public', 'AI_KNOWLEDGE.md'), 'utf-8');

    // Create a single, comprehensive system message
    const systemMessage = `Você é o assistente de IA da Dengun, uma Startup Studio e Agência Digital sediada em Faro, Portugal. Sua função é ajudar os visitantes a entender os serviços da Dengun e guiá-los em sua jornada de transformação digital.

[INSTRUÇÕES]
${instructions}

[BASE DE CONHECIMENTO]
${knowledge}

IMPORTANTE:
- Responda sempre em português
- Seja criativo e original em suas respostas
- Use o tom e estilo definidos nas instruções
- Incorpore informações relevantes da base de conhecimento
- Nunca copie exemplos diretamente das instruções
- Evite começar suas respostas com cumprimentos (olá, oi, etc) ou afirmações (claro, sim, etc)
- Responda de forma direta e natural, como em uma conversa real
- Mantenha suas respostas concisas e objetivas
- Use linguagem coloquial e amigável, mas mantenha o profissionalismo
- Mantenha o contexto da conversa e faça referências a mensagens anteriores quando relevante`;

    // Preparar o histórico de mensagens para o contexto
    const messages: ChatMessage[] = [
      { role: "system", content: systemMessage }
    ];

    // Adicionar o histórico da conversa se existir
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { user: string, content: string }) => {
        messages.push({
          role: msg.user === 'me' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Adicionar a mensagem atual
    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error in ChatGPT API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from ChatGPT' },
      { status: 500 }
    );
  }
} 