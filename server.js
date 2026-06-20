const express = require('express');
const CryptoJS = require('crypto-js');
const { NodeRSA } = require('node-rsa');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const rsaKey = new NodeRSA({ b: 512 });
const publicKey = rsaKey.exportKey('public');
const privateKey = rsaKey.exportKey('private');

app.get('/api/rsa/keys', (req, res) => {
  res.json({ publicKey, privateKey });
});

app.post('/api/encrypt', (req, res) => {
  const { text, algorithm, key } = req.body;

  if (!text || !algorithm) {
    return res.status(400).json({ error: 'Missing text or algorithm' });
  }

  try {
    let encrypted = '';
    let info = '';

    if (algorithm === 'AES') {
      if (!key) return res.status(400).json({ error: 'AES requires a secret key' });
      encrypted = CryptoJS.AES.encrypt(text, key).toString();
      info = 'AES-256 · Symmetric · Key: "' + key + '"';

    } else if (algorithm === 'DES') {
      if (!key) return res.status(400).json({ error: 'DES requires a secret key' });
      encrypted = CryptoJS.DES.encrypt(text, key).toString();
      info = 'DES · Symmetric · Key: "' + key + '"';

    } else if (algorithm === 'RSA') {
      const rsa = new NodeRSA();
      rsa.importKey(publicKey, 'public');
      encrypted = rsa.encrypt(text, 'base64');
      info = 'RSA-512 · Asymmetric · Encrypted with public key';

    } else {
      return res.status(400).json({ error: 'Unknown algorithm' });
    }

    res.json({ encrypted, algorithm, info });

  } catch (err) {
    res.status(500).json({ error: 'Encryption failed: ' + err.message });
  }
});

app.post('/api/decrypt', (req, res) => {
  const { text, algorithm, key } = req.body;

  if (!text || !algorithm) {
    return res.status(400).json({ error: 'Missing text or algorithm' });
  }

  try {
    let decrypted = '';

    if (algorithm === 'AES') {
      if (!key) return res.status(400).json({ error: 'AES requires the secret key' });
      const bytes = CryptoJS.AES.decrypt(text, key);
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error('Wrong key or corrupted data');

    } else if (algorithm === 'DES') {
      if (!key) return res.status(400).json({ error: 'DES requires the secret key' });
      const bytes = CryptoJS.DES.decrypt(text, key);
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error('Wrong key or corrupted data');

    } else if (algorithm === 'RSA') {
      const rsa = new NodeRSA();
      rsa.importKey(privateKey, 'private');
      decrypted = rsa.decrypt(text, 'utf8');

    } else {
      return res.status(400).json({ error: 'Unknown algorithm' });
    }

    res.json({ decrypted, algorithm });

  } catch (err) {
    res.status(500).json({ error: 'Decryption failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Text Encryption running at http://localhost:${PORT}`);
});
