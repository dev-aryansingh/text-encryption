const algoInfo = {
  AES: {
    tag: 'Symmetric',
    text: 'AES-256 — most widely used encryption standard today. Requires a secret key to encrypt and decrypt.',
    needsKey: true,
  },
  DES: {
    tag: 'Symmetric',
    text: 'DES — older standard from the 1970s, now considered weak. Included here for educational comparison with AES.',
    needsKey: true,
  },
  RSA: {
    tag: 'Asymmetric',
    text: 'RSA — uses a public key to encrypt and a private key to decrypt. No shared secret needed between sender and receiver.',
    needsKey: false,
  },
};

let currentAlgo = 'AES';

const algoBtns   = document.querySelectorAll('.algo-btn');
const infoTag    = document.getElementById('infoTag');
const infoText   = document.getElementById('infoText');
const keyCard    = document.getElementById('keyCard');
const rsaCard    = document.getElementById('rsaCard');
const keyInput   = document.getElementById('keyInput');
const inputText  = document.getElementById('inputText');
const outputCard = document.getElementById('outputCard');
const outputText = document.getElementById('outputText');
const outputLabel= document.getElementById('outputLabel');
const outputMeta = document.getElementById('outputMeta');
const copyBtn    = document.getElementById('copyBtn');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const clearBtn   = document.getElementById('clearBtn');

async function loadRSAKeys() {
  try {
    const res = await fetch('/api/rsa/keys');
    const data = await res.json();
    document.getElementById('rsaPublic').textContent = data.publicKey;
    document.getElementById('rsaPrivate').textContent = data.privateKey;
  } catch (err) {
    document.getElementById('rsaPublic').textContent = 'Failed to load';
    document.getElementById('rsaPrivate').textContent = 'Failed to load';
  }
}

loadRSAKeys();

algoBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    algoBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAlgo = btn.dataset.algo;

    const info = algoInfo[currentAlgo];
    infoTag.textContent = info.tag;
    infoText.textContent = info.text;

    if (currentAlgo === 'RSA') {
      keyCard.style.display = 'none';
      rsaCard.style.display = 'block';
    } else {
      keyCard.style.display = 'block';
      rsaCard.style.display = 'none';
    }

    outputCard.style.display = 'none';
    clearError();
  });
});

encryptBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const key  = keyInput.value.trim();

  if (!text) return showError('Please enter some text to encrypt.');
  if (algoInfo[currentAlgo].needsKey && !key) return showError('Please enter a secret key.');

  clearError();
  encryptBtn.textContent = 'Encrypting...';
  encryptBtn.disabled = true;

  try {
    const res = await fetch('/api/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, algorithm: currentAlgo, key }),
    });

    const data = await res.json();
    if (data.error) return showError(data.error);

    outputText.value = data.encrypted;
    outputLabel.textContent = 'Encrypted output';
    outputMeta.textContent = data.info;
    outputCard.style.display = 'block';
    copyBtn.textContent = 'Copy';

  } catch (err) {
    showError('Request failed. Is the server running?');
  } finally {
    encryptBtn.textContent = 'Encrypt';
    encryptBtn.disabled = false;
  }
});

decryptBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const key  = keyInput.value.trim();

  if (!text) return showError('Please paste the encrypted text to decrypt.');
  if (algoInfo[currentAlgo].needsKey && !key) return showError('Please enter the secret key used to encrypt.');

  clearError();
  decryptBtn.textContent = 'Decrypting...';
  decryptBtn.disabled = true;

  try {
    const res = await fetch('/api/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, algorithm: currentAlgo, key }),
    });

    const data = await res.json();
    if (data.error) return showError(data.error);

    outputText.value = data.decrypted;
    outputLabel.textContent = 'Decrypted output';
    outputMeta.textContent = `Decrypted using ${currentAlgo}`;
    outputCard.style.display = 'block';
    copyBtn.textContent = 'Copy';

  } catch (err) {
    showError('Request failed. Is the server running?');
  } finally {
    decryptBtn.textContent = 'Decrypt';
    decryptBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputText.value).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
  });
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  keyInput.value = '';
  outputCard.style.display = 'none';
  clearError();
});

function showError(msg) {
  let el = document.getElementById('errorMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'errorMsg';
    el.className = 'error-msg';
    document.querySelector('.action-row').insertAdjacentElement('afterend', el);
  }
  el.textContent = msg;
  el.classList.add('show');
}

function clearError() {
  const el = document.getElementById('errorMsg');
  if (el) el.classList.remove('show');
}
