"use client";
import { useMemo, useState } from 'react';

type Inputs = {
  tema: string;
  nicho: string;
  duracaoMin: number;
  estilo: string;
  publico: string;
  idioma: string;
  tom: string;
  cta: string;
};

type Cena = {
  numero: number;
  titulo: string;
  narracao: string;
  promptImagem: string;
  broll: string[];
};

type Resultado = {
  titulo: string;
  descricao: string;
  tags: string[];
  ganchos: string[];
  thumbnailPrompt: string;
  duracaoEstimativa: string;
  roteiro: Cena[];
  ctas: string[];
};

export default function Page() {
  const [inputs, setInputs] = useState<Inputs>({
    tema: '',
    nicho: 'Educa??o',
    duracaoMin: 5,
    estilo: 'Did?tico',
    publico: 'Iniciantes',
    idioma: 'pt-BR',
    tom: 'Amig?vel e inspirador',
    cta: 'Inscreva-se e deixe seu like',
  });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sceneCount = useMemo(() => Math.max(3, Math.round(inputs.duracaoMin * 1.2)), [inputs.duracaoMin]);

  const handleChange = (k: keyof Inputs, v: string | number) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
  };

  const gerar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, cenas: sceneCount }),
      });
      if (!res.ok) throw new Error('Falha ao gerar conte?do');
      const data = (await res.json()) as Resultado;
      setResultado(data);
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const copiar = async (texto: string) => {
    await navigator.clipboard.writeText(texto);
  };

  const toMarkdown = (r: Resultado) => {
    let md = `# ${r.titulo}\n\n`;
    md += `${r.descricao}\n\n`;
    md += `Tags: ${r.tags.map((t) => `#${t}`).join(' ')}\n\n`;
    md += `Ganchos:\n` + r.ganchos.map((g, i) => `- ${i + 1}. ${g}`).join('\n') + '\n\n';
    md += `Roteiro:\n`;
    r.roteiro.forEach((c) => {
      md += `\n## Cena ${c.numero}: ${c.titulo}\n`;
      md += `Narrac?o:\n\n${c.narracao}\n\n`;
      md += `Prompt de imagem:\n\n${c.promptImagem}\n`;
      if (c.broll.length) md += `B-roll sugerido: ${c.broll.join(', ')}\n`;
    });
    md += `\nThumb prompt: ${r.thumbnailPrompt}\n`;
    md += `\nCTAs: ${r.ctas.join(' | ')}\n`;
    md += `\nDura??o estimada: ${r.duracaoEstimativa}\n`;
    return md;
  };

  const baixar = (tipo: 'md' | 'json') => {
    if (!resultado) return;
    const content = tipo === 'md' ? toMarkdown(resultado) : JSON.stringify(resultado, null, 2);
    const blob = new Blob([content], { type: tipo === 'md' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tipo === 'md' ? 'roteiro.md' : 'roteiro.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2 className="section-title">Briefing do V?deo</h2>
        <p className="small">Preencha para gerar roteiro, falas e prompts de imagem.</p>
        <div className="row row-2" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Tema do v?deo</label>
            <textarea className="textarea" placeholder="Ex.: Como crescer no YouTube em 2025"
              value={inputs.tema} onChange={(e) => handleChange('tema', e.target.value)} />
          </div>
          <div>
            <label className="label">Nicho</label>
            <input className="input" placeholder="Ex.: Marketing, Finan?as, Tecnologia"
              value={inputs.nicho} onChange={(e) => handleChange('nicho', e.target.value)} />
          </div>
        </div>
        <div className="row row-3" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Dura??o (min)</label>
            <input type="number" className="input" min={3} max={45}
              value={inputs.duracaoMin} onChange={(e) => handleChange('duracaoMin', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Estilo</label>
            <select className="select" value={inputs.estilo} onChange={(e) => handleChange('estilo', e.target.value)}>
              <option>Did?tico</option>
              <option>Narrativo</option>
              <option>Lista</option>
              <option>Entrevista</option>
              <option>Documental</option>
            </select>
          </div>
          <div>
            <label className="label">P?blico</label>
            <input className="input" placeholder="Ex.: Iniciantes, profissionais, crian?as"
              value={inputs.publico} onChange={(e) => handleChange('publico', e.target.value)} />
          </div>
        </div>
        <div className="row row-2" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Tom de voz</label>
            <input className="input" placeholder="Ex.: Amig?vel, t?cnico, motivador"
              value={inputs.tom} onChange={(e) => handleChange('tom', e.target.value)} />
          </div>
          <div>
            <label className="label">CTA principal</label>
            <input className="input" placeholder="Ex.: Inscreva-se e deixe seu like"
              value={inputs.cta} onChange={(e) => handleChange('cta', e.target.value)} />
          </div>
        </div>
        <div className="row" style={{ marginTop: 16, alignItems: 'center' }}>
          <button className="button" onClick={gerar} disabled={loading || !inputs.tema.trim()}>
            {loading ? 'Gerando?' : 'Gerar Roteiro e Prompts'}
          </button>
          <span className="small">Cenas previstas: {sceneCount}</span>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: 10 }}>{error}</p>}
      </section>

      <section className="panel">
        <h2 className="section-title">Resultado</h2>
        {!resultado && <p className="small">O conte?do gerado aparecer? aqui.</p>}
        {resultado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="row row-2">
              <button className="button secondary" onClick={() => copiar(toMarkdown(resultado))}>Copiar .md</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button secondary" onClick={() => baixar('md')}>Baixar .md</button>
                <button className="button secondary" onClick={() => baixar('json')}>Baixar .json</button>
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: 0 }}>{resultado.titulo}</h3>
              <p className="small">{resultado.descricao}</p>
              <div style={{ marginTop: 8 }}>
                {resultado.tags.map((t) => (
                  <span key={t} className="badge">#{t}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <h4>Ganchos de abertura</h4>
              <ul>
                {resultado.ganchos.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h4>Roteiro por cena</h4>
              {resultado.roteiro.map((c) => (
                <div key={c.numero} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Cena {c.numero}: {c.titulo}</strong>
                    <button className="copy" onClick={() => copiar(c.narracao)}>Copiar fala</button>
                  </div>
                  <p style={{ margin: '6px 0 8px 0' }}>{c.narracao}</p>
                  <div className="code">{c.promptImagem}</div>
                  {!!c.broll.length && (
                    <p className="small" style={{ marginTop: 6 }}>B-roll: {c.broll.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="card">
              <h4>Thumbnail prompt</h4>
              <div className="code">{resultado.thumbnailPrompt}</div>
            </div>

            <div className="card">
              <h4>CTAs sugeridos</h4>
              <p>{resultado.ctas.join(' | ')}</p>
              <p className="small">Dura??o estimada: {resultado.duracaoEstimativa}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
