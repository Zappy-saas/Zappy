'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings2, History, LogOut, ArrowUpRight, Check, ArrowRight, Store, ShieldCheck, ChevronRight } from 'lucide-react';
import type { Role } from '@prisma/client';
import { can, roleLabels } from '@/lib/permissions';
import { Button } from './ui/button';
type Props = {restaurant: {name: string; slug: string}; user: {name: string; role: Role}; members: {id: string; role: Role; active: boolean; user: {name: string; email: string}}[]; audit: {id: string; action: string; date: string; actor: string}[]};
type Tab = 'overview' | 'team' | 'audit' | 'settings';
const titles: Record<Tab, string> = {overview: 'Visão geral', team: 'Equipe e acessos', audit: 'Histórico de alterações', settings: 'Dados do restaurante'};
export function Dashboard({restaurant, user, members, audit}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [name, setName] = useState(restaurant.name);
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const router = useRouter();
  const nav = [{id: 'overview' as const, label: 'Visão geral', icon: LayoutDashboard, allowed: true}, {id: 'team' as const, label: 'Equipe e acessos', icon: Users, allowed: can(user.role, 'members:read')}, {id: 'audit' as const, label: 'Histórico', icon: History, allowed: can(user.role, 'audit:read')}, {id: 'settings' as const, label: 'Configurações', icon: Settings2, allowed: can(user.role, 'restaurant:write')}];
  function navigate(id: Tab) { setTab(id); setError(''); setMessage(''); }
  async function logout() {
    setPending(true); setError('');
    try { const result = await fetch('/api/auth/logout', {method: 'POST'}); if (!result.ok) throw new Error(); router.replace('/login'); router.refresh(); }
    catch { setError('Não foi possível sair. Verifique a conexão e tente novamente.'); setPending(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/restaurant', {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name})});
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMessage('Dados salvos. A alteração foi registrada no histórico.'); router.refresh();
    } catch (e) { setError(e instanceof TypeError ? 'Sem conexão. Os dados não foram salvos.' : e instanceof Error ? e.message : 'Não foi possível salvar.'); }
    finally { setPending(false); }
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main">Ir para o conteúdo</a>
    <aside className="sidebar"><div className="sidebar-brand"><span className="wordmark dark">zappy<span>.</span></span><span className="workspace-label">RESTAURANTE</span></div>
      <div className="restaurant-switch"><div className="store-icon"><Store size={20}/></div><div><strong>{restaurant.name}</strong><span>Ambiente de gestão</span></div></div>
      <nav aria-label="Menu principal"><span className="nav-label">SEU AMBIENTE</span>{nav.filter(n=>n.allowed).map(({id,label,icon: Icon})=><button key={id} onClick={()=>navigate(id)} aria-current={tab === id ? 'page' : undefined} className={`nav-item ${tab===id?'active':''}`}><Icon size={19}/>{label}{tab===id && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="phase-note"><span className="status-dot"/> Fundação em desenvolvimento<p>Gestão de acesso e identificação do restaurante disponíveis.</p></div><div className="user-row"><span className="avatar">{user.name.slice(0,1).toUpperCase()}</span><div><strong>{user.name}</strong><span>{roleLabels[user.role]}</span></div><button className="icon-button" aria-label="Sair da conta" onClick={logout} disabled={pending}><LogOut size={18}/></button></div></div>
    </aside>
    <div className="main-column"><header className="topbar"><span>Restaurante <ChevronRight size={14}/> <strong>{titles[tab]}</strong></span><span className="environment-tag">Versão inicial · 0.1</span></header>
      <main id="main" className="main-content"><nav className="z-subnav" aria-label="Aplicativos Zappy"><a href="/restaurante">Restaurante</a><a href="/cozinha">Cozinha</a><a href="/mesa">Mesa</a></nav><div className="page-heading"><div><span className="eyebrow">{restaurant.name}</span><h1>{titles[tab]}</h1><p className="muted">{tab==='overview'?'Uma base organizada para o próximo capítulo do seu restaurante.':tab==='team'?'Pessoas autorizadas a acessar este restaurante.':tab==='audit'?'Últimas 20 alterações registradas neste ambiente.':'Mantenha a identificação do seu estabelecimento atualizada.'}</p></div>{tab==='overview' && can(user.role,'restaurant:write') && <Button variant="outline" onClick={()=>navigate('settings')}>Editar restaurante <ArrowUpRight size={17}/></Button>}</div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {tab==='overview' && <><section className="welcome-banner"><div><span className="eyebrow">SEU PONTO DE PARTIDA</span><h2>O cuidado com a experiência<br/>começa nos detalhes.</h2><p>Seu restaurante já tem um ambiente próprio.<br/>Confira os dados e os acessos para seguir com a implantação.</p>{can(user.role,'restaurant:write') && <button className="text-link" onClick={()=>navigate('settings')}>Conferir meus dados <ArrowRight size={17}/></button>}</div><div className="banner-index" aria-hidden="true">01<span>FUNDAÇÃO</span></div></section>
      <div className="section-heading"><h2>Base do restaurante</h2><span>Informações deste ambiente</span></div>
      <section className="foundation-grid"><article><span className="tile-icon"><Store size={21}/></span><span className="muted">Identificação</span><h3>{restaurant.name}</h3><p>Identificador: <strong>{restaurant.slug}</strong></p></article><article><span className="tile-icon"><Users size={21}/></span><span className="muted">Acesso autorizado</span><h3>{can(user.role,'members:read')?`${members.filter(m=>m.active).length} pessoa${members.filter(m=>m.active).length===1?'':'s'}`:roleLabels[user.role]}</h3><p>{can(user.role,'members:read')?'Contas ativas vinculadas ao restaurante.':'Seu perfil neste estabelecimento.'}</p></article><article><span className="tile-icon"><ShieldCheck size={21}/></span><span className="muted">Seu perfil</span><h3>{roleLabels[user.role]}</h3><p>Permissões verificadas a cada solicitação.</p></article></section>
      <section className="next-step"><div className="step-number">02</div><div><span className="eyebrow">PRÓXIMA ETAPA · NÃO DISPONÍVEL</span><h3>Preparar a operação</h3><p>Cardápio, mesas e dispositivos serão implementados na próxima fase. Pedidos e pagamentos ainda não estão habilitados.</p></div></section></>}
      {tab==='team' && <section className="data-section"><div className="section-heading"><h2>Contas vinculadas</h2><span>{members.length} registro(s) · limite de 100</span></div><div className="table-scroll"><table><thead><tr><th>Pessoa</th><th>Perfil</th><th>Situação</th></tr></thead><tbody>{members.map(m=><tr key={m.id}><td><strong>{m.user.name}</strong><span className="table-subtitle">{m.user.email}</span></td><td>{roleLabels[m.role]}</td><td><span className={m.active?'badge':'badge neutral'}>{m.active?'Ativo':'Revogado'}</span></td></tr>)}</tbody></table></div><p className="section-footnote">Nesta etapa, o provisionamento de contas é realizado pelo responsável técnico. Convites e edição de perfis serão adicionados posteriormente.</p></section>}
      {tab==='audit' && <section className="data-section">{audit.length ? <div className="table-scroll"><table><thead><tr><th>Alteração</th><th>Responsável</th><th>Data e hora</th></tr></thead><tbody>{audit.map(a=><tr key={a.id}><td>{a.action==='restaurant.updated'?'Dados do restaurante atualizados':a.action==='restaurant.provisioned'?'Restaurante cadastrado':a.action}</td><td>{a.actor}</td><td>{new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(a.date))}</td></tr>)}</tbody></table></div>:<div className="empty-state"><History size={28}/><h2>Nenhuma alteração registrada</h2><p>As alterações nos dados do restaurante aparecerão aqui.</p></div>}<p className="section-footnote">Horários de Brasília. Registros vinculados exclusivamente a este restaurante.</p></section>}
      {tab==='settings' && <section className="settings-section"><div><h2>Identificação</h2><p className="muted">Estas informações identificam o restaurante para sua equipe.</p></div><form onSubmit={save} className="form-stack"><label>Nome do restaurante<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={100}/></label><label>Identificador de acesso<input value={restaurant.slug} readOnly/><small>O identificador é definido na implantação e não pode ser alterado aqui.</small></label>{message && <p className="success-message" role="status"><Check size={18}/>{message}</p>}<Button disabled={pending || name.trim()===restaurant.name} type="submit">{pending?'Salvando…':'Salvar alterações'}</Button></form></section>}
      <footer className="app-footer"><span>Zappy — Seu pedido, sem espera.</span><span>Fundação da plataforma</span></footer></main>
    </div>
  </div>;
}
