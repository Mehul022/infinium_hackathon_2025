# Gamified Wellness App

## 📌 Overview  
This project is a **gamified wellness application** built using **Expo + React Native** for the frontend and **Node.js + Express + MongoDB** for the backend.  

The goal is to **enhance user engagement** in health, wellness, and insurance management through gamification features such as:  
- Daily and monthly health tracking  
- Task-based challenges  
- Reward system with credits and badges  
- Insurance tracking integration  

This project was developed as part of the **YouMatter Gamification Challenge**.

---

## 🏗 Tech Stack
- **Frontend:** React Native (with Expo)  
- **Backend:** Node.js with Express  
- **Database:** MongoDB  
- **Authentication:** JWT (planned)  
- **Gamification:** Rewards, Badges, Progress Tracking  

---

## 📊 UML Database Design  
The following UML diagram represents the system’s data model:

<img width="1366" height="645" alt="image" src="https://github.com/user-attachments/assets/1d80dfa5-92e7-472c-af1c-84dd86b5fbe6" />


### Entities
- **User**: Manages authentication and links all other entities.  
- **UserRewards**: Tracks credits and earned badges.  
- **DailyProgress**: Stores daily activity, steps, and completed tasks.  
- **MonthlyProgress**: Summarizes activity per month.  
- **Insurance**: Links users to their active insurance policies.  
- **Task & Day**: Encapsulate challenge-based tracking.  

---

## 🚀 Getting Started  

### 1. Clone the Repository  
```bash
git clone https://github.com/your-username/youmatter-app.git
cd youmatter-app
```
### 2. Run the Backend Server
``` bash
cd server
npm install
node index.js
```
### Run the Mobile App
``` bash
cd client
npm install
npx expo start
```
This will start Expo. You can scan the QR code with the Expo Go app to run it on your phone.
## 📱 Screenshots
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/3f80b637-6614-4bbc-aa9a-17d0e5a0b120" />
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/38f4cb25-670f-405f-b92d-5e1775cf8415" />
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/6123ca87-0ef3-4525-b8bd-85ebd4620a97" />
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/eebaf410-8b22-4a48-b98a-867e8f6435e0" />
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/37835eec-7a65-47a1-850f-9a2fbade8f18" />
<img width="289" height="616" alt="image" src="https://github.com/user-attachments/assets/73225ba4-9b8b-4e63-893d-4f2c2024420d" />

## 👨‍💻 Contributors
 - mehulag022
 - paarthjindal
 - aryanagraval0908


