# Aplicações Zappy

A raiz continua sendo o site integrado do Netlify: `/login` e `/painel` permanecem,
e `/mesa`, `/restaurante`, `/cozinha` e `/admin` expõem os quatro novos ambientes.
As mesmas telas também são compiladas em quatro aplicativos Next.js independentes.
O quinto aplicativo, `apps/api`, serve a API. Não há dados demonstrativos nas páginas.

## Instalação e execução

Node 24 e npm (lockfile mantido para o Netlify e a CI). A estrutura possui npm
workspaces e `pnpm-workspace.yaml`; comandos `pnpm run ...` podem executar os mesmos
scripts se pnpm já estiver instalado. Não misture instalações nem substitua o
lockfile em uma publicação. `turbo.json` descreve as tarefas para futura adoção do
Turborepo; os scripts atuais usam um orquestrador Node, sem depender do Turbo.

```bash
npm ci
PRISMA_PORTABLE=1 npm run setup:local
npm run dev
```

O primeiro comando instala as dependências; o segundo cria/inicia o PostgreSQL local,
gera o cliente e aplica migrations. O terceiro inicia todos os cinco aplicativos:
mesa (porta 3001), restaurante (3002), cozinha (3003), admin (3004), API (3005).
As origens locais são autorizadas apenas no processo do orquestrador.
O PostgreSQL precisa estar iniciado pelo setup. No Windows, execute o setup pelo
Git Bash com Docker Desktop em execução. Para banco Neon, configure `.env` e use
`npm run db:generate:portable` e `npm run db:migrate` em vez do setup local.

`npm run dev:mesa`, `dev:restaurante`, `dev:cozinha`, `dev:admin` e `dev:api`
iniciam um aplicativo por vez. Inicie também a API e configure `APP_ORIGINS` quando
usar esses comandos separados. `npm run dev:gateway` inicia somente o site integrado.
`npm run build` gera os cinco aplicativos e o site integrado, sequencialmente.
`npm run build:gateway` gera só o site integrado, usado pelo Netlify e Docker.
`npm run lint` é a checagem estática TypeScript; não há ESLint configurado.
`npm test` executa testes unitários/configuração e `npm run test:e2e` os testes de navegador/API.
Com os cinco aplicativos já iniciados por `npm run dev`, `npm run test:workspaces`
valida saúde e login através de cada proxy. `npm run check:structure` verifica todos
os arquivos de rota exigidos.

## Primeiro acesso e operação

Não existe senha padrão. Configure as variáveis descritas no README e execute
`npm run admin:provision` para criar restaurante e proprietário. Para conceder
administração da plataforma a uma conta existente, configure temporariamente
`PLATFORM_ADMIN_EMAIL` e execute `npm run admin:grant` em um processo seguro com
acesso ao banco. Essa autorização não é concedida pelo cadastro de funcionários.
O login da plataforma usa também o identificador do restaurante da conta.

1. Entre em Restaurante e cadastre uma categoria e um produto (preço em centavos).
2. Cadastre uma mesa e clique **Vincular tablet**. O código aleatório aparece uma
   única vez, expira em 12 horas e substitui o vínculo anterior.
3. No tablet, abra Mesa e cole o código. O token é guardado em cookie HttpOnly;
   apenas seu hash fica no banco. Uma nova sessão tem conta e carrinho próprios.
4. Monte o carrinho e confirme. O servidor confere preços, tenant e disponibilidade.
   Repetir o mesmo envio não duplica pedidos. O carrinho é local, por sessão da mesa.
5. Entre na Cozinha com um funcionário de perfil KITCHEN e avance recebido → preparo
   → pronto. Atendente ou gerente confirma a entrega. Somente a gerência cancela
   pedidos ainda não iniciados.
6. Conta mostra o consumo real, excluindo cancelados. Dividir calcula uma estimativa
   exata em centavos, mas não cria parcelas ou pagamentos.

Recursos (categorias, produtos, mesas, tablets e terminais) ficam em `Resource`, com
schemas Zod específicos por módulo e acesso sempre limitado ao restaurante da sessão.
Pedidos e vínculos têm FKs compostas por restaurante e snapshots imutáveis dos itens.
Tablets não conseguem escolher um restaurante via corpo ou parâmetro.
A chave de repetição e os locks de transação serializam envios concorrentes.
A API valida origem em mutações. Configure origens exatas; não use curingas.

