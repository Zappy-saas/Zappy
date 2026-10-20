# Rotas criadas

Cada rota abaixo existe fisicamente em `apps/<app>/src/app`, com uma montagem correspondente no site integrado. No aplicativo independente, remova o prefixo do ambiente.

**Funcional** significa interface conectada ao backend local validado; não significa publicação pública verificada.

## Mesa

| Rota no site integrado | Situação |
|---|---|
| `/mesa` | Funcional |
| `/mesa/cardapio` | Funcional |
| `/mesa/cardapio/[categoria]` | Funcional |
| `/mesa/produto/[id]` | Funcional |
| `/mesa/carrinho` | Funcional |
| `/mesa/pedido/confirmacao` | Funcional |
| `/mesa/pedidos` | Funcional |
| `/mesa/pedidos/[id]` | Funcional |
| `/mesa/conta` | Funcional |
| `/mesa/conta/dividir` | Parcial — limites descritos no guia do monorepo |
| `/mesa/pagamento` | Parcial — limites descritos no guia do monorepo |
| `/mesa/pagamento/aguardando` | Parcial — limites descritos no guia do monorepo |
| `/mesa/pagamento/resultado` | Parcial — limites descritos no guia do monorepo |
| `/mesa/atendimento` | Funcional |
| `/mesa/offline` | Funcional — recuperação manual; sem envio offline |

## Restaurante

| Rota no site integrado | Situação |
|---|---|
| `/restaurante` | Funcional |
| `/restaurante/login` | Funcional |
| `/restaurante/dashboard` | Funcional |
| `/restaurante/pedidos` | Funcional |
| `/restaurante/pedidos/[id]` | Funcional |
| `/restaurante/cardapio` | Funcional |
| `/restaurante/categorias` | Funcional |
| `/restaurante/produtos` | Funcional |
| `/restaurante/produtos/novo` | Funcional |
| `/restaurante/produtos/[id]/editar` | Funcional |
| `/restaurante/mesas` | Funcional |
| `/restaurante/mesas/[id]` | Funcional |
| `/restaurante/tablets` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/terminais` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/funcionarios` | Funcional |
| `/restaurante/financeiro` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/financeiro/transacoes` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/financeiro/contas` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/relatorios` | Parcial — limites descritos no guia do monorepo |
| `/restaurante/configuracoes` | Funcional |

## Cozinha

| Rota no site integrado | Situação |
|---|---|
| `/cozinha` | Funcional |
| `/cozinha/login` | Funcional |
| `/cozinha/pedidos` | Funcional |
| `/cozinha/pedidos/[id]` | Funcional |
| `/cozinha/preparo` | Funcional |
| `/cozinha/prontos` | Funcional |
| `/cozinha/historico` | Funcional |
| `/cozinha/configuracoes` | Funcional |

## Admin

| Rota no site integrado | Situação |
|---|---|
| `/admin` | Funcional |
| `/admin/login` | Funcional |
| `/admin/dashboard` | Funcional |
| `/admin/restaurantes` | Funcional |
| `/admin/restaurantes/novo` | Funcional |
| `/admin/restaurantes/[id]` | Funcional |
| `/admin/planos` | Parcial — limites descritos no guia do monorepo |
| `/admin/assinaturas` | Parcial — limites descritos no guia do monorepo |
| `/admin/dispositivos` | Parcial — limites descritos no guia do monorepo |
| `/admin/pagamentos` | Parcial — limites descritos no guia do monorepo |
| `/admin/usuarios` | Funcional |
| `/admin/auditoria` | Funcional |
| `/admin/configuracoes` | Parcial — limites descritos no guia do monorepo |

Também preservadas: `/login`, `/painel`, `/api/auth/login`, `/api/auth/logout`, `/api/restaurant`, `/api/members`, `/api/health`. APIs novas: `/api/v1/me`, `/api/v1/resources/:kind`, `/api/v1/orders`, `/api/v1/tables/:id`, `/api/v1/users`, `/api/v1/summary`, `/api/v1/audit`, `/api/v1/service-requests/:id`, `/api/v1/admin/:kind`, `/api/v1/events`, `/api/v1/mesa/{session,catalog,orders,bill,service,events,payments}`.

`/api/v1/mesa/payments` recusa cobranças com HTTP 503 enquanto não houver integração. Nenhum pagamento é simulado como real.

A conta é consumo em aberto, sem fechamento. Perfis de administração exigem concessão explícita. Veja [limitações e procedimentos](monorepo.md).
