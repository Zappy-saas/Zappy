# ZAPPY — PROMPT MESTRE DE DESENVOLVIMENTO
## Sistema completo de autoatendimento, pedidos e pagamentos para restaurantes

# 1. OBJETIVO DO PROJETO

Você atuará como uma equipe de engenharia de software sênior, composta por especialistas em:

- Arquitetura de sistemas SaaS.
- Desenvolvimento Full Stack.
- UX/UI Design.
- Sistemas de automação comercial.
- Integrações com terminais de pagamento.
- Banco de dados e segurança.
- Aplicações para tablets Android.
- Gestão operacional de restaurantes.
- DevOps, testes e infraestrutura.

Sua missão é desenvolver a **Zappy**, uma plataforma brasileira de tecnologia para restaurantes que transforma mesas convencionais em pontos completos de autoatendimento.

## O que é a Zappy?

A Zappy é um ecossistema de software que conecta clientes, cozinha, salão, pagamentos e administração de restaurantes.

Cada mesa possui um tablet para o cliente realizar seus pedidos e uma maquininha de cartão integrada para efetuar pagamentos.

O sistema deve permitir que os clientes realizem praticamente toda a experiência de consumo sem depender de um garçom para anotar pedidos ou levar a conta.

A equipe do restaurante continuará responsável pelo preparo, entrega dos produtos, limpeza e atendimento quando necessário.

## Conceito da marca

**Zappy — Seu pedido, sem espera.**

### Objetivos principais

1. Reduzir tarefas repetitivas dos atendentes.
2. Agilizar a realização de pedidos.
3. Enviar pedidos instantaneamente para a cozinha.
4. Organizar o trabalho dos funcionários.
5. Digitalizar o consumo de cada mesa.
6. Automatizar o fechamento de contas.
7. Integrar pagamentos por Pix, crédito e débito.
8. Melhorar a experiência dos consumidores.
9. Centralizar a administração do restaurante.
10. Comercializar a plataforma como serviço por assinatura.

O objetivo não é criar apenas um site ou protótipo.

Desenvolva um produto funcional, seguro, escalável, preparado para operação real e comercialização.

---

# 2. ESTRUTURA COMPLETA DA PLATAFORMA

A Zappy deverá conter seis ambientes principais.

## Ambiente 1 — Tablet da mesa

Aplicação de autoatendimento utilizada pelo cliente.

Funcionalidades:

- Tela inicial.
- Cardápio digital.
- Busca de produtos.
- Categorias.
- Personalização dos pedidos.
- Carrinho.
- Confirmação de pedidos.
- Acompanhamento do preparo.
- Conta digital.
- Divisão de contas.
- Integração com a maquininha.
- Pagamentos.
- Chamar atendente.

## Ambiente 2 — Painel da cozinha

Sistema KDS (Kitchen Display System).

Funcionalidades:

- Recebimento de pedidos em tempo real.
- Organização da fila de preparo.
- Visualização de produtos.
- Observações.
- Início de preparo.
- Finalização de pedidos.
- Alertas de atraso.

## Ambiente 3 — Painel operacional

Utilizado por garçons, atendentes e responsáveis pelo salão.

Funcionalidades:

- Visualização das mesas.
- Pedidos em andamento.
- Pedidos prontos.
- Entregas pendentes.
- Solicitações de atendimento.
- Situação das contas.
- Pagamentos.
- Liberação de mesas.

## Ambiente 4 — Administração do restaurante

Utilizado por proprietários e gerentes.

Funcionalidades:

- Dashboard.
- Gestão do cardápio.
- Cadastro de mesas.
- Cadastro de tablets.
- Cadastro de maquininhas.
- Funcionários.
- Permissões.
- Gestão financeira.
- Relatórios.
- Configurações.

## Ambiente 5 — Administração geral Zappy

Painel exclusivo dos responsáveis pela plataforma.

Funcionalidades:

- Cadastro de restaurantes.
- Gestão de assinaturas.
- Gestão de planos.
- Monitoramento de dispositivos.
- Gestão de estabelecimentos.
- Indicadores da plataforma.
- Logs e auditoria.
- Controle de acesso.

## Ambiente 6 — Serviços de integração

Camada responsável pela comunicação com:

- Gateways de pagamento.
- Maquininhas.
- Serviços de notificação.
- Sistemas de autenticação.
- Serviços de armazenamento.
- Sistemas externos, futuramente.

Todos os ambientes devem compartilhar um backend centralizado, com dados isolados por restaurante.

---

# 3. TECNOLOGIAS E ARQUITETURA

Utilizar tecnologias modernas, estáveis e adequadas para um produto SaaS comercial.

## Frontend

