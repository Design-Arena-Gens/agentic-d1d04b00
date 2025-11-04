import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Assistente de V?deos YouTube com IA',
  description: 'Gere roteiros, falas e prompts de imagem para v?deos de YouTube.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="container">
          <header className="header">
            <h1>Assistente de V?deos YouTube com IA</h1>
            <p className="subtitle">Roteiros, falas e prompts de imagens ? prontos para produ??o.</p>
          </header>
          <main>{children}</main>
          <footer className="footer">Feito para criadores. Implant?vel no Vercel.</footer>
        </div>
      </body>
    </html>
  );
}
