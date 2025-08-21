// app/KoraApp.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function KoraApp() {
  const [journal, setJournal] = useState('');
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEchoes = async () => {
      const { data, error } = await supabase
        .from('echoes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setEchoes(data);
    };
    fetchEchoes();
  }, []);

  const generateEcho = async () => {
    if (!journal.trim()) return;
    setLoading(true);
    const response = await fetch('/api/generate-echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journal }),
    });
    const data = await response.json();
    const newEcho = {
      id: data.echo.id,
      content: data.echo.content,
      created_at: new Date().toISOString(),
    };
    setEchoes([newEcho, ...echoes]);
    setJournal('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <h1 className="text-4xl font-bold mb-2">KŌRΔ</h1>
      <p className="text-lg mb-8 opacity-75">You don't post. You evolve.</p>

      <Card className="bg-[#1e1b3a] border-none max-w-xl mb-8">
        <CardContent className="p-4">
          <Textarea
            placeholder="What's on your mind today?"
            className="bg-[#2e2a4d] text-white"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={5}
          />
          <Button
            onClick={generateEcho}
            className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600"
            disabled={loading}
          >
            {loading ? 'Creating Echo...' : 'Generate Echo'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {echoes.map((echo, index) => (
          <Card key={index} className="bg-[#1b1a2e] border-none">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-indigo-300">
                {new Date(echo.created_at).toLocaleString()}
              </p>
              <p className="text-white whitespace-pre-wrap">{echo.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
