'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Button, Loading, ErrorState, Sidebar, Navigation } from './primitives';
export type App='mesa'|'restaurante'|'cozinha'|'admin';
type Me={name:string;restaurant:string;role:string;platformAdmin:boolean};
const Context=createContext<{app:App;base:string;me:Me|null}>({app:'restaurante',base:'',me:null});
export const useWorkspace=()=>useContext(Context);
export function useHref(){const {base}=useWorkspace();return (path='')=>`${base}/${path}`.replace(/\/$/,'')||'/';}
export async function api<T=unknown>(path:string,method='GET',body?:unknown):Promise<T>{const r=await fetch(`/api/${path}`,{method,headers:{'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{}),cache:'no-store'});let result;try{result=await r.json();}catch{throw new Error('O servidor não respondeu em JSON. Verifique a publicação.');}if(!r.ok)throw new Error(result.error??'Não foi possível concluir.');return result;}
export function useData<T>(path:string,poll=false){const [data,setData]=useState<T|null>(null),[error,setError]=useState('');const refresh=useCallback(async()=>{try{const d=await api<T>(path);setData(d);setError('');}catch(e){setError(e instanceof Error?e.message:'Falha de conexão.');}},[path]);useEffect(()=>{setData(null);void refresh();if(poll){const stream=new EventSource(path.startsWith('v1/mesa/')?'/api/v1/mesa/events':'/api/v1/events');stream.onmessage=()=>{if(!document.hidden)void refresh();};const t=setInterval(()=>{if(!document.hidden)void refresh();},3000);return()=>{clearInterval(t);stream.close();};}},[refresh,poll]);return {data,error,refresh};}
const links:Record<App,[string,string][]>={
 mesa:[['cardapio','Cardápio'],['carrinho','Carrinho'],['pedidos','Meus pedidos'],['conta','Minha conta'],['atendimento','Atendimento']],
 restaurante:[['dashboard','Visão geral'],['pedidos','Pedidos'],['cardapio','Cardápio'],['categorias','Categorias'],['produtos','Produtos'],['mesas','Mesas'],['tablets','Tablets'],['terminais','Terminais'],['funcionarios','Equipe'],['financeiro','Financeiro'],['relatorios','Relatórios'],['configuracoes','Configurações']],
 cozinha:[['pedidos','Fila de pedidos'],['preparo','Em preparo'],['prontos','Prontos'],['historico','Histórico'],['configuracoes','Preferências']],
 admin:[['dashboard','Visão geral'],['restaurantes','Restaurantes'],['planos','Planos'],['assinaturas','Assinaturas'],['dispositivos','Dispositivos'],['pagamentos','Pagamentos'],['usuarios','Usuários'],['auditoria','Auditoria'],['configuracoes','Configurações']],
};
export function Workspace({app,base='',children}:{app:App;base?:string;children:ReactNode}) {
 const pathname=usePathname(),router=useRouter();const [me,setMe]=useState<Me|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(app!=='mesa');
 const isLogin=pathname.endsWith('/login');
 useEffect(()=>{if(app==='mesa'||isLogin){setLoading(false);setError('');setMe(null);return;}let alive=true;setLoading(true);setError('');api<Me>('v1/me').then(m=>{if(alive){setMe(m);if(app==='admin'&&!m.platformAdmin)setError('Acesso exclusivo aos administradores da plataforma.');}}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[app,isLogin]);
 async function logout(){try{await api('auth/logout','POST',{});router.replace(`${base}/login`);}catch(e){setError((e as Error).message);}}
 const content=loading?<Loading/>:error?<ErrorState message={error} retry={()=>{setError('');router.push(`${base}/login`);}}/>:children;
 return <Context.Provider value={{app,base,me}}><div className={`z-workspace z-${app}`}><a className="skip-link" href="#workspace-content">Ir ao conteúdo</a><Sidebar><Link className="z-logo" href={base||'/'}>zappy<span>.</span></Link><span className="z-app-label">{app==='mesa'?'À sua mesa':app==='admin'?'Administração Zappy':app==='cozinha'?'Cozinha ao vivo':'Gestão do restaurante'}</span><Navigation>{links[app].map(([path,label],i)=>{const href=`${base}/${path}`;return <Link key={path} href={href} aria-current={pathname===href?'page':undefined}><span className="z-nav-number">{String(i+1).padStart(2,'0')}</span>{label}</Link>;})}</Navigation><div className="z-sidebar-bottom"><strong>{me?.restaurant??'Seu pedido, sem espera.'}</strong>{me&&<><small>{me.name}</small><Button onClick={logout}>Sair da conta</Button></>}</div></Sidebar><div className="z-stage"><div className="z-topbar"><span>{app==='mesa'?'Bom apetite. A gente cuida do resto.':me?.restaurant??'Zappy'}</span><span className="z-top-label">{app==='cozinha'?'Atualização automática a cada 3s':app.toUpperCase()}</span></div><main id="workspace-content" className="z-main">{content}</main><footer className="z-footer"><span>Zappy · Seu pedido, sem espera.</span><span>Operação conectada</span></footer></div></div></Context.Provider>;
}