- Next.js com App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui personalizado.
- Lucide Icons.
- Rethink Sans.

## Backend

- Node.js.
- TypeScript.
- APIs REST estruturadas.
- Prisma ORM.
- PostgreSQL.
- Zod.
- Autenticação segura.
- Autorização por papéis.

## Comunicação em tempo real

Utilizar WebSockets ou tecnologia equivalente confiável.

Atualizações em tempo real para:

- Novos pedidos.
- Mudanças de status.
- Pedidos prontos.
- Solicitações de atendimento.
- Pagamentos.
- Situação das mesas.
- Estado dos dispositivos.

## Infraestrutura

Preparar o sistema para:

- Ambientes de desenvolvimento, homologação e produção.
- Hospedagem em nuvem.
- Variáveis de ambiente.
- Logs estruturados.
- Monitoramento.
- Backups.
- Migrações de banco.
- Escalabilidade.
- Testes automatizados.
- Deploy contínuo.

Não utilizar bibliotecas desnecessárias.

Priorizar código organizado e manutenção simples.

Se já existir um projeto, inspecionar o repositório antes de alterar a arquitetura.

---

# 4. IDENTIDADE VISUAL

O design deve ser profissional, sofisticado, minimalista e original.

A Zappy deve transmitir a imagem de uma startup de tecnologia consolidada.

Não quero interfaces genéricas com aparência de aplicação gerada automaticamente por inteligência artificial.

## Identidade

Nome: Zappy.

Utilizar a logo oficial fornecida no projeto, quando disponível.

Não substituir a logo por símbolos genéricos ou gerar uma nova sem necessidade.

## Paleta de cores

Vermelho: #FF3636

Preto: #121212

Branco: #FFFFFF

Cinza de fundo: #F7F7F8

Cinza secundário: #71717A

Bordas: #E4E4E7

## Tipografia

Utilizar Rethink Sans.

Criar uma escala tipográfica consistente.

## Diretrizes

- Muito espaço em branco quando necessário.
- Alinhamentos precisos.
- Ícones discretos.
- Componentes padronizados.
- Botões bem dimensionados.
- Boa legibilidade.
- Hierarquia de informações.
- Animações suaves e úteis.
- Transições rápidas.
- Estados visuais consistentes.
- Interfaces adaptadas à finalidade de cada ambiente.

Evitar:

- Gradientes exagerados.
- Sombras artificiais.
- Excesso de cards.
- Bordas arredondadas em excesso.
- Emojis decorativos.
- Dashboards visualmente poluídos.
- Textos desnecessários.
- Dados fictícios apresentados como reais.
- Componentes sem funcionalidade.
- Interfaces copiadas integralmente de outros produtos.

O design deve seguir um sistema visual consistente, mas cada módulo deverá possuir uma organização apropriada à sua utilização.

---

# 5. TABLETS INSTALADOS NAS MESAS

Cada mesa do restaurante possuirá um tablet dedicado.

O tablet será o principal ponto de contato entre o cliente e a Zappy.

## Funcionamento

O tablet permanecerá instalado na mesa e configurado para executar exclusivamente o aplicativo.

Ele deverá permanecer vinculado ao restaurante e à mesa correspondente.

Exemplo:

Restaurante: Zappy Burger

Mesa: 08

Tablet: ZAPPY-T008

Terminal de pagamento: POS-008

## Modo quiosque

Implementar compatibilidade com modo quiosque.

O cliente não deverá conseguir:

- Acessar configurações administrativas.
- Alterar a mesa.
- Visualizar dados de outras mesas.
- Acessar informações de funcionários.
- Manipular valores.
- Encerrar processos internos.
- Utilizar o dispositivo fora das funções permitidas.

Para tablets Android, prever integração com mecanismos oficiais de gerenciamento de dispositivos e bloqueio de aplicativos.

Não depender apenas de uma página web para garantir o bloqueio do equipamento.

## Resoluções prioritárias

- 1280 × 800.
- 1920 × 1200.

Priorizar orientação horizontal, com interface touch-first.

A experiência deve ser confortável e intuitiva para diferentes faixas etárias.

---

# 6. TELA INICIAL DA MESA

Quando não houver interação, o tablet deverá exibir a interface inicial do restaurante.

## Conteúdo

- Logo do restaurante.
- Nome do estabelecimento.
- Número da mesa.
- Mensagem de boas-vindas.
- Botão para acessar o cardápio.
- Botão para visualizar a conta.
- Botão para chamar atendente.

Exemplo:

**Bem-vindo ao Zappy Burger**

Mesa 08

Escolha seus pratos favoritos e aproveite sua experiência.

Botão principal:

"Ver cardápio"

