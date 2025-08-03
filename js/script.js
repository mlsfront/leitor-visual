// ================================
// VARIÁVEIS GLOBAIS
// ================================
let intervalId = null;
let currentIndex = 0;
let spans = [];
let isPaused = false;
let totalUnits = 0;

// ================================
// UTILITÁRIOS DE TEXTO E PREPARAÇÃO
// ================================

/**
 * Separa o texto por palavra ou frase
 */
function splitText(mode, text) {
  if (mode === 'sentence') {
    return text.match(/[^.!?]+[.!?]?/g) || [text];
  } else {
    return text.split(/\s+/);
  }
}

/**
 * Prepara o texto, envolvendo as unidades em <span>
 */
function prepareText(container, mode) {
  spans = [];
  currentIndex = 0;
  const paragraphs = container.querySelectorAll('p');
  container.innerHTML = '';

  paragraphs.forEach(paragraph => {
    const originalText = paragraph.textContent.trim();
    if (!originalText) return;

    const units = splitText(mode, originalText);
    const p = document.createElement('p');

    units.forEach(unit => {
      const span = document.createElement('span');
      span.textContent = unit + (unit.match(/[.?!]$/) ? ' ' : ' ');
      span.dataset.index = spans.length;
      if (mode === 'sentence') span.dataset.unit = 'sentence';
      spans.push(span);
      p.appendChild(span);
    });

    container.appendChild(p);
  });

  totalUnits = spans.length;
}

/**
 * Atualiza a barra de progresso
 */
function updateProgressBar() {
  const progress = document.getElementById('progressBar');
  if (totalUnits > 0) {
    progress.value = Math.floor((currentIndex / totalUnits) * 100);
  } else {
    progress.value = 0;
  }
}

// ================================
// LEITURA VISUAL E CONTROLE
// ================================

/**
 * Aplica destaque e scroll ao item atual
 */
function applyHighlight(index, color) {
  spans.forEach(span => {
    span.classList.remove('highlight');
    span.style.backgroundColor = '';
  });

  const current = spans[index];
  if (current) {
    current.classList.add('highlight');
    current.style.backgroundColor = color;
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Inicia o loop de leitura visual
 */
function startIntervalLoop(color, baseInterval) {
  const userTimePerWord = parseInt(document.getElementById('timePerWord').value, 10) || 400;

  function run() {
    if (isPaused || currentIndex >= spans.length) {
      clearTimeout(intervalId);
      return;
    }

    applyHighlight(currentIndex, color);
    updateProgressBar();

    const currentSpan = spans[currentIndex];
    const unitText = currentSpan.textContent.trim();
    const wordCount = unitText.split(/\s+/).length;

    currentIndex++;

    let delay = baseInterval;
    if (currentSpan.dataset.unit === 'sentence') {
      delay = Math.max(wordCount * userTimePerWord, baseInterval);
    }

    intervalId = setTimeout(run, delay);
  }

  run();
}

/**
 * Lógica de avanço/retrocesso considerando frases ou palavras
 */
function getPreviousIndex(index) {
  const mode = document.getElementById('modeSelect').value;
  if (mode === 'sentence') {
    for (let i = index - 1; i >= 0; i--) {
      if (spans[i].dataset.unit === 'sentence') {
        return i;
      }
    }
    return 0;
  }
  return Math.max(0, index - 1);
}

function getNextIndex(index) {
  const mode = document.getElementById('modeSelect').value;
  if (mode === 'sentence') {
    for (let i = index + 1; i < spans.length; i++) {
      if (spans[i].dataset.unit === 'sentence') {
        return i;
      }
    }
    return spans.length - 1;
  }
  return Math.min(spans.length - 1, index + 1);
}

// ================================
// AÇÕES PRINCIPAIS (Iniciar, Pausar, Parar)
// ================================

function startReading() {
  stopReading();
  const color = document.getElementById('colorPicker').value;
  const baseInterval = parseInt(document.getElementById('intervalTime').value, 10);
  const mode = document.getElementById('modeSelect').value;

  const textEl = document.getElementById('text');
  prepareText(textEl, mode);
  updateProgressBar();
  isPaused = false;

  startIntervalLoop(color, baseInterval);
}

function pauseReading() {
  if (intervalId) {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Continuar' : '⏸';
    if (!isPaused) {
      const color = document.getElementById('colorPicker').value;
      const interval = parseInt(document.getElementById('intervalTime').value, 10);
      startIntervalLoop(color, interval);
    } else {
      clearInterval(intervalId);
    }
  }
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex = getPreviousIndex(currentIndex);
    applyHighlight(currentIndex, document.getElementById('colorPicker').value);
    updateProgressBar();
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIndex < spans.length - 1) {
    currentIndex = getNextIndex(currentIndex);
    applyHighlight(currentIndex, document.getElementById('colorPicker').value);
    updateProgressBar();
  }
});

function stopReading() {
  clearInterval(intervalId);
  isPaused = false;
  currentIndex = 0;
  spans.forEach(span => {
    span.classList.remove('highlight');
    span.style.backgroundColor = '';
  });
  updateProgressBar();
  document.getElementById('pauseBtn').textContent = '⏸';
}

