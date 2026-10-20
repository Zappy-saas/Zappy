import { listResources, saveResource, disableResource } from '../resources';
export const list = () => listResources('tables');
export const save = (input:unknown,id?:string) => saveResource('tables',input,id);
export const disable = (id:string) => disableResource('tables',id);
