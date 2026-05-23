# Foodlytics 🍔📊

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Node](https://img.shields.io/badge/node-16+-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)

Foodlytics is an AI-powered restaurant review analysis and discovery platform. It leverages sentiment analysis and K-Means clustering on Zomato reviews to help users uncover hidden gems, avoid overrated places, and make data-driven dining decisions.

![Foodlytics Banner](./frontend/public/chicken_biryani_hero.png)

## 📑 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [📈 Architecture Overview](#-architecture-overview)
- [📄 License](#-license)

## ✨ Features

### For Users
*   **Smart Search:** Find restaurants by name, cuisine, or location with real-time debounced search.
*   **AI Concierge:** Get personalized dining recommendations.
*   **Advanced Filtering:** Filter by rating, category, budget, pure veg, outdoor seating, and open status.
*   **Sentiment Analysis:** View Lexicon-based sentiment scores with negation detection for every review.
*   **Premium UI:** Glassmorphism-inspired design with modern typography, smooth animations, and a cinematic responsive layout.

### For Admins
*   **Secure Dashboard:** Role-based access with secure JWT authentication.
*   **Data Upload:** Drag-and-drop CSV file uploads for raw Zomato datasets.
*   **AI Analytics:** Run automated K-Means Clustering and Sentiment Analysis on uploaded data.
*   **Interactive Dashboards:** Visualize ratings, reviews, and trends using Chart.js.
*   **Restaurant Management:** Full CRUD capabilities for restaurant data.

## 🛠️ Tech Stack

*   **Frontend:** React, Tailwind CSS, React Icons, Chart.js, Vite
*   **Backend:** FastAPI, Python, Pandas, Scikit-learn (Clustering), NLTK (Sentiment Analysis), PostgreSQL
*   **Authentication:** JWT (JSON Web Tokens)

## 📂 Project Structure

```
foodlytics-ai-review-analysis/
├── backend/          # FastAPI application, ML scripts, and database models
├── frontend/         # React application (Vite, TailwindCSS)
├── data/             # Sample datasets and raw CSV files
└── .env.example      # Example environment variables
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+) & npm
*   Python 3.8+
*   PostgreSQL (optional, default is set to postgres)

### Environment Variables

Before running the application, you need to configure the environment variables. 
1. Copy the `.env.example` file to `.env` in the root directory (or respective backend directory based on your setup).
2. Update the credentials in the `.env` file:

```env
# Backend (FastAPI)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zomato_lens
SECRET_KEY=change-me-to-a-long-random-string-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development

# Email OTP delivery (App Password required for Gmail)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_FROM=your-email@gmail.com
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be available at `http://localhost:8000`*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`*

## 📈 Architecture Overview
1. **Data Processing Layer:** Python and Pandas clean and preprocess raw review data.
2. **Machine Learning Layer:** Scikit-learn performs clustering to identify restaurant tiers, while Lexicon-based algorithms score the sentiment of user reviews.
3. **API Layer:** FastAPI serves endpoints for both the User and Admin portals seamlessly.
4. **Presentation Layer:** React consumes the APIs and displays insights using dynamic Chart.js visuals and premium styling components.

## 📄 License
This project is licensed under the MIT License.
