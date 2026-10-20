> Histórico do planejamento inicial. Para o estado atual de cada funcionalidade, consulte [o guia do monorepo](monorepo.md) e [as rotas](routes.md).

# Etapas e critérios de conclusão

## 1. Fundação — implementada nesta entrega

Autenticação, RBAC, escopo de tenant, persistência, interface de gestão inicial, migração, seed opcional e testes de segurança/API/navegador. Cadastro inicial de restaurante é administrativo por CLI. A aplicação não tem cadastro público.

## 2. Administração do restaurante — pendente

Categorias, produtos, adicionais, disponibilidade, upload seguro, mesas, tablets e associação de terminais. Finalizar quando um proprietário configurar cinco mesas e outro restaurante não puder acessar nenhum desses registros.

## 3. Tablet — pendente

Pareamento/revogação, boas-vindas, cardápio, carrinho e pedidos idempotentes calculados pelo backend. Uma página web não implementa bloqueio Android: modo quiosque exigirá Android Enterprise/Device Owner ou MDM homologado.

## 4. Cozinha e salão — pendente

Máquina de estados, KDS, entregas e chamados, com transporte em tempo real autenticado e recuperação após desconexão. Separar estado de mesa, pedido e conta.

## 5. Conta digital — pendente

Sessões, preços históricos em centavos, divisão com arredondamento determinístico, alocações por item, pagamento parcial, concorrência e liberação física posterior ao encerramento financeiro.

## 6. Pagamentos — pendente

Pesquisa oficial, escolha técnica, contrato/credenciais, sandbox, intenções, terminais, webhooks, reconciliação e estornos. Homologação física obrigatória antes de alegar operação presencial funcional.

## 7. Administração SaaS — pendente

Administradores da plataforma, planos configuráveis, assinaturas e métricas separadas do faturamento dos restaurantes.

## 8. Produção — pendente

Recuperação de senha e convites seguros, MFA administrativo, observabilidade, backup/restauração, proteção de borda, retenção LGPD, CI/CD, testes operacionais e revisão independente de segurança. Executar integralmente o cenário de 38 passos do pedido original.
