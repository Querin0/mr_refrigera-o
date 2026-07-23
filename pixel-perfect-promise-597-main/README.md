# MR Refrigeração e Elétrica — Painel de Gestão

Sistema de gestão de serviços de manutenção, elétrica e refrigeração: histórico de serviços por cliente, cadastro de clientes (com portal próprio), repositório de notas fiscais e feedbacks — com login de administrador e login de cliente.

Stack: **TanStack Start (React) + TypeScript + Tailwind CSS + Supabase**.

## Pré-requisitos

- Node.js 20+
- Uma conta e um projeto no [Supabase](https://supabase.com)

## Configuração

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Copie o arquivo de exemplo de variáveis de ambiente e preencha com os dados do seu projeto Supabase (**Settings → API** no painel do Supabase):
   ```sh
   cp .env.example .env
   ```

3. Aplique as migrations do banco de dados (dentro de `supabase/migrations`) no seu projeto Supabase — pela CLI (`supabase db push`) ou colando o SQL de cada arquivo, em ordem, no **SQL Editor** do painel do Supabase.

4. Crie o bucket de armazenamento `notas-fiscais` caso ele ainda não exista (a migration mais recente já cuida disso, mas confirme em **Storage** no painel).

5. Rode o projeto localmente:
   ```sh
   npm run dev
   ```
   O app sobe em `http://localhost:3000`.

## Build de produção

```sh
npm run build
```

Isso gera a saída em `.output/`. Por padrão o projeto está configurado com o alvo **Node.js** (`node-server`), então basta rodar:

```sh
node .output/server/index.mjs
```

em qualquer host que rode Node (VPS, Railway, Render etc.), com as mesmas variáveis de ambiente do `.env` configuradas na plataforma de hospedagem.

Para publicar em **Vercel** ou **Netlify**, ajuste o `target` em `vite.config.ts` (dentro de `tanstackStart({...})`) para `"vercel"` ou `"netlify"`, e configure as mesmas variáveis de ambiente do `.env.example` no painel da plataforma escolhida.

## Login de administrador

O e-mail definido como administrador único é fixado nas migrations do banco (`supabase/migrations`). Todo outro cadastro feito pelo formulário público vira automaticamente um login de "cliente", com acesso restrito aos próprios dados.

## Estrutura

- `src/routes` — páginas e rotas (TanStack Router baseado em arquivos)
- `src/integrations/supabase` — clientes Supabase (browser, servidor e admin) e tipos gerados do banco
- `supabase/migrations` — schema do banco, políticas de segurança (RLS) e bucket de storage
- `src/components` — componentes de UI reutilizáveis
