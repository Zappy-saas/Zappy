# Execução, segurança e implantação

## Desenvolvimento validável

O banco local é PostgreSQL 17 em Docker com volume persistente e porta somente em loopback. `.env` é ignorado pelo Git e criado com permissões 0600. Não publique a senha local. Depois de reiniciar a máquina, execute `npm run setup:local` (ou `PRISMA_PORTABLE=1 npm run setup:local` na rede restrita), depois `npm run dev`.

O fallback portátil gera o cliente e aplica migrações usando pacotes oficiais Prisma instalados pelo npm com integridade no lockfile. Não desativa TLS ou checksums. Usa APIs internas versionadas; não é uma nova engine e não implementa um migrador próprio. A verificação de drift e criação de novas migrações continuam pelo CLI nativo após liberar `binaries.prisma.sh`. O fallback só aceita bancos em localhost e recusa `NODE_ENV=production`.

O setup não cria conta com senha padrão. O seed é opcional, identificável como demonstração e proibido com `NODE_ENV=production`. Provisionamento administrativo exige acesso direto ao banco e variáveis no processo. Contas reais e valores secretos não devem entrar em commits, screenshots ou logs.

## Controles implementados e limites

- Sessão aleatória, hash no banco, oito horas, HttpOnly, SameSite=Lax e Secure quando HTTPS.
- Validação de Origin exata para **todas** as mutações, inclusive login/logout; JSON com tamanho máximo de 16 KiB.
- Rate limit atômico por hash de e-mail: 10 tentativas a cada 15 minutos, compartilhado entre instâncias. Não confia em X-Forwarded-For.
- Autorizações no servidor, tenant inferido da sessão e revalidação de vínculos suspensos/revogados.
- Lista de membros sem senha/token, limite explícito de 100 registros; paginação é trabalho futuro.
- Auditoria transacional de provisionamento e alteração do nome. Não é ainda uma trilha inviolável nem cobre eventos operacionais inexistentes.
- Headers contra enquadramento, MIME sniffing e permissões de câmera/microfone. CSP permite `unsafe-eval` somente no modo de desenvolvimento para depuração do React. Em produção, permite scripts inline necessários ao Next nesta primeira etapa; nonce/hash e testes de CSP mais estrita são pendentes.
- Logs de falha registram tipo/evento sem expor objeto de erro, corpo ou credenciais.

Não há RLS PostgreSQL; o isolamento depende de consultas autorizadas com escopo obrigatório, verificadas pelos testes. Adicionar RLS/role de banco com menor privilégio antes de ampliar superfície e acesso direto a dados. O usuário Docker local é de desenvolvimento e **não** é o papel de produção recomendado.

Pendências antes de produção: proteção de borda com limite por IP confiável e limite global, recuperação de senha, MFA, gestão de dispositivos, revogação global após troca de senha, limpeza periódica de sessões expiradas e contadores, gestão segura de uploads, política de retenção/exportação/exclusão LGPD e revisão de segurança. Um atacante pode causar bloqueio temporário de uma conta pelo rate limit; a camada de borda e monitoramento devem complementar o limite por identidade.

## Caminho de implantação (ainda não executado)

1. Provisionar PostgreSQL gerenciado, rede privada, TLS validado e papéis separados de migração e aplicação.
2. Injetar `DATABASE_URL`, `APP_ORIGIN=https://seu-dominio` e `COOKIE_SECURE=true` em um gerenciador de segredos/configuração. Nunca aceitar origem arbitrária do request como origem confiável.
3. Instalar dependências com `npm ci`, gerar Prisma pelo CLI nativo e executar `npm run build`.
4. Fazer backup e executar `npm run db:migrate` com controle de concorrência de deploy. Não executar seed.
5. Iniciar com `npm run start` atrás de TLS/reverse proxy, limitar tamanho/taxa de requisições na borda e monitorar `/api/health`.
6. Provisionar o primeiro estabelecimento pelo comando administrativo em canal seguro.
7. Validar login/saída, isolamento, suspensão e auditoria no ambiente de homologação antes de abrir acesso.
8. Definir e testar backup/restauração, alertas, RPO/RTO, retenção e resposta a incidentes.

O build de produção pode ser validado localmente em `http://localhost:3000` com `COOKIE_SECURE=false`; qualquer outra origem de produção exige Secure. Nenhuma publicação, domínio, backup gerenciado ou monitoramento externo foi configurado nesta entrega.