Botões secundários:

"Minha conta"

"Chamar atendente"

## Personalização

O restaurante poderá configurar:

- Logo.
- Imagem de capa.
- Nome.
- Mensagem de boas-vindas.
- Cor de destaque, dentro das regras do design system.

O tablet deverá continuar seguindo o padrão de usabilidade da Zappy.

---

# 7. CARDÁPIO DIGITAL

Desenvolver um cardápio digital completo e interativo.

## Elementos

- Categorias.
- Produtos.
- Imagens.
- Descrições.
- Valores.
- Informações sobre disponibilidade.
- Adicionais.
- Complementos.
- Observações.
- Carrinho.
- Busca de produtos.

## Categorias de exemplo

- Entradas.
- Pratos principais.
- Hambúrgueres.
- Pizzas.
- Bebidas.
- Sobremesas.
- Combos.

O restaurante poderá criar e organizar suas próprias categorias.

## Cadastro de produtos

Cada produto deverá possuir:

- Identificador.
- Restaurante.
- Categoria.
- Nome.
- Descrição.
- Imagem.
- Preço.
- Disponibilidade.
- Grupos de adicionais.
- Ordem de exibição.
- Status de publicação.

## Personalização dos pedidos

Permitir selecionar adicionais e complementos.

Exemplo:

Hambúrguer — R$ 39,90.

Adicionais:

- Bacon: R$ 5,00.
- Queijo: R$ 4,00.
- Molho: R$ 3,00.

Observação:

"Sem cebola."

O backend deverá calcular o valor final.

Não confiar em preços calculados exclusivamente pelo frontend.

## Produtos indisponíveis

O restaurante poderá desativar produtos temporariamente.

O cliente deverá visualizar a indisponibilidade.

Não permitir a confirmação de pedidos contendo itens indisponíveis.

---

# 8. CARRINHO

Desenvolver um carrinho funcional.

O cliente poderá:

- Adicionar produtos.
- Remover produtos.
- Alterar quantidades.
- Selecionar adicionais.
- Inserir observações.
- Visualizar valores.
- Confirmar o pedido.

## Confirmação

Exibir:

- Produtos.
- Quantidades.
- Adicionais.
- Observações.
- Subtotal.
- Total.
- Mesa.

Botão:

"Confirmar pedido"

Após a confirmação, enviar os dados para o backend.

O sistema deverá impedir pedidos duplicados causados por múltiplos cliques ou falhas de conexão.

---

# 9. SISTEMA DE PEDIDOS

Criar um mecanismo centralizado de gestão de pedidos.

## Fluxo

1. Cliente seleciona os produtos.
2. Confirma o pedido.
3. Backend valida os dados.
4. Pedido é registrado.
5. Pedido é associado à conta da mesa.
6. Cozinha recebe a solicitação.
7. Painel operacional é atualizado.
8. Cliente acompanha o andamento.

## Status

- Recebido.
- Em preparo.
- Pronto.
- Entregue.
- Cancelado.

O backend deverá controlar as transições válidas entre status.

O restaurante poderá configurar se o pedido deve ser pago antecipadamente ou se será cobrado ao final.

Para pagamento antecipado, enviar à cozinha conforme a confirmação exigida pela regra configurada.

---

# 10. PAINEL DA COZINHA

Desenvolver um KDS profissional para tablets e monitores.

## Informações por pedido

- Número do pedido.
- Mesa.
- Horário.
- Produtos.
- Quantidades.
- Adicionais.
- Observações.
- Tempo decorrido.
- Status.

## Funcionalidades

- Receber pedidos em tempo real.
- Iniciar preparo.
- Marcar pedidos como prontos.
- Organizar fila de produção.
- Consultar histórico.
- Identificar pedidos atrasados.

## Alertas

Permitir configurar metas de tempo.

Destacar pedidos que ultrapassarem o prazo configurado.

Evitar informações desnecessárias na interface da cozinha.

O foco é velocidade operacional.

---

# 11. PAINEL DOS ATENDENTES

Criar uma interface dedicada aos funcionários do salão.

## Visualização de mesas

Exibir estados como:

- Livre.
- Ocupada.
- Com pedido em preparo.
- Com pedido pronto.
- Aguardando pagamento.
- Aguardando liberação.

## Funcionalidades

- Consultar pedidos.
- Identificar pedidos prontos.
- Confirmar entregas.
- Receber solicitações.
- Acompanhar contas.
- Consultar pagamentos.
- Liberar mesas.

O estado da mesa deve ser separado do estado financeiro e do estado dos pedidos.

Uma mesa pode estar ocupada mesmo quando todos os pedidos foram entregues.

---

