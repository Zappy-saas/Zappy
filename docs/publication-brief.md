# ZAPPY — PUBLICAÇÃO COMPLETA EM PRODUÇÃO

Atue como engenheiro DevOps e desenvolvedor Full Stack sênior.

Sua missão é preparar e publicar todos os ambientes da plataforma Zappy na internet, utilizando o projeto já desenvolvido.

## OBJETIVO

Publicar quatro interfaces conectadas ao mesmo backend:

1. Painel da Mesa — para tablets dos clientes.
2. Painel do Restaurante — para proprietários e gerentes.
3. Painel da Cozinha — para recebimento e preparação de pedidos.
4. Administração Zappy — para gerenciamento geral da plataforma.

Todos os ambientes deverão funcionar simultaneamente e compartilhar informações em tempo real.

## 1. ARQUITETURA DE PUBLICAÇÃO

Organize a aplicação para utilizar:

- Frontend Next.js.
- Backend Node.js.
- PostgreSQL em ambiente de produção.
- Prisma ORM.
- Comunicação em tempo real.
- Certificados HTTPS.
- Variáveis de ambiente seguras.
- Domínios e subdomínios próprios.

Utilize preferencialmente uma arquitetura em monorepositório, caso seja adequada à estrutura existente.

Não crie quatro bancos de dados independentes.

Todos os ambientes deverão utilizar o mesmo sistema central, com isolamento de informações por restaurante.

## 2. ENDEREÇOS

Preparar configuração para os seguintes subdomínios:

- mesa.zappy.com.br
- restaurante.zappy.com.br
- cozinha.zappy.com.br
- admin.zappy.com.br
- api.zappy.com.br

Os endereços deverão ser configuráveis por variáveis de ambiente.

Não presumir que os domínios já estejam registrados ou que exista acesso às configurações de DNS.

## 3. PAINEL DA MESA

Publicar uma aplicação otimizada para tablets Android em modo quiosque.

Funcionalidades obrigatórias:

- Identificação segura da mesa.
- Cardápio digital.
- Carrinho.
- Pedidos.
- Acompanhamento.
- Conta digital.
- Divisão da conta.
- Pagamento integrado.
- Chamar atendente.

Cada tablet deve estar vinculado ao restaurante e à mesa correspondente.

A mesma aplicação publicada poderá atender diversos restaurantes.

A identificação não deverá depender exclusivamente de parâmetros modificáveis na URL.

## 4. PAINEL DO RESTAURANTE

Publicar o painel administrativo com autenticação e permissões.

Funcionalidades:

- Dashboard.
- Gestão de produtos.
- Gestão de categorias.
- Mesas.
- Pedidos.
- Funcionários.
- Dispositivos.
- Terminais de pagamento.
- Financeiro.
- Relatórios.
- Configurações.

Garantir isolamento entre restaurantes.

## 5. PAINEL DA COZINHA

Publicar um painel operacional acessível somente a funcionários autorizados.

Implementar:

- Pedidos em tempo real.
- Visualização dos produtos.
- Observações.
- Alteração de status.
- Fila de preparo.
- Notificação de novos pedidos.
- Reconexão automática.

Novos pedidos deverão aparecer sem necessidade de atualizar a página.

## 6. ADMINISTRAÇÃO ZAPPY

Publicar o painel central da empresa.

Implementar controle rigoroso de acesso.

Somente administradores autorizados da Zappy poderão acessar:

- Restaurantes cadastrados.
- Planos.
- Assinaturas.
- Dispositivos.
- Indicadores gerais.
- Logs de auditoria.
- Configurações globais.

Nunca conceder acesso administrativo com base apenas no subdomínio ou em dados manipuláveis pelo navegador.

## 7. BANCO DE DADOS DE PRODUÇÃO

Configurar PostgreSQL com:

- Conexão criptografada.
- Credenciais seguras.
- Migrations.
- Backups automáticos.
- Política de recuperação.
- Monitoramento.
- Isolamento de permissões.

