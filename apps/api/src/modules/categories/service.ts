import { listResources, saveResource, disableResource } from '../resources';
export const list = () => listResources('categories');
export const save = (input:unknown,id?:string) => saveResource('categories',input,id);
export const disable = (id:string) => disableResource('categories',id);