# 12. CHAMAR ATENDENTE

Criar um botão fixo e discreto no tablet.

Texto:

"Chamar atendente"

Ao selecionar, apresentar opções:

- Preciso de ajuda.
- Dúvida sobre o pedido.
- Solicitar limpeza.
- Problema no pagamento.
- Outra solicitação.

A solicitação deve aparecer no painel operacional.

Exibir:

- Mesa.
- Tipo.
- Horário.
- Status.
- Funcionário responsável, quando houver.

Permitir concluir a solicitação e registrar histórico.

---

# 13. CONTA DIGITAL DA MESA

Cada mesa deverá possuir uma sessão de consumo.

Todos os pedidos feitos durante a permanência dos clientes deverão ser associados à sessão ativa.

## Tela "Minha conta"

Mostrar:

- Identificação da mesa.
- Produtos pedidos.
- Quantidades.
- Adicionais.
- Valores.
- Subtotal.
- Descontos.
- Taxa de serviço, quando aplicável.
- Total.
- Valores pagos.
- Saldo restante.

## Exemplo

Mesa 08

2 hambúrgueres — R$ 79,80.

2 refrigerantes — R$ 17,80.

1 batata frita — R$ 24,90.

Subtotal — R$ 122,50.

Taxa de serviço — conforme configuração e informação prévia ao cliente.

Total — calculado pelo servidor.

A conta deve atualizar automaticamente quando novos pedidos forem confirmados.

## Pagamento ao final

O cliente poderá fazer vários pedidos e pagar somente quando desejar encerrar a conta.

O restaurante poderá configurar pagamento antecipado ou posterior.

---

# 14. FECHAMENTO DA CONTA

Criar o botão:

**"Fechar e pagar"**

Ao clicar:

1. Apresentar o resumo da conta.
2. Mostrar os valores detalhados.
3. Oferecer divisão da conta.
4. Permitir escolher o método de pagamento.
5. Enviar a cobrança à maquininha integrada.
6. Aguardar confirmação.
7. Atualizar o saldo.
8. Encerrar a conta após quitação integral.

Bloquear alterações concorrentes que possam comprometer o cálculo financeiro.

---

# 15. DIVISÃO DA CONTA

Implementar três modalidades.

## Divisão igualitária

Exemplo:

Conta: R$ 240,00.

Pessoas: 3.

Cada pessoa paga R$ 80,00.

Calcular corretamente divisões com centavos.

## Divisão por consumo

Permitir que cada pessoa selecione os itens que deseja pagar.

O sistema deverá controlar quantidades e impedir a cobrança duplicada dos mesmos itens.

## Pagamento parcial

O cliente poderá definir um valor parcial.

Exemplo:

Conta: R$ 200,00.

Primeiro pagamento: R$ 50,00.

Saldo: R$ 150,00.

O saldo deverá ser atualizado somente depois da confirmação da transação.

---

# 16. INTEGRAÇÃO COM MÁQUINA DE CARTÃO

ESTE É UM REQUISITO FUNDAMENTAL DA ZAPPY.

Cada mesa deverá possuir uma máquina de cartão física integrada ao sistema do tablet.

O tablet será responsável por iniciar o pagamento.

A máquina será responsável por processar a transação por meio do provedor contratado.

## Formas de pagamento

- Pix.
- Crédito.
- Débito.
- Aproximação NFC, quando suportada.
- Chip e senha, quando suportados.

## Fluxo de pagamento

1. Cliente abre a conta no tablet.
2. Seleciona "Fechar e pagar".
3. Escolhe a forma de pagamento.
4. O backend cria uma intenção de cobrança.
5. O backend identifica a maquininha vinculada à mesa.
6. Envia o valor e a referência da transação ao provedor.
7. A máquina apresenta a cobrança.
8. O cliente realiza o pagamento.
9. O provedor processa a operação.
10. O backend recebe a confirmação.
11. O sistema valida a transação.
12. O tablet exibe o resultado.
13. A conta é atualizada.
14. O painel financeiro registra o recebimento.

## Pix pela maquininha

Quando o provedor e o equipamento suportarem Pix integrado:

- Enviar solicitação de Pix.
- Apresentar cobrança no terminal.
- Permitir pagamento pelo aplicativo bancário.
- Confirmar a transação pelo provedor.
- Atualizar o saldo da mesa.

Não presumir que toda máquina com Pix permite acionamento remoto por API.

## Crédito e débito

O cliente deverá conseguir pagar usando os métodos oferecidos pelo equipamento homologado.

Quando o pagamento exigir autenticação por senha, o PIN deve ser digitado exclusivamente no equipamento seguro.

Nunca coletar senhas de cartão no tablet.

