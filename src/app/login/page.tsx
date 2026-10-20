import { getPrincipal } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { ArrowUpRight } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function LoginPage() {
  if (await getPrincipal()) redirect('/painel');
  return <main className="login-layout">
    <section className="brand-panel" aria-label="Sobre a Zappy">
      <span className="wordmark">zappy<span>.</span></span>
      <div className="brand-message"><span className="eyebrow">TECNOLOGIA À MESA</span><h1>Mais tempo<br/>para servir<br/><span>bem.</span></h1><p>Pedidos, pessoas e operação.<br/>Uma experiência que começa à mesa.</p></div>
      <div className="brand-bottom"><span>Seu pedido, sem espera.</span><ArrowUpRight size={22}/></div>
    </section>
    <section className="login-content">
      <div className="login-meta"><span>ÁREA DO RESTAURANTE</span><span className="version">Fundação · v0.1</span></div>
      <div className="login-box"><span className="eyebrow red">BEM-VINDO À ZAPPY</span><h2>Sua operação<br/>começa aqui.</h2><p className="muted intro">Entre com sua conta para acessar o ambiente do seu restaurante.</p><LoginForm/><p className="login-help">Precisa de acesso? Solicite uma conta ao responsável pela implantação do restaurante.</p></div>
      <footer className="login-footer">Zappy <span>Tecnologia que conecta operações.</span></footer>
    </section>
  </main>;
}
