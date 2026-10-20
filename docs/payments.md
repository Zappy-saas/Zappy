# Integrações de pagamento — pendentes

Nenhum pagamento é executado nesta fase. Não há endpoints inventados, confirmação simulada, captura de cartão/PIN nem escolha de um provedor como homologado.

Antes da fase 6, consultar documentação oficial atual de Mercado Pago Point, Stone e Cielo e registrar, com fontes e data:

- Produto/API exatos e modelo de terminal homologado.
- Acionamento externo versus SDK no equipamento; fluxo exigido pelo contrato comercial.
- Métodos realmente disponíveis: crédito, débito e Pix; Pix no terminal não comprova acionamento via API.
- Pareamento com mesa/restaurante, cancelamento, estorno, consulta e tratamento de resultados desconhecidos.
- Autenticação de webhooks, idempotência, sandbox e homologação presencial.
- Restrições comerciais, de rede, hardware, credenciais e suporte.

A escolha inicial permanece aberta. Não foram solicitadas credenciais porque nenhuma operação de provedor está implementada. Os futuros testes sandbox devem ser identificados como testes. A validação final depende de conta habilitada e terminal físico compatível.

A futura abstração de provedores deverá declarar capacidades reais e recusar métodos não suportados. Nunca tentar uma cobrança novamente enquanto o resultado anterior for desconhecido; consultar e reconciliar primeiro. Somente eventos autenticados e confirmados pelo provedor poderão baixar o saldo.
