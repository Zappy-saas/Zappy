# Publicação Zappy — plano executável e bloqueios

## Status real

**Nenhuma URL foi publicada ou verificada na internet.** O responsável ainda não possui hospedagem definida. Não foram encontrados projeto de hospedagem, credenciais de deploy, PostgreSQL gerenciado, acesso DNS ou credenciais de pagamento no ambiente. O remoto GitHub responde às consultas, mas continua sem commits; o código desta tarefa está no checkout local.

Há uma fundação funcional do restaurante. Não há aplicações de mesa, cozinha ou administração da plataforma, cardápio, pedidos, conta digital ou tempo real. Portanto, o cenário mesa → cozinha → entrega → conta não pode ser validado. A primeira implantação possível é **staging restrito da fundação**, não a publicação completa descrita no pedido.

| Endereço solicitado (planejado, não publicado) | Variável | Situação |
| --- | --- | --- |
| mesa.zappy.com.br | TABLET_ORIGIN | Reservado; aplicativo/dispositivos ausentes |
| restaurante.zappy.com.br | RESTAURANT_ORIGIN e APP_ORIGIN | Código inicial disponível; hospedagem/DNS ausentes |
| cozinha.zappy.com.br | KITCHEN_ORIGIN | Reservado; KDS/tempo real ausentes |
| admin.zappy.com.br | PLATFORM_ORIGIN | Reservado; papel e aplicação de plataforma ausentes |
| api.zappy.com.br | API_ORIGIN | Backend REST de fundação existe junto ao Next; domínio separado não habilitado |

As variáveis dos módulos futuros são reservas validadas, **não fazem roteamento para aplicações inexistentes**. Não aponte os cinco domínios para o mesmo login e chame isso de quatro painéis publicados. Nenhum subdomínio confere privilégios.

## Hospedagem recomendada

Preparação inicial: **Railway, serviço Node persistente via Docker**, com PostgreSQL gerenciado que ofereça TLS com verificação de hostname/CA, backups automáticos, política de restauração e região próxima aos restaurantes. Railway é candidato de hospedagem da aplicação, não prova de que seu banco padrão atende todas essas exigências: confirmar o plano/serviço PostgreSQL ou contratar um provedor dedicado com esses recursos.

Manter o monólito modular existente evita uma separação artificial em quatro frontends. Um processo persistente pode receber futuramente SSE/WebSockets; o transporte, autorização, replay e reconexão ainda precisam ser implementados. Ao escalar para múltiplas instâncias, exigir outbox persistente e distribuição de eventos entre instâncias. Começar com uma réplica em staging.

Vercel é uma alternativa de frontend, mas não foi escolhida como servidor de WebSockets persistentes. Separá-la de um backend contínuo agora adicionaria duas implantações e autenticação entre origens sem haver fluxo operacional implementado. A imagem Docker permanece portátil para outro provedor.

Não há preço contratado ou estimativa numérica inventada. Antes de criar recursos pagos, comparar custo do processo sempre ativo, banco, armazenamento/PITR, egress, região, alertas e retenção. Não foi criado recurso faturável nesta tarefa.

## Preparação entregue

- `Dockerfile`: build multi-stage, saída Next standalone, runtime não-root, assets locais e healthcheck de banco. Sem `.env`, seed ou credenciais no contexto. Imagem separada `migrations` para job administrativo.
- `railway.json`: build Docker e healthcheck `/api/health`. Arquivo preparado localmente, não registrado em uma conta Railway.
- `deploy/runtime-config.mjs`: recusa HTTP, cookies inseguros, TLS de banco sem `verify-full`, segredos `NEXT_PUBLIC_*`, senhas de provisionamento no processo web e pagamentos reais habilitados.
- `deploy/hosted.env.example`: configuração de staging sem valores secretos. Produção usa os domínios solicitados, quando disponíveis, e outro banco/credenciais.
- `deploy/check-release.mjs`: bloqueia a declaração de release completa enquanto faltarem os módulos registrados em `deploy/release-readiness.json`.
- `deploy/backup.sh` e `deploy/restore-isolated.sh`: procedimentos com TLS, sem senha na linha de comando, sem substituir backup e sem restaurar sobre banco já ocupado.

