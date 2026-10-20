import { listResources, saveResource, disableResource } from '../resources';
export const list = () => listResources('devices');
export const save = (input:unknown,id?:string) => saveResource('devices',input,id);
export const disable = (id:string) => disableResource('devices',id);