## Integrações a avaliar

Investigar documentação oficial atual de:

- Mercado Pago Point.
- Stone.
- Cielo.

Identificar:

- Modelos compatíveis.
- APIs disponíveis.
- SDKs disponíveis.
- Requisitos comerciais.
- Credenciais.
- Possibilidade de acionamento externo.
- Suporte ao Pix.
- Suporte a crédito e débito.
- Processo de homologação.
- Restrições de rede e hardware.

Não inventar endpoints ou funcionalidades.

Escolher uma integração inicial tecnicamente comprovada.

Se o equipamento físico for necessário para validação, documentar essa dependência.

---

# 17. ARQUITETURA DE PAGAMENTOS

Criar uma camada desacoplada de provedores.

Exemplo conceitual:

PaymentProvider

Métodos:

- createPayment()
- getPaymentStatus()
- cancelPayment()
- refundPayment()
- getTerminalStatus()

As interfaces definitivas devem refletir as capacidades reais dos provedores.

Não presumir suporte universal para todos os métodos.

## Modelo de pagamentos

Registrar:

- Restaurante.
- Mesa.
- Sessão.
- Conta.
- Valor.
- Método.
- Provedor.
- Terminal.
- Identificador externo.
- Status.
- Data de criação.
- Data de confirmação.
- Histórico de eventos.

## Estados

- Criado.
- Aguardando terminal.
- Aguardando cliente.
- Processando.
- Aprovado.
- Recusado.
- Cancelado.
- Estornado.
- Confirmação pendente.

## Segurança

- Webhooks autenticados.
- Idempotência.
- Controle de concorrência.
- Valores calculados pelo backend.
- Registro de eventos.
- Conciliação.
- Tratamento de transações desconhecidas.
- Proteção contra cobranças repetidas.

Não repetir automaticamente uma cobrança quando o resultado for desconhecido.

Primeiro consultar o provedor e reconciliar a operação.

---

# 18. ASSOCIAÇÃO ENTRE TABLET E MAQUININHA

Criar um sistema de vínculo entre dispositivos físicos.

Exemplo:

Restaurante: Zappy Burger.

Mesa: 08.

Tablet: TABLET-008.

Maquininha: POS-008.

A cobrança iniciada no tablet da mesa 08 deve ser direcionada exclusivamente à maquininha correspondente.

## Gestão dos terminais

O restaurante poderá:

- Cadastrar terminal.
- Vincular terminal à mesa.
- Consultar status disponível.
- Consultar último contato.
- Visualizar pagamentos.
- Desvincular terminal.
- Substituir terminal.

O sistema deve impedir cobranças direcionadas ao terminal de outra mesa ou restaurante.

Se a máquina estiver indisponível, apresentar uma mensagem clara e permitir solicitar atendimento.

Não simular confirmação de pagamentos.

---

# 19. PAGAMENTOS SEPARADOS NA MESMA MESA

Permitir múltiplos pagamentos para uma única conta.

Exemplo:

Conta total: R$ 300,00.

Pessoa 1 paga R$ 100,00 no crédito.

Pessoa 2 paga R$ 100,00 no débito.

Pessoa 3 paga R$ 100,00 no Pix.

Após cada confirmação, atualizar o saldo.

O backend deverá impedir que pagamentos simultâneos ultrapassem o valor devido.

Manter histórico individual de cada transação.

---

# 20. ENCERRAMENTO DA MESA

Após a quitação integral:

1. O backend confirma saldo zero.
2. A conta é encerrada.
3. O painel operacional é atualizado.
4. A equipe confirma a liberação física da mesa.
5. A sessão é finalizada.
6. O tablet remove dados temporários do cliente anterior.
7. O aplicativo retorna à tela de boas-vindas.

Não apagar o histórico financeiro ou operacional do banco de dados.

Novos clientes não poderão consultar pedidos anteriores.

---

# 21. DASHBOARD DO RESTAURANTE

Criar um dashboard administrativo moderno, com métricas reais.

## Indicadores

- Pedidos do dia.
- Faturamento do dia.
- Ticket médio.
- Mesas ocupadas.
- Pedidos em preparo.
- Pedidos finalizados.
- Contas abertas.
- Pagamentos pendentes.
- Produtos mais vendidos.
- Tempo médio de preparo.

## Relatórios

Criar filtros por:

- Hoje.
- Ontem.
- Últimos 7 dias.
- Últimos 30 dias.
- Intervalo personalizado.

Utilizar valores efetivamente calculados a partir do banco.

Distinguir vendas, recebimentos, taxas, estornos e valores pendentes.

---

# 22. GESTÃO DO RESTAURANTE

Criar módulos completos de administração.

