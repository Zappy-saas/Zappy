import { Workspace } from '../../../../packages/ui/src/workspace';
import '@fontsource/rethink-sans/400.css';
import '@fontsource/rethink-sans/600.css';
import '@fontsource/rethink-sans/700.css';
import '../../../../src/app/globals.css';
import '../../../../packages/ui/src/styles.css';
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><Workspace app="cozinha" base="">{children}</Workspace></body></html>;}