O runtime não executa migrações, seed ou provisionamento no startup. Reiniciar uma réplica não pode disparar alterações de esquema ou criar usuários.

## Sequência de staging

1. Escolher/criar conta Railway (ou equivalente), projeto e região. Conectar o repositório privado e preservar/publicar o código local no GitHub antes de exigir build automático por commit. Ainda não houve commit/push nesta tarefa.
2. Criar ambiente **staging** e um banco separado do futuro banco de produção. Todos os módulos do mesmo ambiente compartilharão esse banco; não criar quatro bancos por painel.
3. Confirmar TLS verificado, rede, backup automático e recuperação do serviço escolhido. Criar papéis `zappy_migrator` (DDL no schema da aplicação) e `zappy_app` (DML necessário, sem superuser/CREATEDB/CREATEROLE). As permissões exatas dependem do serviço e devem ser aplicadas antes de implantar, não presumidas a partir do Docker de desenvolvimento.
4. Construir uma imagem imutável por commit/digest:

   ```sh
   docker build --target runtime -t REGISTRY/zappy:COMMIT .
   docker build --target migrations -t REGISTRY/zappy-migrations:COMMIT .
   ```

5. Injetar `DATABASE_URL` de migração em um **job isolado**, com TLS verificado, e executar o target `migrations` (`prisma migrate deploy`). A imagem não contém credenciais. O download nativo pode exigir `binaries.prisma.sh`; não ignorar checksum. Fazer backup antes de migrar um banco que já tenha dados. Nunca executar reset, db push ou seed nesse banco.
6. Registrar imagem/commit/digest, migrações aplicadas e resultado do job. Não iniciar versão nova se migrações falharem. O fallback WASM do desenvolvimento continua restrito a localhost e não deve ser ativado em produção.
7. No serviço web, injetar a URL do papel de aplicação e as variáveis do template. Para uma primeira URL fornecida pela hospedagem, usar essa origem HTTPS exata em APP_ORIGIN/RESTAURANT_ORIGIN; não inventar o hostname antes que o provedor o forneça.
8. Configurar porta do serviço conforme `PORT`, healthcheck, uma réplica, limite de recursos, timeout de drenagem de 30 segundos e restrição de acesso ao staging. Verificar no plano os controles de proxy para limite de corpo, taxa por IP e conexão lenta; não presumir que railway.json os configure.
9. Provisionar o proprietário via job administrativo, com uma senha forte fornecida por canal seguro. Não usar `db:seed`, `zappy-demo`, contas de teste nem senha padrão. Remover variáveis administrativas do job após uso; nunca injetá-las no web service.
10. Verificar HTTPS/cadeia, `/api/health`, login/saída, cookies Secure/HttpOnly/SameSite, permissões, tenant e auditoria. Os testes Playwright atuais são intencionalmente limitados ao banco local: **não os apontar para produção**. Criar validação de staging específica antes de testar operações remotas com contas reais.
11. Não abrir produção completa enquanto `npm run release:check` indicar módulos ausentes. Desenvolver e testar o fluxo operacional integral e todos os controles pendentes descritos em `docs/roadmap.md` e `docs/deployment.md`.

## DNS e HTTPS

Confirmar registro e titularidade de zappy.com.br. No provedor de hospedagem, adicionar somente o domínio do restaurante que corresponde ao serviço disponível. Copiar **o destino CNAME e/ou registro de verificação fornecido pelo provedor** para o DNS; este documento não inventa destinos nem endereços IP. Verificar conflitos, TTL e registros existentes antes de qualquer alteração. Não tocar em MX/TXT ou registros de serviços não relacionados.

Usar nomes separados para staging. Aguardar validação e emissão de certificado. Conferir redirect HTTP→HTTPS no edge, cadeia válida e hostname correspondente. Ativar HSTS no edge após confirmar HTTPS, inicialmente sem `includeSubDomains` porque os demais subdomínios ainda não foram implantados. Não anunciar URLs públicas até testar externamente cada uma.

