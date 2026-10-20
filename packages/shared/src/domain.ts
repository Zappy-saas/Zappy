import { z } from 'zod';
const name = z.string().trim().min(2).max(100);
const description = z.string().trim().max(600).default('');
export const resourceSchemas = {
 categories: z.object({name, description}).strict(),
 products: z.object({name, description, price: z.number().int().min(1).max(10000000), categoryId: z.string().min(1), available: z.boolean().default(true)}).strict(),
 tables: z.object({name, seats: z.number().int().min(1).max(40)}).strict(),
 devices: z.object({name, identifier: z.string().min(2).max(100), tableId: z.string().default('')}).strict(),
 terminals: z.object({name, identifier: z.string().min(2).max(100), provider: z.enum(['pending'])}).strict(),
 'service-requests': z.object({name, accessId: z.string().min(1), resolved: z.boolean().default(false)}).strict(),
};
export type ResourceKind = keyof typeof resourceSchemas;
export const platformSchemas = {
 plans: z.object({name, monthlyPrice: z.number().int().min(0), description}).strict(),
 subscriptions: z.object({name, restaurantId: z.string().min(1), planId: z.string().min(1), status: z.enum(['TRIAL','ACTIVE','SUSPENDED'])}).strict(),
 settings: z.object({name, description}).strict(),
};
export const orderInput = z.object({requestKey: z.uuid(), items: z.array(z.object({productId: z.string().min(1), quantity: z.number().int().min(1).max(20), note: z.string().max(240).default('')}).strict()).min(1).max(30)}).strict();
export const transitions: Record<string, string[]> = {RECEIVED:['PREPARING','CANCELLED'],PREPARING:['READY'],READY:['DELIVERED'],DELIVERED:[],CANCELLED:[]};
export const statusLabels: Record<string,string> = {RECEIVED:'Recebido',PREPARING:'Em preparo',READY:'Pronto',DELIVERED:'Entregue',CANCELLED:'Cancelado',PENDING:'Aguardando',PAID:'Pago',TRIAL:'Em teste',ACTIVE:'Ativa',SUSPENDED:'Suspensa'};
export const money = (cents: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export type Resource = {id:string; kind:string; enabled:boolean; data:Record<string,unknown>};
export type OrderItem = {productId:string;name:string;price:number;quantity:number;note:string};
export type Order = {id:string;status:string;total:number;items:OrderItem[];createdAt:string;accessId:string; tableName?:string};
