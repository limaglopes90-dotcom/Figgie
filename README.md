# FIGGIE-OS 📟

Um blog que funciona como um **terminal antigo**: monitor CRT de fósforo âmbar, linhas de varredura, tela de boot, prompt `C:\BLOG>` e relógio.

Os visitantes podem **digitar comandos** ou simplesmente **clicar** nas opções sublinhadas e na barra `[F1]…[F6]`, então funciona também no celular.

Site 100% estático (HTML + CSS + JavaScript puro), sem build e sem dependências: funciona direto no **GitHub Pages**.

## Recursos

- Cada post ocupa a tela inteira, numa coluna de leitura confortável (bastante espaço para texto)
- Posts em **Markdown**: imagens com legenda, links, listas, citações e código
- Imagens aparecem "tingidas" de âmbar, como no monitor; ao clicar, abrem ampliadas com as cores originais
- Links numerados como num navegador de texto: `[1]`, `[2]`… (comando `link N`)
- **Navegador interno** com endereços `figgie://` (ex.: `abrir figgie://blog/bem-vindo`)
- Busca, etiquetas, post anterior/próximo, histórico de comandos (↑/↓) e TAB para completar
- Cada post tem endereço próprio para compartilhar: `seusite/#/blog/slug-do-post`

### Comandos

| Comando | O que faz |
|---|---|
| `inicio` | tela inicial |
| `posts` (`ls`, `dir`) | lista os posts |
| `ler N` / `ler nome` (`cat`, `type`) | abre um post |
| `proximo` / `anterior` | navega entre posts |
| `buscar palavra` | procura nos posts |
| `tags` / `tag nome` | etiquetas |
| `link N` | abre o link N da página |
| `abrir figgie://...` | navegador interno |
| `voltar` | página anterior |
| `links` / `sobre` | páginas fixas |
| `data`, `limpar`, `reiniciar`, `ajuda` | utilidades |

## Como publicar um post

1. Coloque as imagens em `posts/img/`
2. Abra `posts/posts.js` e copie um bloco `{ ... }` para o topo da lista
3. Edite `slug`, `title`, `date`, `tags`, `cover` (opcional) e o texto em `body`

```js
{
  slug: "minha-viagem",
  title: "Minha viagem",
  date: "2026-12-01",
  tags: ["viagens"],
  cover: "posts/img/praia.jpg",
  body: `
Texto do post com **negrito** e [um link](https://exemplo.com).

![Legenda da foto](posts/img/praia.jpg)
`
},
```

- Link para outro post: `[veja também](figgie://blog/outro-slug)`
- Links `https://` abrem numa aba nova do navegador de verdade
- Se precisar de uma crase dentro do texto, escreva `\``

## Onde editar o resto

| O quê | Arquivo |
|---|---|
| Posts | `posts/posts.js` |
| Texto "Sobre", lista de links e logo | `js/terminal.js` (topo do arquivo: `SOBRE_MD`, `LINKS`, `LOGO`) |
| Cores e efeitos do monitor | `css/style.css` (variáveis de cor no topo: `--fg`, `--bg`...) |

## Rodando localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando no GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → branch `main`, pasta `/ (root)`.

---

Desenvolvido por Júlia Quoos — [juliaroberta.com](https://juliaroberta.com)
