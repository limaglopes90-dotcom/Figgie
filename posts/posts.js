/*
 * ============================================================
 *  POSTS DO BLOG
 * ============================================================
 *  Para publicar um post novo, copie um bloco { ... } abaixo,
 *  cole no TOPO da lista e edite. Os posts aparecem ordenados
 *  pela data (mais recente primeiro).
 *
 *  Campos:
 *    slug   → endereço do post (sem espaços/acentos). Ex.: "minha-viagem"
 *             Fica acessível em figgie://blog/minha-viagem
 *    title  → título
 *    date   → "AAAA-MM-DD"
 *    tags   → lista de etiquetas (opcional)
 *    cover  → imagem de capa (opcional). Ex.: "posts/img/capa.jpg"
 *    body   → texto em Markdown, entre crases ( ` ).
 *
 *  Markdown aceito no body:
 *    # Título, ## Subtítulo, ### Seção
 *    **negrito**, *itálico*, `código`, ~~riscado~~
 *    [texto do link](https://exemplo.com)
 *    ![legenda da imagem](posts/img/foto.jpg)   ← imagem com legenda
 *    - item de lista   /   1. item numerado
 *    > citação
 *    ---  (linha divisória)
 *    ```  bloco de código  ```
 *
 *  Imagens: coloque os arquivos na pasta posts/img/
 *  Links para outros posts: [veja também](figgie://blog/outro-slug)
 *  Links externos (https://...) abrem numa aba nova do navegador real.
 * ============================================================
 */
window.FIGGIE_POSTS = [
  {
    slug: "bem-vindo",
    title: "Bem-vindo ao FIGGIE-OS",
    date: "2026-11-12",
    tags: ["novidades", "site"],
    cover: "posts/img/exemplo-terminal.svg",
    body: `
Este é o primeiro post do blog. O site inteiro funciona como um **terminal antigo**: dá para digitar comandos como \`posts\`, \`ler 2\` ou \`buscar links\` — ou simplesmente clicar nas opções sublinhadas.

## Como escrever posts

Os textos ficam no arquivo \`posts/posts.js\`, escritos em Markdown. Parágrafos longos ficam confortáveis de ler porque cada post ocupa a tela inteira, numa coluna de largura limitada.

Dá para colocar imagens com legenda:

![Uma paisagem de exemplo. A legenda vem do texto entre colchetes.](posts/img/exemplo-paisagem.svg)

E links de todos os tipos:

- Um link externo: [Wikipédia — Terminal de computador](https://pt.wikipedia.org/wiki/Terminal_(computa%C3%A7%C3%A3o))
- Um link para outro post: [Lista de links favoritos](figgie://blog/links-favoritos)
- Um link para uma página interna: [Tela inicial](figgie://home)

> Dica: clique em qualquer imagem para vê-la ampliada, com as cores originais.

---

Bons posts!
`
  },
  {
    slug: "links-favoritos",
    title: "Lista de links favoritos",
    date: "2026-11-10",
    tags: ["links"],
    body: `
Um exemplo de post feito só de links — ótimo para indicações, leituras da semana ou referências. Os links ganham números [1], [2]... e você também pode abrir com o comando \`link N\`.

### Leituras

1. [Internet Archive](https://archive.org) — a máquina do tempo da web
2. [Space Jam (1996)](https://www.spacejam.com/1996/) — um site original dos anos 90 ainda no ar
3. [Neocities](https://neocities.org) — hospedagem de sites pessoais no espírito retrô

### Ferramentas

- [Cool Retro Term](https://github.com/Swordfish90/cool-retro-term) — um terminal com efeito de monitor antigo
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/) — como formatar textos

Voltar para o [post de boas-vindas](figgie://blog/bem-vindo).
`
  }
];
