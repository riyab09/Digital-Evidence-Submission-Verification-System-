# 🏛️ Digital Evidence Management System (DEMS)

A secure **Digital Evidence Management System** built using **Node.js, Express, MySQL, and Cryptography** to ensure the **integrity, authenticity, and verification of digital evidence** for court and law enforcement use.

This system allows officers to **upload evidence**, generates a **SHA-256 hash** for tamper detection, securely stores metadata in a database, and enables **evidence verification** by recalculating and comparing hashes.

---

## 🚀 Features

- 🔐 **Secure Evidence Upload**
- 🧾 **SHA-256 Hash Generation for Integrity**
- 🔍 **Evidence Verification (Tamper Detection)**
- 🗃️ **MySQL Database Storage**
- 📂 **File Upload using Multer**
- 👮 **Officer-wise Evidence Tracking**
- 📜 **Evidence Metadata Management**
- ⚡ **Fast & Scalable REST APIs**

---

## 🛠️ Tech Stack

### Backend
- **Node.js**
- **Express.js**

### Database
- **MySQL**

### Security
- **SHA-256 Cryptographic Hashing**
- **Crypto Module**

### File Handling
- **Multer**
- **File System (fs)**

---

## 📁 Project Structure
📁 Digital-Evidence-Management-System/
│
├── 📁 evidence_files/              # Directory to store uploaded evidence files
│   └── .gitkeep                    # Keeps the folder tracked in Git
│
├── 📁 public/                      # Frontend files
│   ├── index.html                  # Evidence submission page
│   ├── admin.html                  # Evidence verification / admin panel
│   └── styles.css                  # Optional styling file
│
├── server.js                       # Main Express backend server
├── package.json                    # Project dependencies & scripts
├── package-lock.json               # Dependency lock file
├── README.md                       # Project documentation
└── .gitignore                      # Ignore node_modules & uploads
