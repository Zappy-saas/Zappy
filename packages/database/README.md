# Banco compartilhado

`prisma/` é a fonte canônica do schema e das migrations, preservadas na migração do monorepo. Não há links simbólicos: o checkout funciona também no Windows. Use os comandos `db:generate`, `db:migrate` e `db:seed` na raiz. Seeds são exclusivos de desenvolvimento.
