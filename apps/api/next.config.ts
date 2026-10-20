import type { NextConfig } from 'next';
import path from 'node:path';
import dotenv from 'dotenv';
import base from '../../next.config';
dotenv.config({path:path.resolve(import.meta.dirname,'../../.env'),quiet:true});
const config:NextConfig={...base,output:undefined,turbopack:{root:path.resolve(import.meta.dirname,'../..')},outputFileTracingRoot:path.resolve(import.meta.dirname,'../..')};
export default config;
