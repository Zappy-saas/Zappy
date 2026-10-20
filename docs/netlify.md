# Netlify

Importe `Zappy-saas/Zappy`, branch `main`, sem diretório base.
O `netlify.toml` define Node 24, comando `npm run build` e publicação `.next`.
Mantenha a integração Next.js do Netlify habilitada; esta aplicação precisa de
funções de servidor, não de exportação estática.

O hook `prebuild` gera o cliente Prisma antes da compilação e da checagem de
tipos, inclusive em instalações novas. Usa o mesmo gerador fixado no lockfile
que o build Docker, sem acessar o banco nem baixar engines nativas.
As dependências de desenvolvimento precisam estar disponíveis durante o build.

Para funcionar após a publicação, configure no gerenciador de variáveis do
Netlify, também para as funções:

- `DATABASE_URL`: conexão PostgreSQL hospedada, com TLS conforme o provedor.
- `APP_ORIGIN`: URL HTTPS exata do site, sem barra final.
- `COOKIE_SECURE`: `true`.

Não coloque credenciais no GitHub. Aplique as migrations com
`npm run db:migrate` em ambiente seguro com acesso ao banco antes de usar o
painel, e provisione a conta conforme o README. O build não aplica migrations.
O comando de migração portátil continua restrito ao desenvolvimento local.

Depois do push, acompanhe o deploy automático ou use **Trigger deploy** no
Netlify. Verifique `/api/health` e o login na URL publicada.
Um build local bem-sucedido não valida a execução das funções no Netlify.

## Primeira instalação pelo editor do Neon

Para um banco novo, sem tabelas da Zappy, abra **SQL Editor** no Neon e selecione
a branch e o banco usados pela `DATABASE_URL` do Netlify. Cole todo o conteúdo de
[`deploy/neon-initial-setup.sql`](../deploy/neon-initial-setup.sql) e clique em
**Run** uma vez. O arquivo cria as tabelas e registra as duas migrations iniciais
com seus checksums, dentro de uma única transação.

Se já houver tabelas ou histórico de migrations, o script recusa a instalação.
Não apague tabelas para tentar novamente; use o fluxo normal de migrations.
Esse arquivo é apenas para a instalação inicial e não cria contas de acesso.
Atualizações posteriores devem usar `npm run db:migrate`.
