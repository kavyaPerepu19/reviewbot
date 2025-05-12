
# 🛍️ ReviewBot — Product Review Assistant

ReviewBot is an intelligent, full-stack web application that assists users in analyzing and understanding product reviews through interactive features and powerful AI-driven insights. Leveraging LLMs, sentiment analysis models, and modern web technologies, this application enhances user experience and decision-making.

---

## 🌐 Live URL
`https://reviewbot.vercel.app`

---

## 📁 Project Structure

```
.
├── .vscode/              # VSCode settings
├── backend/              # Node.js backend with Express and MongoDB
├── flaskyy/              # Python microservice for AI/LLM functionality
├── frontend/             # React frontend using MUI and Tailwind CSS
├── milestone/            # Project documentation or progress tracking
├── .gitignore
```

---

## 🚀 Features

- 🔍 **Product Review Scraper** using Playwright
- 📊 **Review Summarizer** using LLMs
- 💬 **Chatbot Assistant** powered by Llama and Langchain
- 🤖 **Sentiment Analysis** using `sentiment-roberta-large-english`
- 📈 **Charts and Data Visuals** with MUI and Chart.js
- 📚 **History & Session Tracking** for persistent chat

---

## 🧠 Tech Stack

### Frontend
- React (v18)
- MUI (Material UI)
- Tailwind CSS
- React Router DOM
- Axios, Chart.js, React-Toastify

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Hugging Face APIs
- Sentiment & Summarization APIs

### Flask Microservice (`flaskyy`)
- Flask + Flask-Cors
- Transformers (LLM integration)
- Langchain, FAISS, Sentence Transformers
- Playwright (for web scraping)

---

## 🧪 AI & LLMs Used

| Task                    | Model                                 |
|-------------------------|----------------------------------------|
| Review Summarization    | Mistral-7B                             |
| Sentiment Analysis      | sentiment-roberta-large-english        |
| RAG Query Answering     | Qwen (Reader) + Nomic Embed Text       |
| Conversational Chatbot  | Llama-2-7B-Chat-GGML / Llama 3         |

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reviewbot.git
   cd reviewbot
   ```

2. **Install Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up Flask Service**
   ```bash
   cd ../flaskyy
   pip install -r requirements.txt
   ```

---

## 🛠️ Running the Project

Start all three services in separate terminals:

### 1. Flask Service
```bash
cd flaskyy
python app.py
```

### 2. Backend
```bash
cd backend
npm start
```

### 3. Frontend
```bash
cd frontend
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in each of the following:

### `frontend/.env`
```env
REACT_APP_BACKEND_URL=http://localhost:3000
```

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/reviewbot
HUGGINGFACE_API_KEY=your_key_here
```

---

## 📖 API Overview

| Route                | Description                          |
|----------------------|--------------------------------------|
| `POST /api/login`    | Authenticate user                    |
| `POST /api/sentiment`| Run sentiment analysis               |
| `POST /api/chatbot`  | Query chatbot                        |
| `POST /api/summarize`| Summarize reviews                    |
| `POST /api/linkInput`| Scrape product & reviews via link    |
| `POST /scrape`       | Headless scraping using Playwright   |

---

## 🧠 Playwright Overview

- Headless Chromium browsing
- Scrapes:
  - Product name, image, price, rating
  - Multiple pages of reviews
- Uses selectors and waits for dynamic content

---

## 📌 TODOs

- [ ] Add authentication tokens
- [ ] Dockerize services
- [ ] Add unit and integration tests
- [ ] Deploy to cloud (e.g., Vercel + Render/AWS)

---

## 📃 License

This project is licensed under the MIT License.