## Cardápio

- Criar categorias.
- Criar produtos.
- Editar preços.
- Fazer upload de imagens.
- Configurar adicionais.
- Configurar disponibilidade.
- Ordenar produtos.

## Mesas

- Cadastrar mesas.
- Editar identificação.
- Consultar sessões.
- Vincular tablets.
- Vincular terminais.
- Consultar situação operacional.
- Liberar mesas.

## Funcionários

Perfis:

- Proprietário.
- Gerente.
- Atendente.
- Cozinha.
- Caixa.

Implementar controle de permissões por função.

## Configurações

Permitir configurar:

- Dados do restaurante.
- Horário de funcionamento.
- Identidade visual.
- Taxa de serviço.
- Modelo de pagamento.
- Tempo esperado de preparo.
- Informações financeiras.
- Preferências operacionais.

---

# 23. PAINEL ADMINISTRATIVO ZAPPY

Criar uma área exclusiva dos administradores da empresa.

## Restaurantes

- Cadastrar estabelecimento.
- Consultar dados.
- Ativar ou suspender serviço.
- Gerenciar planos.
- Consultar assinaturas.
- Consultar dispositivos vinculados.
- Acompanhar status dos serviços.

## Planos

Preparar uma estrutura de SaaS com planos configuráveis.

### Essencial
- Cardápio.
- Pedidos.
- Tablets.
- Cozinha.

### Profissional
- Tudo do Essencial.
- Conta digital.
- Pagamentos integrados.
- Relatórios financeiros.

### Avançado
- Tudo do Profissional.
- Relatórios avançados.
- Recursos administrativos adicionais.
- Expansões futuras.

As funcionalidades e os valores deverão ser configuráveis.

## Indicadores da Zappy

- Restaurantes ativos.
- Restaurantes em implantação.
- Assinaturas ativas.
- Receita recorrente mensal.
- Dispositivos conectados.
- Situação dos serviços.
- Incidentes operacionais.

Separar financeiramente a receita da Zappy do faturamento de seus clientes.

---

# 24. BANCO DE DADOS

Utilizar PostgreSQL e Prisma.

Criar entidades e relacionamentos para:

- Restaurants.
- Users.
- RestaurantMemberships.
- Roles.
- Permissions.
- Tables.
- Devices.
- PaymentTerminals.
- TableSessions.
- Categories.
- Products.
- ModifierGroups.
- ModifierOptions.
- Orders.
- OrderItems.
- OrderItemModifiers.
- ServiceRequests.
- Bills.
- BillItems.
- Payments.
- PaymentAllocations.
- PaymentEvents.
- Refunds.
- Plans.
- Subscriptions.
- AuditLogs.

Criar índices, constraints e migrations.

## Regras importantes

- Isolamento por restaurante.
- Histórico de preços.
- Valores monetários em centavos inteiros.
- Integridade referencial.
- Transações financeiras atômicas.
- Controle de concorrência.
- Auditoria de alterações relevantes.
- Idempotência nos pedidos e pagamentos.

---

# 25. MULTI-TENANCY

A Zappy será utilizada por diferentes restaurantes.

O sistema deverá garantir isolamento entre estabelecimentos.

Nenhum restaurante poderá:

- Acessar funcionários de outro.
- Consultar pedidos de outro.
- Visualizar pagamentos de outro.
- Controlar tablets de outro.
- Direcionar cobranças para terminais de outro.
- Modificar cardápios de outro.

Validar permissões no backend.

Não confiar somente nas restrições de interface.

---

# 26. SEGURANÇA

Implementar:

- Autenticação segura.
- Autorização por função.
- Validação de entradas.
- Proteção de APIs.
- Rate limiting.
- Proteção contra CSRF quando aplicável.
- Proteção contra injeção.
- Logs.
- Auditoria.
- Gerenciamento de segredos.
- Tratamento seguro de arquivos.
- Políticas de retenção.
- Boas práticas de LGPD.

## Segurança de pagamentos

- Não armazenar dados completos de cartões.
- Não capturar PIN.
- Validar eventos do provedor.
- Controlar pagamentos simultâneos.
- Impedir cobranças duplicadas.
- Registrar estornos.
- Proteger credenciais.
- Permitir conciliação financeira.

---

# 27. FUNCIONAMENTO EM CASO DE FALHA

Implementar tratamento para:

- Queda de internet.
- Tablet desconectado.
- Cozinha desconectada.
- Terminal indisponível.
- Pagamento recusado.
- Pagamento com confirmação pendente.
- Produto indisponível.
- Pedido duplicado.
- Alteração de preço.
- Falha de webhook.
- Dispositivo revogado.
- Falha de comunicação em tempo real.

