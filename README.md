# Um Caminho Até Você

Mini jogo 2D em pixel art feito para telas verticais e celulares.

## Como executar

Abra `index.html` no navegador ou, para servir localmente:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Controles

- Celular: botões direcionais, `PULAR` e `ROSA` na tela.
- Teclado: setas ou `A/D` para andar, espaço para pular e `X`, `K` ou Enter para disparar.

A fase possui oito corações. A personagem mantém sempre sua primeira roupa, enquanto cada coração evolui o poder das rosas, aumentando cadência, dano, quantidade de projéteis ou poder de perfuração. Ela possui poses próprias para correr, saltar e arremessar a rosa.

## Personalizar a carta

Edite o conteúdo do elemento `#letterText` em `index.html`. O texto atual é um placeholder até a mensagem final ser definida.