No estágio atual, o navegador chama `/api` na mesma origem do restaurante. A API não emite `Access-Control-Allow-Origin: *`; mutações exigem a origem exata configurada. O hostname api é reservado para o futuro. Se uma API entre origens for necessária, implementar autenticação e CORS de allowlist explícita, preflight, cookies/CSRF e testes antes de ativá-la. Não ampliar a allowlist apenas para ocultar erros de autenticação.

## Backup, recuperação e manutenção

Política proposta para aprovação do negócio: backup diário, retenção de 30 dias e PITR com RPO alvo de 15 minutos quando suportado; RTO alvo de 2 horas, a comprovar em ensaio. Não são SLAs medidos nem recursos já ativados. Ativar alertas para backup atrasado/falho e testar restauração mensalmente em um banco isolado. Criptografar arquivos em armazenamento privado com acesso mínimo e retenção automatizada. Não enviar dumps a chat ou repositório.

Os scripts usam clientes PostgreSQL da mesma versão principal do servidor ou compatíveis. Configurar PGHOST, PGPORT, PGUSER, PGDATABASE, PGPASSWORD e PGSSLMODE=verify-full por canal seguro. Se houver CA privada, configurar PGSSLROOTCERT. Não desativar validação TLS.

```sh
# Banco de origem e credenciais configurados no ambiente seguro:
bash deploy/backup.sh /private/backups/zappy-UNIQUE.dump
# Em OUTRA sessão com credenciais de um banco isolado vazio:
RESTORE_CONFIRM=isolated-empty-database bash deploy/restore-isolated.sh /private/backups/zappy-UNIQUE.dump
```

Após restaurar, conferir contagens, constraints, migrações, login e isolamento. Medir tempo efetivo. Não trocar o serviço de produção para o banco restaurado sem um plano de cutover, reconciliação e autorização. Um dump legível não prova recuperabilidade.

Monitorar disponibilidade HTTPS, saúde de DB, latência, erros 5xx, tentativas 401/429, uso de conexões, storage e backups. Logs existentes são parciais; não há integração de observabilidade externa configurada. Acrescentar request IDs, retenção e alertas com responsáveis antes da operação comercial. Evitar registrar senhas, cookies, corpos de login e dados financeiros sensíveis.

Rollback: reter a imagem anterior por digest. Alterações de banco devem ser compatíveis com versões antiga/nova (expand/contract). Se uma migration for incompatível, não tentar rollback automático nem apagar migrações; preferir correção progressiva e, em incidente grave, recuperação isolada/PITR com aprovação e reconciliação. Nunca restaurar um dump sobre o banco ativo como primeiro passo.

## Pendências externas e de produto

- Conta/projeto/região de hospedagem e orçamento.
- Banco gerenciado com TLS, credenciais de aplicação/migração, backups e monitoramento efetivamente configurados.
- Código enviado ao repositório ou registry autorizado.
- Registro/controle DNS do domínio e certificados emitidos.
- Três interfaces ausentes e módulos operacionais do restaurante.
- Autorização própria de administrador Zappy, credenciais de dispositivos e eventos em tempo real recuperáveis.
- Provedor/terminal de pagamentos homologados, sandbox e webhooks. **Cobranças reais exigem autorização explícita futura** e seguem desabilitadas.

Só após remover esses bloqueios será possível entregar e verificar as cinco URLs públicas do pedido.

### Resultado da preparação local

Build e 18 testes de código/navegador passaram. A imagem do serviço web passou no ensaio de banco TLS e backup/restauração isolada descrito em `docs/validation.md`. O target de migrações nativas não pôde ser concluído: o proxy desta máquina retorna HTTP 403 para `binaries.prisma.sh`. A liberação desse domínio já está no rascunho das configurações do ambiente, mas ainda não foi aplicada à rede atual. Depois de liberá-lo, repetir o build do target `migrations` e testar `prisma migrate deploy` em banco de staging antes da publicação. Não publicar a aplicação contra banco sem migrações aplicadas.

A CI adicionada em `.github/workflows/verify.yml` verifica código e imagem, sem deploy/registry push. Sua execução remota depende de enviar o código ao repositório e habilitar Actions; não ocorreu nesta tarefa.
