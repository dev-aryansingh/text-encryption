# 🔐 Text Encryption

**Pinnacle Labs Cybersecurity Internship 2026**  
Built by [StarkHood](https://github.com/dev-aryansingh)

Encrypt and decrypt text using three different cryptographic algorithms — AES, DES, and RSA — with a clean dark UI and real-time feedback.

---

## Algorithms

| Algorithm | Type | Key |
|-----------|------|-----|
| AES-256 | Symmetric | User-defined secret key |
| DES | Symmetric | User-defined secret key |
| RSA-512 | Asymmetric | Auto-generated key pair on server |

- **AES** — modern standard, fast and secure
- **DES** — older standard (1970s), included for educational comparison
- **RSA** — public key encrypts, private key decrypts; no shared secret needed

---

## Features

- Switch between AES, DES, RSA with one click
- Encrypt and decrypt in the same interface
- RSA key pair auto-generated on server start and displayed in UI
- Copy output to clipboard
- Error handling for wrong keys or corrupted input
- Separate HTML, CSS, JS files

---

## Project Structure

```
text-encryption/
├── server.js          # Express backend + crypto logic
├── package.json
├── README.md
└── public/
    ├── index.html     # Markup
    ├── style.css      # Styles
    └── script.js      # Frontend logic
```

---

## Setup

```bash
npm install
npm start
```

Open `http://localhost:3001`

---

## API

**POST** `/api/encrypt`
```json
{ "text": "Hello", "algorithm": "AES", "key": "mysecretkey" }
```

**POST** `/api/decrypt`
```json
{ "text": "<encrypted>", "algorithm": "AES", "key": "mysecretkey" }
```

**GET** `/api/rsa/keys`
```json
{ "publicKey": "...", "privateKey": "..." }
```

> RSA does not require a key in the request body — the server uses its generated key pair automatically.

---

## Tech Stack

- **Backend:** Node.js, Express, crypto-js, node-rsa
- **Frontend:** HTML, CSS, Vanilla JS
