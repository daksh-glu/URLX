# 🚀 URLX - Modern URL Shortener

A modern and responsive **URL Shortener** built using **HTML, CSS, JavaScript, FastAPI, and SQLite**. URLX transforms long URLs into short, shareable links through a clean and futuristic interface.

![Banner](assets/banner.png)

---

## ✨ Features

- 🔗 Shorten long URLs instantly
- ⚡ Fast backend powered by FastAPI
- 🎨 Modern futuristic UI
- 📱 Responsive design
- 💾 SQLite database integration
- 🚀 Simple and lightweight
- 🔒 Easy to deploy

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- FastAPI

### Database
- SQLite

---

## 📂 Project Structure

```
url-shortener/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── urls.db
│
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/url-shortener.git
```

```
cd url-shortener
```

---

### Create virtual environment

```bash
python -m venv venv
```

Activate it

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

---

### Install dependencies

```bash
pip install -r requirements.txt
```

---

### Run the backend

```bash
uvicorn main:app --reload
```

or if inside the backend folder

```bash
python -m uvicorn main:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

---

### Run the frontend

Simply open

```
frontend/index.html
```

or use VS Code Live Server.

---

## 📸 Preview

Modern dark-themed interface with glowing effects and responsive design.
<img width="1881" height="917" alt="image" src="https://github.com/user-attachments/assets/444d14de-cf01-4793-a81a-8da0f1d9e04b" />


---

## 🚀 Future Improvements

- User authentication
- Custom aliases
- QR Code generation
- Click analytics
- Link expiration
- Dashboard
- Copy-to-clipboard button
- Dark/Light mode

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

## 📄 License

This project is licensed under the MIT License.