Não utilizar SQLite ou dados armazenados apenas na memória como banco principal de produção.

Não executar comandos destrutivos contra dados existentes sem autorização.

## 8. SINCRONIZAÇÃO EM TEMPO REAL

Garantir o funcionamento do seguinte fluxo:

1. O cliente confirma o pedido na mesa 08.
2. O backend registra o pedido.
3. A cozinha recebe instantaneamente.
4. O restaurante visualiza o pedido.
5. A cozinha altera o status.
6. O tablet recebe a atualização.
7. A equipe confirma a entrega.
8. A conta da mesa é atualizada.

Utilizar comunicação em tempo real com mecanismos de reconexão, autenticação e recuperação de estado.

## 9. PAGAMENTOS

Preservar a integração planejada entre os tablets e as maquininhas.

Configurar separadamente credenciais sandbox e produção.

Nunca publicar credenciais sensíveis no frontend.

Não ativar cobranças reais antes de:

- Confirmar compatibilidade do terminal.
- Configurar o provedor.
- Validar webhooks.
- Executar testes.
- Concluir as homologações necessárias.
- Obter autorização explícita para ativação.

## 10. SEGURANÇA

Implementar:

- HTTPS.
- Autenticação.
- Autorização.
- Isolamento multi-tenant.
- Rate limiting.
- Headers de segurança.
- Gestão de segredos.
- CORS restrito.
- Logs.
- Monitoramento.
- Tratamento de erros.
- Proteção de rotas administrativas.

Não publicar dados de teste, senhas padrão ou credenciais demonstrativas em produção.

## 11. INFRAESTRUTURA

Analise a estrutura do projeto e selecione uma solução de hospedagem adequada.

Considere:

- Vercel para aplicações Next.js.
- Railway ou serviço equivalente para backend persistente.
- PostgreSQL gerenciado.

A decisão deve considerar:

- WebSockets.
- Custos.
- Escalabilidade.
- Segurança.
- Latência.
- Manutenção.
- Backups.

Não assumir que a mesma plataforma de hospedagem é adequada para todos os componentes.

## 12. PROCESSO DE DEPLOY

Execute as seguintes etapas:

1. Inspecionar o código.
2. Identificar as aplicações existentes.
3. Verificar scripts de build.
4. Executar testes.
5. Corrigir erros.
6. Configurar variáveis de ambiente.
7. Preparar migrations.
8. Configurar serviços.
9. Preparar domínios.
10. Publicar os ambientes em staging.
11. Validar o fluxo completo.
12. Preparar a publicação em produção.
13. Publicar somente com credenciais, permissões e autorizações necessárias.
14. Verificar HTTPS e disponibilidade.
15. Confirmar a comunicação entre os ambientes.

Caso faltem acessos à hospedagem, ao DNS ou a provedores, não invente uma publicação bem-sucedida.

Prepare a infraestrutura e documente exatamente o que falta.

## 13. RESULTADO ESPERADO

Ao final, apresentar:

- URL pública do tablet.
- URL pública do restaurante.
- URL pública da cozinha.
- URL pública da administração.
- URL da API.
- Status da publicação.
- Resultado dos testes.
- Configurações pendentes.
- Instruções de manutenção.
- Procedimento de backup e recuperação.

Somente apresentar uma URL como publicada após verificar que realmente está acessível.

## DIRETRIZ FINAL

A Zappy deverá funcionar como uma única plataforma profissional, com quatro interfaces públicas em endereços distintos e um backend central.

A interface da mesa deve funcionar em tablets.

O restaurante deve administrar sua operação.

A cozinha deve receber pedidos imediatamente.

A administração Zappy deve gerenciar todos os estabelecimentos autorizados.

Priorize segurança, estabilidade, desempenho e funcionamento real.

Comece analisando o repositório e prepare a publicação completa.