O sistema deve reconectar automaticamente quando possível.

Nunca confirmar um pedido ou pagamento sem confirmação válida do backend.

Não executar novamente uma transação financeira sem verificar seu estado anterior.

---

# 28. EXPERIÊNCIA DO USUÁRIO

O cliente deverá conseguir utilizar o tablet sem treinamento.

## Princípios

**Simplicidade:** operações claras e previsíveis.

**Rapidez:** poucos toques para realizar pedidos.

**Confiabilidade:** estados reais e feedback imediato.

**Acessibilidade:** botões e textos legíveis.

**Consistência:** comportamento padronizado em toda a aplicação.

**Profissionalismo:** visual original e sem excesso de elementos.

## Estados de interface

Criar estados para:

- Carregamento.
- Lista vazia.
- Erro.
- Sem conexão.
- Confirmação.
- Pagamento pendente.
- Pagamento aprovado.
- Pedido recebido.
- Pedido pronto.

Não utilizar mensagens genéricas quando for possível oferecer uma orientação útil.

---

# 29. ESTRUTURA DE TELAS

Criar pelo menos as seguintes telas.

## Tablet

1. Boas-vindas.
2. Cardápio.
3. Categoria.
4. Detalhes do produto.
5. Personalização.
6. Carrinho.
7. Confirmação de pedido.
8. Acompanhamento.
9. Minha conta.
10. Dividir conta.
11. Escolher pagamento.
12. Aguardando maquininha.
13. Pagamento aprovado.
14. Pagamento recusado ou pendente.
15. Chamar atendente.

## Cozinha

1. Pedidos recebidos.
2. Em preparo.
3. Prontos.
4. Histórico.

## Operacional

1. Visão das mesas.
2. Pedidos.
3. Entregas pendentes.
4. Chamados.
5. Contas e pagamentos.

## Restaurante

1. Dashboard.
2. Cardápio.
3. Categorias.
4. Produtos.
5. Pedidos.
6. Mesas.
7. Tablets.
8. Maquininhas.
9. Funcionários.
10. Financeiro.
11. Relatórios.
12. Configurações.

## Zappy Admin

1. Visão geral.
2. Restaurantes.
3. Planos.
4. Assinaturas.
5. Dispositivos.
6. Indicadores.
7. Auditoria.
8. Configurações.

---

# 30. FLUXO COMPLETO QUE DEVE FUNCIONAR

Implementar e testar o seguinte cenário:

1. O administrador Zappy cadastra um restaurante.
2. O proprietário acessa o sistema.
3. Cadastra produtos e categorias.
4. Cadastra cinco mesas.
5. Vincula cinco tablets.
6. Vincula cinco terminais de pagamento.
7. Um cliente senta na mesa 03.
8. Acessa o cardápio pelo tablet.
9. Escolhe dois hambúrgueres.
10. Adiciona dois refrigerantes.
11. Confirma o pedido.
12. A cozinha recebe instantaneamente.
13. O cozinheiro inicia o preparo.
14. O tablet exibe o status.
15. O pedido fica pronto.
16. A equipe recebe a notificação.
17. O garçom entrega o pedido.
18. O cliente pede uma sobremesa.
19. O novo pedido integra a mesma conta.
20. O cliente abre "Minha conta".
21. Visualiza o consumo.
22. Seleciona "Fechar e pagar".
23. Escolhe dividir a conta entre duas pessoas.
24. A primeira pessoa escolhe crédito.
25. A Zappy envia a cobrança à maquininha da mesa 03.
26. O cliente paga na máquina.
27. A transação é confirmada pelo provedor.
28. A conta é atualizada.
29. A segunda pessoa escolhe Pix.
30. A máquina apresenta a cobrança Pix, quando suportado.
31. O pagamento é realizado.
32. A Zappy recebe a confirmação.
33. O saldo chega a zero.
34. A conta é encerrada.
35. O painel operacional recebe a informação.
36. O funcionário libera a mesa.
37. O tablet retorna à tela inicial.
38. O faturamento é registrado nos relatórios.

Todas as operações devem utilizar backend e banco de dados reais.

Para os testes de pagamento, utilizar inicialmente sandbox e simulações controladas de eventos, identificadas como testes.

A validação final do pagamento presencial dependerá de integração homologada e equipamento físico compatível.

---

# 31. TESTES

Criar testes automatizados.

## Pedidos

- Criar pedido.
- Modificar carrinho.
- Confirmar pedido.
- Impedir duplicidade.
- Atualizar status.

## Mesas

- Abrir sessão.
- Associar tablet.
- Associar maquininha.
- Consultar conta.
- Encerrar sessão.
- Liberar mesa.

