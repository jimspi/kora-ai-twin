// pages/api/generate-echo.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { journal } = req.body;
  if (!journal) return res.status(400).json({ error: 'Missing journal input' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are Kora, an AI twin that turns human journaling into poetic, emotionally resonant Echoes. Respond with a single artistic passage that captures the mood of the user input. Format it poetically.',
        },
        {
          role: 'user',
          content: journal,
        },
      ],
      temperature: 0.9,
      max_tokens: 200,
    });

    const echoText = completion.choices[0]?.message?.content || 'Echo lost in the void.';

    const { data, error } = await supabase
      .from('echoes')
      .insert({ content: echoText.trim() })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ echo: data });
  } catch (err) {
    console.error('[Echo API Error]', err);
    res.status(500).json({ error: 'Failed to generate or store Echo' });
  }
}