// ================================
// MANIPULAÇÃO DE TEXTO & STORAGE
// ================================

/**
 * Salva o conteúdo editado no localStorage
 */
document.getElementById('text').addEventListener('input', () => {
  const paragraphs = [...document.querySelectorAll('#text p')]
    .map(p => p.textContent.trim())
    .filter(p => p);
  localStorage.setItem('reader_text', JSON.stringify(paragraphs));
});

/**
 * Copia o conteúdo como texto simples
 */
document.getElementById('copyBtn')?.addEventListener('click', () => {
  const plainText = [...document.querySelectorAll('#text p')]
    .map(p => p.textContent.trim())
    .join('\n\n');

  navigator.clipboard.writeText(plainText)
    .then(() => alert('Texto copiado com sucesso!'))
    .catch(() => alert('Erro ao copiar texto.'));
});

/**
 * 🔧 Copiar como Markdown:
 */
document.getElementById('copyMarkdownBtn').addEventListener('click', () => {
  const container = document.getElementById('text');
  let md = [];

  container.childNodes.forEach(node => {
    if (node.nodeType !== 1) return;

    switch (node.tagName.toLowerCase()) {
      case 'h1':
        md.push(`# ${node.textContent.trim()}`);
        break;
      case 'h2':
        md.push(`## ${node.textContent.trim()}`);
        break;
      case 'h3':
        md.push(`### ${node.textContent.trim()}`);
        break;
      case 'h4':
        md.push(`#### ${node.textContent.trim()}`);
        break;
      case 'hr':
        md.push(`---`);
        break;
      case 'ul':
        node.querySelectorAll('li').forEach(li => {
          md.push(`* ${li.textContent.trim()}`);
        });
        break;
      case 'p':
      default:
        md.push(node.textContent.trim());
    }
  });

  const cleanMd = md.filter(Boolean).join('\n\n');

  navigator.clipboard.writeText(cleanMd)
    .then(() => alert('📋 Markdown copiado com sucesso!'))
    .catch(() => alert('❌ Erro ao copiar.'));
});

/**
 * 🔧 Copiar como Texto Puro:
 */
document.getElementById('copyPlainBtn').addEventListener('click', () => {
  const container = document.getElementById('text');
  const text = [...container.querySelectorAll('p, h1, h2, h3, li')]
    .map(el => el.textContent.trim())
    .filter(Boolean)
    .join('\n\n');

  navigator.clipboard.writeText(text)
    .then(() => alert('📄 Texto copiado com sucesso!'))
    .catch(() => alert('❌ Erro ao copiar.'));
});

/**
 * Exporta como .txt
 */
function exportAsTxt() {
  exportTextFile('texto-exportado.txt', 'text/plain');
}

/**
 * Exporta como .md
 */
function exportAsMd() {
  const container = document.getElementById('text');
  let md = [];

  container.childNodes.forEach(node => {
    if (node.nodeType !== 1) return;

    switch (node.tagName.toLowerCase()) {
      case 'h1':
        md.push(`# ${node.textContent.trim()}`);
        break;
      case 'h2':
        md.push(`## ${node.textContent.trim()}`);
        break;
      case 'h3':
        md.push(`### ${node.textContent.trim()}`);
        break;
      case 'h4':
        md.push(`#### ${node.textContent.trim()}`);
        break;
      case 'hr':
        md.push(`---`);
        break;
      case 'p':
        md.push(node.textContent.trim());
        break;
      case 'ul':
        node.querySelectorAll('li').forEach(li => {
          md.push(`* ${li.textContent.trim()}`);
        });
        break;
      default:
        md.push(node.textContent.trim());
    }
  });

  const cleanMd = md.filter(Boolean).join('\n\n');

  const blob = new Blob([cleanMd], { type: 'text/markdown' });
  triggerDownload(blob, 'texto-exportado.md');
}

/**
 * Exporta como .html
 */
