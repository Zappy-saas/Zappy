# Zappy

**Seu pedido, sem espera.** Plataforma brasileira de autoatendimento para restaurantes.

Este repositório contém a **primeira etapa funcional (fundação)**. Não é o sistema completo nem está homologado para produção. O painel é conectado a PostgreSQL real, sem indicadores financeiros fictícios.

## Funciona nesta entrega

- Provisionamento transacional de restaurante e proprietário por comando administrativo.
- Login por restaurante, e-mail e senha; sessão opaca de oito horas em cookie HttpOnly/SameSite.
- Senhas derivadas com scrypt e salt individual; tokens de sessão armazenados apenas como SHA-256.
- Papéis proprietário, gerente, atendente, cozinha e caixa, com autorização no servidor.
- Isolamento pelo vínculo de sessão: o cliente não escolhe `restaurantId` nas operações.
- Painel responsivo com dados reais do estabelecimento, equipe autorizada, edição do nome e auditoria persistida.
- Suspensão de restaurante/revogação de vínculo invalida o acesso nas próximas requisições.
- Proteção de origem nas mutações, validação Zod, limite de corpo e rate limit de login compartilhado pelo banco.

**Ainda não implementados:** cardápio, pedidos, tablets, KDS, tempo real, contas, pagamentos, administração SaaS, convites, recuperação de senha e implantação de produção. Veja [as fases](docs/roadmap.md).

## Stack

Node.js 24, Next.js App Router, React, TypeScript, Tailwind CSS, componentes no padrão shadcn/ui com Radix, Lucide, Rethink Sans hospedada localmente, Prisma 7 e PostgreSQL 17. Dependências reproduzíveis em `package-lock.json`.

## Executar localmente

Pré-requisitos: Node 24, npm e Docker em execução. Não use o script local para um banco de produção.

```bash
npm ci
npm run setup:local
```

O setup cria `.env` somente se não existir, com uma senha aleatória para o PostgreSQL local. Inicia o container `zappy-postgres`, publica apenas `127.0.0.1:54329`, usa o volume `zappy-postgres-data`, gera o cliente Prisma e aplica migrações. Nunca sobrescreve `.env` ou apaga dados. O Docker e seu volume precisam continuar disponíveis após reiniciar o ambiente.

Na nuvem atual, o domínio de download dos motores nativos Prisma está bloqueado. A alternativa local testada usa os motores WASM oficiais e o gerador distribuídos pelo npm, mantendo verificação de integridade:

```bash
npm ci --cache /workspace/.npm-cache
PRISMA_PORTABLE=1 npm run setup:local
```

Esse caminho usa APIs internas Prisma, com versões exatas, e é restrito a migrações de desenvolvimento em loopback. Atualize esses pacotes em conjunto e execute os testes. Não substitui `prisma migrate dev` para criar novas migrações ou validar drift; essas operações requerem liberar `binaries.prisma.sh` na rede. Não use variáveis que ignorem checksums.

Crie uma conta de demonstração **explicitamente identificada como desenvolvimento**:

```bash
read -rsp 'Senha de desenvolvimento (mínimo 12 caracteres): ' SEED_PASSWORD
export SEED_PASSWORD
npm run db:seed
unset SEED_PASSWORD
npm run dev
```

Identificador: `zappy-demo`. E-mail: `proprietario@zappy.example`. A senha é a que você definiu; não há senha padrão. O seed não sobrescreve registros existentes. Acesse `/login` no servidor local. `APP_ORIGIN` deve corresponder exatamente à origem usada no navegador; o padrão é `http://localhost:3000`.

Para provisionar outro restaurante, configure `RESTAURANT_NAME`, `RESTAURANT_SLUG`, `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` no processo e execute `npm run admin:provision`. A senha deve ter 12–128 caracteres; o identificador aceita letras minúsculas, números e hífens. O comando exige acesso administrativo ao banco e recusa identidades existentes. Não recebe senhas pela linha de argumentos.

## Validar

```bash
npm run typecheck
npm test
npm run build
npm run start
# Em outro terminal, com o servidor e o PostgreSQL ativos:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Se não houver Chromium instalado, use `npx playwright install chromium` e omita `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. O download exige acesso aos domínios oficiais Playwright. Os testes de integração criam dois restaurantes com identificadores aleatórios e removem somente seus próprios dados. Use exclusivamente um banco de desenvolvimento/teste. Cada teste usa PostgreSQL e HTTP reais. Não há provedor de pagamento simulado nesta fase.

O endpoint `/api/health` consulta o banco; responde 200 quando acessível e 503 quando indisponível. Apenas uma porta aberta não prova que a aplicação está pronta.

## Estrutura

- `src/app`: páginas App Router e API REST.
- `src/components`: login, painel e componente Button.
- `src/lib`: banco, autenticação, senhas, permissões e validação HTTP.
- `prisma`: modelo de fundação e migrações SQL versionadas.
- `scripts`: setup local, provisionamento, seed e alternativa WASM de desenvolvimento.
- `tests`: testes unitários, API e navegador.
- `docs`: arquitetura, limites de segurança, implantação e próximos módulos.

## Marca

Paleta solicitada: vermelho `#FF3636`, preto `#121212`, branco, fundo `#F7F7F8`. A imagem enviada foi considerada referência, mas seu arquivo binário não está disponível no checkout. O cabeçalho usa o nome **Zappy em texto**, sem redesenhar ou declarar que reproduz a logo oficial. A incorporação do arquivo oficial permanece pendente.

Leia [arquitetura](docs/architecture.md), [segurança e implantação](docs/deployment.md) e [pagamentos](docs/payments.md) antes de ampliar o escopo.

O [pedido original](docs/product-brief.md) está preservado para orientar as próximas fases. Veja também as [evidências de validação](docs/validation.md).

## Preparação de publicação

A infraestrutura de staging está em [docs/publication.md](docs/publication.md). Inclui Docker standalone não-root, configuração Railway, validação de variáveis/TLS, scripts de backup/restauração e CI de verificação (sem publicação automática). Os domínios solicitados estão reservados no plano; **não há URLs públicas verificadas** e os módulos de mesa, cozinha e administração Zappy continuam pendentes.

```bash
# Build sem credenciais de banco:
docker build --target runtime -t zappy:staging-candidate .
# Teste local isolado de imagem, PostgreSQL TLS, login e backup/restauração:
npm run test:container
# Gate da plataforma completa; falha enquanto os módulos obrigatórios não existirem:
npm run release:check
```

No ambiente com proxy corporativo, fornecer a CA confiável como segredo temporário de build, sem incorporá-la à imagem:

```bash
BUILDX_CONFIG=/workspace/.cache/buildx docker build \
  --secret id=build_ca,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt \
  --target runtime -t zappy:staging-candidate .
```

Esse caminho de CA pertence a este ambiente; em outra máquina, use a CA real da organização somente se necessária. Nunca desative validação TLS. A imagem Docker é a unidade de implantação; não envie o diretório `.next` construído localmente com `.env` para a hospedagem.
