const form = document.getElementById('converter-form');
const fileInput = document.getElementById('file-input');
const conversionTypeInput = document.getElementById('conversion-type');
const statusText = document.getElementById('status-text');
const downloadLink = document.getElementById('download-link');

function setStatus(message) {
  statusText.textContent = message;
}

function clearDownloadLink() {
  downloadLink.hidden = true;
  downloadLink.removeAttribute('href');
  downloadLink.removeAttribute('download');
}

downloadLink.addEventListener('click', async (event) => {
  // O download e feito via fetch para tratar erros (ex.: arquivo ja removido) sem navegar para a resposta crua da API.
  event.preventDefault();

  const downloadUrl = downloadLink.getAttribute('href');

  if (!downloadUrl) {
    alert('Realize uma conversao antes.');
    return;
  }

  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error('not-found');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const temporaryLink = document.createElement('a');

    temporaryLink.href = objectUrl;
    temporaryLink.download = downloadLink.dataset.fileName || '';
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    temporaryLink.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    alert('Realize uma conversao antes.');
    clearDownloadLink();
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const file = fileInput.files[0];
  const conversionType = conversionTypeInput.value;

  if (!file) {
    setStatus('Selecione um arquivo antes de converter.');
    clearDownloadLink();
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversionType', conversionType);

  setStatus('Convertendo arquivo...');
  clearDownloadLink();

  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Falha ao converter o arquivo.');
    }

    setStatus(payload.message || 'Conversao concluida.');
    downloadLink.href = payload.downloadUrl;
    downloadLink.dataset.fileName = payload.fileName || '';
    downloadLink.hidden = false;
    downloadLink.textContent = 'Baixar resultado';
  } catch (error) {
    setStatus(error.message);
    clearDownloadLink();
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    setStatus(`Arquivo selecionado: ${file.name}`);
  }
});