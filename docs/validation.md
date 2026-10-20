# Evidências de validação — 20/10/2026

Ambiente: Node 24.19.0, Next.js 16.4.2, Prisma 7.10.1, PostgreSQL 17 em Docker, Chromium instalado na máquina. Banco real e servidor iniciado a partir do build de produção, sem mocks de persistência.

## Aprovado

- `npm run typecheck`.
- `npm run build`.
- `npm test`: **4 testes passaram**, sem ignorados.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: **10 testes passaram**, sem ignorados. A suíte passou tanto no servidor do build de produção quanto no servidor de desenvolvimento.
- Migrações `202610200001_foundation` e `202610200002_session_identity` aplicadas pelo motor WASM oficial Prisma.
- Reexecução de migrações não aplica alterações já registradas.
- `/api/health`: HTTP 200, banco conectado.
- Servidor de desenvolvimento: login rejeita credenciais inválidas e página hidrata sem exceções JavaScript. CSP permite `unsafe-eval` apenas em desenvolvimento, conforme documentação Next.js.
- `.env` ignorado pelo Git; nenhuma senha/token incluído nos arquivos versionáveis.

Os testes de integração cobrem: endpoint de saúde e acesso anônimo negado; login pela interface; edição persistida e auditoria; logout; tentativa de trocar tenant; ausência de hashes nas respostas; bloqueio de CSRF; restrições do perfil cozinha; revogação de vínculo; expiração de sessão; suspensão de restaurante; login com restaurante incorreto; limitação concorrente de tentativas; layouts 1280×800, 1920×1200 e 390×844; criação administrativa e rollback em identidade duplicada.

As capturas de tela em `test-results/` contêm somente fixtures de teste e não dados operacionais. Fixtures removidas ao final da execução.

## Falhas diagnosticadas e corrigidas

- Cache npm fora da área gravável: instalação passou usando `/workspace/.npm-cache`.
- Campo restaurante incluía o texto de ajuda no nome acessível: separado em label e `aria-describedby`; o fluxo completo passou após a correção.
- Download Playwright bloqueado: o Chromium existente executou a suíte.

## Limitações que permanecem

- Download do motor nativo Prisma retorna HTTP 403 em `binaries.prisma.sh`. A inclusão do domínio foi salva no rascunho do ambiente; a rede atual não foi alterada por essa gravação.
- Geração e aplicação de migrações locais foram verificadas pelo caminho WASM. `prisma migrate dev`, CLI nativo e verificação automatizada de drift não foram validados. A tentativa de introspecção com o adapter WASM encontrou incompatibilidade com o tipo de catálogo PostgreSQL `char`; não foi tratada como sucesso nem incorporada ao setup.
- Não houve auditoria completa WCAG ou de segurança independente; os testes de layout/acesso não substituem essas avaliações.
- Não houve publicação, validação de restauração em nova tarefa, implantação externa, pagamento ou teste de hardware Android/POS.

O resultado valida a fundação descrita no README, não as fases posteriores do produto.

## Preparação de publicação (atualização)

- `npm run typecheck` e build standalone aprovados.
- `npm test`: **8 testes passaram** (quatro de fundação e quatro de configuração de hospedagem).
- Playwright: **10 testes passaram**, após reiniciar o PostgreSQL e o servidor de desenvolvimento; a tentativa anterior encontrou serviços parados, não foi considerada validação.
- Imagem `zappy:staging-candidate` construída, sem credenciais de banco durante build. A base Node está fixada por digest.
- Build Docker inicialmente rejeitou o certificado do proxy. Corrigido fornecendo a CA confiável existente como segredo temporário de build; TLS e checksums permaneceram habilitados.
- `npm run test:container` exercita uma rede e um banco PostgreSQL temporários, com CA de teste e credenciais aleatórias: startup seguro, usuário não-root, ausência de `.env`/testes na imagem, conexão TLS verificada, rejeição de certificado não confiável, login real, cookie Secure/HttpOnly, bloqueio de origem indevida, backup e restauração em banco vazio, recusa de restauração sobre dados existentes. Os recursos temporários são removidos ao final.
- O teste de imagem aplica os SQLs versionados no banco descartável. **Não valida o job nativo `prisma migrate deploy`**: o build do target `migrations` permanece bloqueado por HTTP 403 em `binaries.prisma.sh`, após verificar a cadeia TLS do proxy.
- `npm run release:check` retorna saída 1 **intencionalmente**, listando os módulos ausentes da plataforma completa. Não é um teste aprovado de release.
- Workflow GitHub Actions preparado, mas não executado no GitHub. Railway/DNS/backup gerenciado/monitoramento externo não configurados. Nenhum HTTPS público ou URL pública foi validado.

O teste local de backup/restauração prova a execução dos scripts em PostgreSQL TLS isolado; não comprova política automatizada, retenção, RPO/RTO ou recuperação do futuro provedor.