## Atualizações e permissões

As telas de pedidos usam SSE autenticado com revalidação a cada heartbeat, reconexão
a cada 20 segundos e consulta de recuperação a cada 3 segundos. O banco é a fonte
das mudanças, portanto múltiplas instâncias compartilham os mesmos pedidos.
Se o provedor não suportar streaming, a consulta periódica mantém a atualização.
A compatibilidade de SSE no Netlify publicado ainda precisa ser verificada.

Proprietários/gerentes gerenciam catálogo e equipamentos. Funcionários têm operações
limitadas pelo papel; funcionários de cozinha não alteram catálogo nem marcam entrega.
Todas as APIs administrativas verificam `User.platformAdmin`. Cada página privada
administrativa também verifica essa autorização no servidor; login é público.

## Publicação

O `netlify.toml` da raiz publica todos os ambientes como caminhos no site existente.
Não é necessário criar quatro sites para acessar os painéis. Configure no Netlify
`DATABASE_URL`, `APP_ORIGIN` com a URL HTTPS real e `COOKIE_SECURE=true`.

Para sites independentes, use as configurações em `infra/netlify.*.toml` como valores
na configuração de cada projeto Netlify; esses arquivos não são selecionados
automaticamente pela raiz. Base de instalação: raiz. Package directory: `apps/<app>`.
Build: `npm run db:generate:portable && npm run build --workspace=@zappy/<app>`.
Publish: `apps/<app>/.next`. Ative a integração Next.js do Netlify.
Configure `API_ORIGIN=https://api.zappy.com.br` no build/runtime de cada frontend;
os frontends fazem proxy de `/api` para a API, mantendo cookies restritos ao host.
API precisa de `DATABASE_URL`, `APP_ORIGIN` e `APP_ORIGINS` com os quatro hosts exatos.
Admin também precisa de `DATABASE_URL` para a autorização server-side.

Associe `mesa.zappy.com.br`, `restaurante.zappy.com.br`, `cozinha.zappy.com.br`,
`admin.zappy.com.br` e `api.zappy.com.br` aos projetos e siga os registros DNS
indicados pelo Netlify. DNS, certificados e publicação nesses hosts não foram
executados, pois dependem da conta e do domínio. Nenhum endereço Windows é usado.

Aplique migrations antes do novo deploy. Para quem usa apenas o SQL Editor do Neon:

- Banco vazio: `deploy/neon-initial-setup.sql`.
- Base inicial já instalada: `deploy/neon-operations-upgrade.sql`.

Execute um arquivo inteiro por vez, no banco usado pelo Netlify. Não execute ambos.
Os arquivos registram os checksums no histórico Prisma. Para futuras versões,
use `npm run db:migrate`; o gerador `node scripts/sql-editor.mjs` serve para preparar
artefatos SQL revisáveis e não executa nada no banco.

## O que ainda depende de implementação/integração

- Terminais são um inventário real; não há comunicação homologada com maquininha.
  A interface `TerminalProvider` prevê Pix, crédito e débito. Nenhum adaptador falso
  é ativado; criar cobrança retorna indisponível. Webhooks, estornos, liquidação e
  reconciliação dependem do provedor escolhido e de credenciais de sandbox.
- Conta agrega consumo por sessão. Divisão é simulação; liquidação, fechamento e
  divisão persistente por pessoa continuam pendentes.
- Planos/assinaturas são cadastros administrativos reais, sem cobrança recorrente
  nem bloqueio automatizado por inadimplência. Configurações da plataforma são
  registros de referência; não alteram infraestrutura.
- Relatórios são totais por estado de pedido, sem exportação ou filtros de período.
  Listagens têm limites explícitos (200 pedidos, 500 recursos); paginação está pendente.
- Tablets têm inventário e vínculo por mesa; telemetria, MDM e pareamento físico de
  terminais não estão implementados. Pedidos offline não são enviados automaticamente.
- Funcionários podem ser criados com senha inicial; convites e recuperação de senha
  ainda não estão implementados. Arquivamento é reversível pelo responsável técnico;
  reativação ainda não tem interface.

Estas limitações estão visíveis nas respectivas páginas. O conjunto não deve ser
apresentado como uma plataforma de pagamentos pronta para produção.
