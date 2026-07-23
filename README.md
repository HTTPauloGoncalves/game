# Um Caminho Até Você

Mini jogo 2D em pixel art feito para telas verticais e celulares.

Bruna é a protagonista da jornada. Paulo espera por ela no final com a carta.

## Como executar

Abra `index.html` no navegador ou, para servir localmente:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Controles

- Celular: botões direcionais, `AGACHAR`, `PULAR` e `ROSA` na tela.
- Teclado: setas ou `A/D` para andar, seta para baixo ou `S` para agachar, espaço para pular e `X`, `K` ou Enter para disparar.

A fase possui oito corações. A personagem mantém sempre sua primeira roupa, enquanto cada coração evolui o poder das rosas, aumentando cadência, dano, quantidade de projéteis ou poder de perfuração. Ela possui poses próprias para correr, saltar, agachar e arremessar a rosa em pé ou agachada.

A corrida utiliza um ciclo fluido de seis etapas. Antes da carta, a personagem atravessa um portal e é teleportada para a Arena dos Espinhos, um mapa separado com plataformas em diferentes alturas. O chefe Coração de Espinhos possui 450 pontos de vida e uma segunda fase com ataques em leque. Após a vitória, outro portal devolve a personagem ao caminho da carta.

A personagem começa com 1 ponto de vida. Cada coração coletado aumenta a vida máxima, recupera 1 ponto e apresenta a evolução conquistada pela rosa. Golpes inimigos e quedas em buracos removem vida; ao chegar a zero, aparece uma mensagem romântica. Dentro da arena, é possível tentar novamente no chefe preservando os corações ou voltar ao início da jornada.

O cenário acompanha o avanço de Bruna com transição gradual do entardecer, pétalas ao vento, pássaros, borboletas, flores que se abrem e uma trilha de rosas próxima ao destino. A trilha e os efeitos sonoros são produzidos em tempo real com Web Audio. Os inimigos utilizam uma folha própria de sprites em pixel art, com animações de caminhada, voo, preparação de ataque, dano e pulsação do chefe.

## Personalizar a carta

Edite o conteúdo do elemento `#letterText` em `index.html`. A carta atual é a mensagem de Paulo para Bruna e conecta os sonhos do casal aos corações, rosas e desafios do jogo.