function exportAsHtml() {
  const bodyContent = document.getElementById('text').innerHTML;
  const includeCss = document.getElementById('includeStyle').checked;

  const css = includeCss ? `
    <style>
      body { font-family: sans-serif; line-height: 1.6; padding: 2rem; max-width: 720px; margin: auto; }
      h1, h2, h3 { margin-top: 1.5em; }
      p { margin-bottom: 1em; }
      ul { margin: 1em 0; padding-left: 1.5em; }
      li { margin-bottom: 0.5em; }
    </style>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Texto Exportado</title>
  ${css}
</head>
<body>
${bodyContent}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(blob, 'texto-exportado.html');
}

/**
 * Utilitário: gera e baixa o arquivo de texto
 */
function exportTextFile(filename, type) {
  const content = [...document.querySelectorAll('#text p')]
    .map(p => p.textContent.trim())
    .join('\n\n');
  const blob = new Blob([content], { type });
  triggerDownload(blob, filename);
}

/**
 * Utilitário: força download de um blob
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ================================
// ARQUIVO EXTERNO (.txt, .md, .html)
// ================================

document.getElementById('uploadText').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    let content = event.target.result;
    const ext = file.name.split('.').pop().toLowerCase();
    const container = document.getElementById('text');

    // Conversão por tipo
    if (ext === 'html') {
      if (ext === 'html') {
        const container = document.getElementById('text');
        container.innerHTML = content;

        // Após renderizar, opcionalmente salvar como texto plano
        const paragraphs = [...container.querySelectorAll('p, h1, h2, h3, li')]
            .map(el => el.textContent.trim())
            .filter(Boolean);

        localStorage.setItem('reader_text', JSON.stringify(paragraphs));
        return; // encerra, pois já renderizamos
        }
      temp.innerHTML = content;
      content = temp.textContent || '';
    }

    if (ext === 'md') {
    const container = document.getElementById('text');
    const renderedHTML = renderMarkdown(content);
    container.innerHTML = renderedHTML;

    const paragraphs = [...container.querySelectorAll('p, h1, h2, h3, li')]
        .map(el => el.textContent.trim())
        .filter(Boolean);

    localStorage.setItem('reader_text', JSON.stringify(paragraphs));
    return;
    }

    // Quebra em parágrafos legíveis
    const paragraphs = content
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p);

    container.innerHTML = '';
    paragraphs.forEach(p => {
      const para = document.createElement('p');
      para.textContent = p;
      container.appendChild(para);
    });

    // Salvar texto no localStorage
    localStorage.setItem('reader_text', JSON.stringify(paragraphs));
  };

  reader.readAsText(file);
});

// ================================
// INTERAÇÕES & EVENTOS
// ================================

document.getElementById('startBtn').addEventListener('click', startReading);
document.getElementById('pauseBtn').addEventListener('click', pauseReading);
document.getElementById('stopBtn').addEventListener('click', stopReading);
document.getElementById('clearStorageBtn').addEventListener('click', () => {
  localStorage.removeItem('reader_text');
  alert('Texto salvo foi apagado.');
  location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('modeSelect');
  const timeInputLabel = document.querySelector('label[for="timePerWord"]');

  if (modeSelect.value === 'word') {
    timeInputLabel.style.display = 'none';
  }
});

document.getElementById('modeSelect').addEventListener('change', (e) => {
  const isSentenceMode = e.target.value === 'sentence';

  document.getElementById('intervalTime').value = isSentenceMode ? 1350 : 400;

  const timeInputLabel = document.querySelector('label[for="timePerWord"]');
  const timeInput = document.getElementById('timePerWord');

  timeInput.value = isSentenceMode ? 400 : 0;
  timeInputLabel.style.display = isSentenceMode ? '' : 'none';
});

/**
 * Atalhos de teclado
 */
const enableKeyboardShortcuts = document.getElementById('enableKeyboardShortcuts');
const editor = document.getElementById('text');

document.addEventListener('keydown', (e) => {
  // Permitir atalhos somente se checkbox estiver marcado
  if (!enableKeyboardShortcuts.checked) {
    return; // não faz nada, deixa a edição livre
  }

  // Opcional: permitir editar normalmente dentro do editor, se quiser evitar conflito
  // const isEditing = editor.contains(document.activeElement);
  // if (isEditing) return;

  if (e.ctrlKey && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    document.getElementById('copyPlainBtn').click();
  } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    exportAsTxt();
  } else if (e.key === ' ') {
    e.preventDefault();
    pauseReading();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    startReading();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    stopReading();
  }
});

const checkbox = document.getElementById('enableKeyboardShortcuts');

function updateCheckbox() {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  checkbox.checked = !isMobile;
}

// Executa ao carregar a página
window.addEventListener('DOMContentLoaded', updateCheckbox);

// Atualiza ao redimensionar janela
window.addEventListener('resize', updateCheckbox);

/**
 * Carrega conteúdo salvo ao abrir
 */
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('reader_text');
  if (saved) {
    const paragraphs = JSON.parse(saved);
    const container = document.getElementById('text');
    container.innerHTML = '';
    paragraphs.forEach(p => {
      const para = document.createElement('p');
      para.textContent = p;
      container.appendChild(para);
    });
  }
});

/**
 * JavaScript – tratamento do select
 */
document.getElementById('exportSelect').addEventListener('change', (e) => {
  const format = e.target.value;

  switch (format) {
    case 'txt':
      exportAsTxt();
      break;
    case 'md':
      exportAsMd();
      break;
    case 'html':
      exportAsHtml();
      break;
  }

  // Reseta o select para o estado inicial
  e.target.selectedIndex = 0;
});

// ================================
// RENDERIZAR .md COM PREVIEW
// ================================

function renderMarkdown(md) {
  let html = md;

  html = html.replace(/^#{6}\s?(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s?(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s?(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s?(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s?(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s?(.*)$/gm, '<h1>$1</h1>');

  html = html.replace(/^\*\s(.*)$/gm, '<ul><li>$1</li></ul>'); // lista simples
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  html = html.replace(/\n{2,}/g, '</p><p>');
  html = `<p>${html}</p>`.replace(/<p><\/p>/g, '');

  // unifica listas (múltiplos <ul>)
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  return html;
}