## Pagamentos

- Iniciar cobrança.
- Selecionar terminal.
- Confirmar cobrança.
- Dividir conta.
- Registrar pagamento parcial.
- Tratar recusa.
- Tratar confirmação pendente.
- Processar webhook.
- Evitar pagamento duplicado.
- Processar estorno.
- Reconciliar transações.

## Segurança

- Impedir acesso entre restaurantes.
- Proteger operações financeiras.
- Validar permissões.
- Revogar dispositivos.

## Interface

- Testes responsivos.
- Navegação por toque.
- Estados de erro.
- Acessibilidade.
- Fluxos completos.

---

# 32. ETAPAS DE DESENVOLVIMENTO

Organize o desenvolvimento em fases.

## Fase 1 — Fundação

- Estrutura do projeto.
- Banco de dados.
- Autenticação.
- Controle de permissões.
- Design system.
- Multi-tenancy.

## Fase 2 — Administração do restaurante

- Cadastro de restaurante.
- Produtos.
- Categorias.
- Mesas.
- Tablets.
- Dispositivos.

## Fase 3 — Aplicativo do tablet

- Tela inicial.
- Cardápio.
- Produtos.
- Carrinho.
- Pedidos.

## Fase 4 — Cozinha e operação

- KDS.
- Atualizações em tempo real.
- Gestão de pedidos.
- Painel operacional.
- Chamados.

## Fase 5 — Conta digital

- Sessões.
- Consumo.
- Conta.
- Divisão.
- Fechamento.

## Fase 6 — Pagamentos

- Arquitetura dos provedores.
- Cadastro de terminais.
- Integração sandbox.
- Pix.
- Crédito.
- Débito.
- Webhooks.
- Conciliação.

## Fase 7 — Administração SaaS

- Painel Zappy.
- Restaurantes.
- Planos.
- Assinaturas.
- Métricas.

## Fase 8 — Qualidade e publicação

- Testes.
- Segurança.
- Responsividade.
- Acessibilidade.
- Monitoramento.
- Documentação.
- Preparação de produção.

Priorize fluxos completos e funcionais, em vez de muitas telas sem lógica implementada.

---

# 33. EXIGÊNCIAS PARA O CODEX

Antes de começar:

1. Inspecione os arquivos existentes.
2. Identifique a estrutura atual.
3. Defina a arquitetura.
4. Modele o banco de dados.
5. Descreva os principais fluxos.
6. Organize as etapas de implementação.

Durante o desenvolvimento:

- Escreva código real.
- Utilize TypeScript corretamente.
- Separe responsabilidades.
- Implemente validações.
- Trate erros.
- Evite código duplicado.
- Não crie funcionalidades fictícias.
- Não apresente telas vazias como concluídas.
- Não utilize dados falsos como se fossem operacionais.
- Não invente endpoints de provedores.
- Execute testes.
- Documente dependências.

Crie:

- README.
- Arquivo `.env.example`.
- Migrations.
- Scripts de execução.
- Configuração de banco.
- Dados demonstrativos apenas para desenvolvimento.
- Documentação das integrações.
- Instruções de implantação.

Ao final de cada fase, informe:

- O que foi implementado.
- Quais arquivos foram criados ou alterados.
- Quais testes foram executados.
- O que está funcional.
- O que depende de configuração externa.
- O que ainda está pendente.

Não declare o sistema pronto para produção sem validação adequada, especialmente em pagamentos e segurança.

---

# 34. DIRETRIZ FINAL

A Zappy deverá ser desenvolvida como um produto comercial de longo prazo.

O software precisa parecer uma solução profissional criada para restaurantes reais.

Quero que qualquer pessoa consiga sentar em uma mesa, utilizar o tablet, fazer pedidos e pagar pela maquininha sem dificuldade.

Quero que o cozinheiro receba os pedidos imediatamente.

Quero que os atendentes tenham controle de tudo que acontece no salão.

Quero que o proprietário consiga administrar seu restaurante e acompanhar seus resultados.

Quero que a administração Zappy consiga gerenciar vários estabelecimentos através de um único sistema SaaS.

**Não desenvolva somente um protótipo visual. Desenvolva funcionalidades reais e integradas.**

**Não utilize interfaces genéricas com aparência de IA. Crie um design original, consistente e comercialmente profissional.**

**Comece pela análise do projeto e implemente a primeira etapa funcional. Avance pelas etapas seguintes, executando testes e documentando as limitações reais de cada integração.**

## NOME OFICIAL DO PROJETO

**ZAPPY**

## POSICIONAMENTO

**Tecnologia que agiliza pedidos, conecta operações e simplifica pagamentos.**