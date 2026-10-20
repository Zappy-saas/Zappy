import { Workspace } from '../../../packages/ui/src/workspace';
export default function Layout({children}:{children:React.ReactNode}){return <Workspace app="mesa" base="/mesa">{children}</Workspace>;}
