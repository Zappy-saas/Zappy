'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, useWorkspace, useHref } from './workspace';
import { Button, ErrorState, Header } from './primitives';
import { ResourcePage, OrdersPage, StaffPage, SettingsPage, Overview, Finance, AdminList, PaymentsUnavailable } from './management';
import { MesaPage } from './mesa';
function Login(){const router=useRouter(),href=useHref();const [error,setError]=useState(''),[busy,setBusy]=useState(false);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{await api('auth/login','POST',Object.fromEntries(new FormData(e.currentTarget)));router.replace(href());router.refresh();}catch(e){setError((e as Error).message);setBusy(false);}}return <div className="z-login"><span className="z-kicker">BEM-VINDO DE VOLTA</span><h1>Entre na operação.</h1><p>Use a conta criada pela equipe responsável.</p><form className="z-form" onSubmit={submit}><label>Restaurante<input name="restaurant" required autoComplete="organization"/></label><label>E-mail<input name="email" type="email" required autoComplete="username"/></label><label>Senha<input name="password" type="password" required autoComplete="current-password"/></label>{error&&<ErrorState message={error}/>}<Button className="primary" type="submit" disabled={busy}>{busy?'Entrando…':'Entrar'}</Button></form></div>;}
export function Screen({view}:{view:string}){const {app}=useWorkspace();if(view==='login')return <Login/>;if(app==='mesa')return <MesaPage view={view}/>;if(view==='configuracoes'&&app!=='admin')return <SettingsPage/>;
 if(app==='cozinha')return <OrdersPage view={view==='index'?'pedidos':view}/>;
 if(view==='index'||view==='dashboard')return <Overview/>;
 if(app==='admin'){
  if(view==='pagamentos')return <PaymentsUnavailable/>;
  if(view==='usuarios')return <AdminList kind="users" title="Usuários"/>;
  if(view==='auditoria')return <AdminList kind="audit" title="Auditoria"/>;
  if(view==='dispositivos')return <AdminList kind="devices" title="Dispositivos"/>;
  const names:Record<string,[string,string]>={restaurantes:['restaurants','Restaurantes'],planos:['plans','Planos'],assinaturas:['subscriptions','Assinaturas'],configuracoes:['settings','Configurações da plataforma']};const key=view.split('/')[0],config=names[key];if(config)return <ResourcePage kind={config[0]} title={config[1]} mode={view.endsWith('/novo')?'new':view.includes('[id]')?'detail':'list'}/>;
 }
 if(view.startsWith('pedidos'))return <OrdersPage view={view}/>;
 if(view==='funcionarios')return <StaffPage/>;
 if(view.startsWith('financeiro'))return <Finance view={view}/>;
 if(view==='relatorios')return <Overview title="Relatório de pedidos"/>;
 const names:Record<string,[string,string]>={categorias:['categories','Categorias'],produtos:['products','Produtos'],cardapio:['products','Cardápio'],mesas:['tables','Mesas'],tablets:['devices','Tablets'],terminais:['terminals','Terminais']};const config=names[view.split('/')[0]];if(config)return <ResourcePage kind={config[0]} title={config[1]} mode={view.endsWith('/novo')?'new':view.endsWith('/editar')?'edit':view.includes('[id]')?'detail':'list'}/>;
 return <Header title="Página não encontrada"/>;
}
