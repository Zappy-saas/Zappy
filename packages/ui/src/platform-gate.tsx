import { getPrincipal } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
export async function PlatformGate({children,loginPath}:{children:React.ReactNode;loginPath:string}) {
 const p=await getPrincipal();if(!p)redirect(loginPath);
 if(!p.user.platformAdmin)return <section role="alert"><h1>Acesso restrito</h1><p>Esta conta não possui autorização de administrador da plataforma.</p></section>;
 return children;
}
