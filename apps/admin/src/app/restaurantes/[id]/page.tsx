import { Screen } from '../../../../../../packages/ui/src/screen';
import { PlatformGate } from '../../../../../../packages/ui/src/platform-gate';
export const dynamic='force-dynamic';
export default function Page() {return <PlatformGate loginPath="/login"><Screen view="restaurantes/[id]"/></PlatformGate>;}
