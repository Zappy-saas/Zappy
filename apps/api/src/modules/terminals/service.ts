import { listResources, saveResource, disableResource } from '../resources';
export const list = () => listResources('terminals');
export const save = (input:unknown,id?:string) => saveResource('terminals',input,id);
export const disable = (id:string) => disableResource('terminals',id);
