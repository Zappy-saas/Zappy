import type { Metadata } from 'next';
import '@fontsource/rethink-sans/400.css';
import '@fontsource/rethink-sans/500.css';
import '@fontsource/rethink-sans/600.css';
import '@fontsource/rethink-sans/700.css';
import './globals.css';
export const metadata: Metadata = {title: 'Zappy · Gestão do restaurante', description: 'Seu pedido, sem espera. Ambiente de gestão Zappy.', robots: {index: false, follow: false}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
