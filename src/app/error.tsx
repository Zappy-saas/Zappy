'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({reset}: {reset: ()=>void}) { return <main className="empty-state"><h1>Não foi possível carregar o ambiente</h1><p>Verifique a conexão. Se o problema continuar, entre em contato com o responsável técnico.</p><Button onClick={reset}>Tentar novamente</Button></main>; }
