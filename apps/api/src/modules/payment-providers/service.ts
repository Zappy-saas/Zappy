export interface TerminalProvider { createCharge(input:{amount:number;terminalId:string;requestKey:string;method:'PIX'|'CREDIT'|'DEBIT'}):Promise<{providerId:string;status:'PENDING'}>; verifyWebhook(body:Uint8Array,signature:string):Promise<{providerId:string;status:'PAID'|'FAILED'}>; }
// No fake adapter: payment capture must be implemented and certified with the selected provider.
