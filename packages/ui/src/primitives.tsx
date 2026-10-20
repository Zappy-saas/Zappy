'use client';
import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { statusLabels } from '../../shared/src/domain';
export function Button({children,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props} className={`z-button ${props.className??''}`}>{children}</button>;}
export function Input(props:InputHTMLAttributes<HTMLInputElement>){return <input {...props}/>;}
export function Badge({children}:{children:ReactNode}){return <span className="z-badge">{children}</span>;}
export function OrderStatus({status}:{status:string}){return <span className={`z-status z-status-${status.toLowerCase()}`}>{statusLabels[status]??status}</span>;}
export const PaymentStatus=OrderStatus;
export function EmptyState({title='Nenhum registro por aqui',children}:{title?:string;children?:ReactNode}){return <div className="z-empty"><span className="z-empty-mark">—</span><h2>{title}</h2>{children??<p>Os registros do restaurante aparecerão aqui.</p>}</div>;}
export function Loading(){return <div className="z-loading" role="status"><span/>Carregando seu ambiente…</div>;}
export function ErrorState({message,retry}:{message:string;retry?:()=>void}){return <div role="alert" className="z-error"><strong>Não foi possível continuar</strong><p>{message}</p>{retry&&<Button onClick={retry}>Tentar novamente</Button>}</div>;}
export function Header({title,subtitle,children}:{title:string;subtitle?:string;children?:ReactNode}){return <header className="z-heading"><div><span className="z-kicker">ZAPPY / OPERAÇÃO</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div>{children}</div></header>;}
export function Table({headers,children}:{headers:string[];children:ReactNode}){return <div className="z-table"><table><thead><tr>{headers.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;}
export function Dialog({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close();},[open]);return <dialog ref={ref} className="z-dialog" onCancel={onClose}><div className="z-heading"><h2>{title}</h2><Button aria-label="Fechar" onClick={onClose}>×</Button></div>{children}</dialog>;}
export const Modal=Dialog;
export function Navigation({children}:{children:ReactNode}){return <nav aria-label="Navegação principal">{children}</nav>;}
export function Sidebar({children}:{children:ReactNode}){return <aside className="z-sidebar">{children}</aside>;}
