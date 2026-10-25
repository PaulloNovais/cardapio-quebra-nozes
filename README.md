# Cardápio do dia · Quebra Nozes Doceria

Gerador do Story de cardápio diário (PNG 1080×1920) com a data de hoje.

**Usar:** abra o site, marque o que tem hoje, ajuste preços se precisar e toque em **Baixar PNG** (ou **Compartilhar** no celular, para mandar direto ao Instagram/WhatsApp).

- A data já vem com o dia atual (dá para trocar no campo *Data*).
- Alterações de itens, preços e categorias ficam salvas no próprio aparelho.
- **+ item** adiciona um produto na categoria; **+ nova categoria** cria uma categoria (ex.: TORTAS).
- *Etiqueta* mostra um selo pequeno ao lado da categoria (ex.: NOVIDADE). Deixe vazio para não mostrar.
- ↑ ↓ mudam a ordem das categorias no cardápio.

## Mudar o catálogo padrão (para todos os aparelhos)

Edite `catalogo.json` aqui no GitHub (ícone de lápis) ou, no site, use *Mais opções → Exportar catálogo* e substitua o arquivo. Quando o `catalogo.json` muda, ele passa a valer em todos os aparelhos.

```json
{
  "nome": "TORTAS",
  "etiqueta": "",
  "itens": [
    { "nome": "Limão", "preco": 14, "ativo": true }
  ]
}
```

`ativo: true` = já vem marcado.

Arquivos: `index.html` (tela), `app.js` (desenho da arte), `catalogo.json` (produtos e preços), `logo.png` (assinatura).
