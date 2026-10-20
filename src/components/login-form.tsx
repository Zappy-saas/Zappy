'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setPending(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(Object.fromEntries(data))});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace('/painel'); router.refresh();
    } catch (error) { setError(error instanceof TypeError ? 'Sem conexão com o servidor. Verifique a rede e tente novamente.' : error instanceof Error ? error.message : 'Não foi possível entrar.'); setPending(false); }
  }
  return <form onSubmit={submit} className="form-stack">
    <div><label htmlFor="restaurant">Restaurante</label><input id="restaurant" aria-describedby="restaurant-help" name="restaurant" placeholder="identificador-do-restaurante" autoComplete="organization" required minLength={2} maxLength={80}/><small id="restaurant-help">Use o identificador informado na implantação.</small></div>
    <label>E-mail<input name="email" type="email" placeholder="voce@restaurante.com.br" autoComplete="username" required maxLength={254}/></label>
    <label>Senha<input name="password" type="password" placeholder="Sua senha de acesso" autoComplete="current-password" required maxLength={128}/></label>
    {error && <p className="error-message" role="alert">{error}</p>}
    <Button disabled={pending} type="submit">{pending ? <>Entrando <LoaderCircle className="spin" size={18}/></> : <>Entrar no restaurante <ArrowRight size={18}/></>}</Button>
  </form>;
}
