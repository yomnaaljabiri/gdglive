Livestack – Smart Livestock Management System

Overview

 Livestack is a smart livestock management system designed to help farmers efficiently manage their animals, track health data, and make better decisions using AI-powered insights.

The platform provides an intuitive dashboard, animal tracking system, and an AI veterinary assistant to support farmers in monitoring livestock health and productivity.

---------
Features

User Authentication

Register and login system

Farm-based user profiles


Livestock Management

Add and manage animals

Track:

Age, weight, type, and breed

Health status

Vaccinations & medications



 Vaccination & Medication Tracking

Store vaccination history

Add new vaccines dynamically

Track withdrawal periods


Dashboard

Overview of livestock data

Organized and easy-to-read interface


 AI Veterinary Assistant

Powered by Google Gemini API

Provides smart health advice for livestock

Supports Arabic and English


Multilingual Support

Arabic  and English  interface support




-------

Tech Stack

Frontend

HTML5

CSS3 (modular structure)

JavaScript (Vanilla JS)


Backend

Python (Flask)

REST API architecture


Database

SQLite


AI Integration

Google Generative AI (Gemini API)



--------

Project Structure

gdglive-main/
│
├── index.html
├── login.html
├── dashboard.html
│
├── css/
│   ├── animations.css
│   ├── auth.css
│   ├── components.css
│   ├── dashboard.css
│   ├── landing.css
│   ├── layout.css
│   └── variables.css
│
├── js/
│   ├── auth.js
│   ├── dashboard.js
│   ├── i18n.js
│   └── landing.js
│
├── server/
│   ├── app.py
│   └── agriroots.db
│
└── agriroots.db


-------

 Installation & Setup

1. Clone the repository

git clone https://github.com/yomnaaljabiri/gdglive.git
cd agriroots

2. Backend Setup

cd server
pip install flask flask-cors google-generativeai

3. Run the server

python app.py

Server will run on:

http://localhost:5000


--------

4. Frontend

Open index.html in your browser
OR use Live Server 



---------

 Environment Variables

To enable the AI assistant, set your Gemini API key:

export GEMINI_API_KEY=your_api_key_here


--------

API Endpoints

Method	Endpoint	Description

POST	/api/register	Register new user
POST	/api/login	Login
GET	/api/animals	Get all animals
POST	/api/animals	Add animals
PUT	/api/animals/<id>	Update animal
POST	/api/aivet	AI veterinary assistant



--------

Future Improvements

Data analytics & insights dashboard

Mobile-friendly version

Livestock marketplace integration

Early disease detection alerts

Cloud deployment (Docker, GCP)



---------

👥 Team

Developed as part of the antigravity  hackathon project

Built with focus on real-world livestock farms challenges



----------

License

This project is for educational and hackathon purposes.


----------

Demo

You can demonstrate:

Login/Register

Add animals

Update vaccines

Ask AI assistant
