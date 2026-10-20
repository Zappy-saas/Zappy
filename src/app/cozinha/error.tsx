'use client';
import {ErrorState} from '../../../packages/ui/src/primitives';
export default function Error({reset}:{reset:()=>void}){return <ErrorState message="Ocorreu uma falha. Tente novamente ou procure a equipe." retry={reset}/>;}
