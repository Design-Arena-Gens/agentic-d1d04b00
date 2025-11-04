import { NextRequest, NextResponse } from 'next/server';
import { generateAll, type Inputs, type Resultado } from '../../../lib/generator';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Inputs & { cenas?: number };
    const result: Resultado = generateAll({
      tema: String(body.tema || '').slice(0, 240),
      nicho: String(body.nicho || ''),
      duracaoMin: Math.max(3, Math.min(60, Number(body.duracaoMin || 5))),
      estilo: String(body.estilo || 'Did?tico'),
      publico: String(body.publico || 'Geral'),
      idioma: String(body.idioma || 'pt-BR'),
      tom: String(body.tom || 'Amig?vel'),
      cta: String(body.cta || 'Inscreva-se'),
      cenas: Math.max(3, Math.min(60, Number((body as any).cenas || 6)))
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao gerar' }, { status: 400 });
  }
}
