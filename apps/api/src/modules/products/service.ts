import { listResources, saveResource, disableResource } from '../resources';
export const list = () => listResources('products');
export const save = (input:unknown,id?:string) => saveResource('products',input,id);
export const disable = (id:string) => disableResource('products',id);
