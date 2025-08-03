# Leitor Visual

Uma aplicação web interativa que simula a leitura feita por leitores de tela, com foco em acessibilidade, personalização e exportação de conteúdo. Ideal para estudo, revisão e adaptação de textos para pessoas com deficiência visual ou necessidades específicas de leitura.

## 🧩 Funcionalidades

* 🔁 Leitura por **palavra** ou **frase**
* ⏮ **Voltar** e ⏭ **Avançar** manualmente conforme tipo de leitura selecionado
* 🎨 Destaque com **cor personalizada**
* ⏱ Tempo ajustável por unidade ou por palavra
* 🔼 **Scroll automático** durante a leitura
* ⏸ Botões de **Início / Pausa / Parar**
* 🔗 Atalhos de teclado para desktop *(ativados via checkbox nas configurações)*:

  * `Espaço`: Pausar/continuar
  * `Enter`: Iniciar (quando focado fora do editor)
  * `Esc`: Parar
  * `Ctrl + C`: Copiar
  * `Ctrl + S`: Exportar
* 📋 **Copiar conteúdo** como:

  * Markdown
  * Texto puro
* 📁 Suporte a arquivos `.txt`, `.md`, `.html`
* 💾 Armazenamento automático com `localStorage`
* 📤 Exportação como `.txt`, `.md` ou `.html`
* 🖥 Interface com **painel fixo** e área de leitura com rolagem
* ✅ Checkbox para ativar/desativar atalhos de teclado no desktop, facilitando a edição sem disparar ações indesejadas

## 🚀 Como usar

1. Clone o repositório:

```bash
git clone https://github.com/mlsfront/leitor-visual.git
cd leitor-visual
```

2. Abra o `index.html` no navegador, ou hospede com o GitHub Pages (veja abaixo).

## 🛠 Configurações Importantes

* Na seção **Configurações**, você encontrará um checkbox (visível apenas em telas maiores) chamado **"Ativar atalhos de teclado (Enter, Espaço, etc.)"**.
* Esse checkbox **ativa ou desativa** os atalhos de teclado no desktop, garantindo que você possa editar o texto livremente sem que as teclas disparem ações involuntárias.
* Em telas pequenas (celulares/tablets), o checkbox é desativado e oculto automaticamente, pois a navegação é feita via botões na interface, e os atalhos por teclado ficam desabilitados para melhor usabilidade.

## 🌐 GitHub Pages

Você pode usar diretamente via navegador:  
👉 [https://mlsfront.github.io/leitor-visual](https://mlsfront.github.io/leitor-visual)

## 📦 Estrutura do Projeto

```
.
├── assets
│   ├── favicon.ico
│   └── logo.png
├── css
│   └── styles.css
├── index.html
├── js
│   └── script.js
├── LICENSE
└── README.md
```

## 📜 Licença

Distribuído sob a licença [MIT](LICENSE).
