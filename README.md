📚 StudyPal

StudyPal is a mobile application built with Expo (React Native) to support users in managing study plans, tasks, and real-time interactions in a simple and user-friendly way.

🚀 Tech Stack

Framework: Expo (React Native)

Navigation: Expo Router (file-based routing)

UI: React Native Paper, NativeWind (Tailwind CSS)

API Communication: Axios

Real-time: WebSocket, Server-Sent Events (SSE)

State & Storage: Secure token handling, local storage

Utilities: Day.js

✨ Key Features

User authentication and session management

Study plan and task management

Real-time chat and message streaming

User mentions and interactive collaboration

Push notifications for reminders and events

Clean, responsive, and user-centered UI

🛠️ Getting Started

1. Install dependencies
   npm install

2. Start the development server
   npx expo start

You can run the app on:

Android Emulator

iOS Simulator

Expo Go

Development Build

📂 Project Structure
app/
├─ (auth)/ # Authentication screens
├─ (team)/ # Team, plan, and task flows
├─ (me)/ # User-related features
├─ components/ # Reusable UI components
├─ hooks/ # Custom hooks
└─ utils/ # Helpers and utilities

The project uses Expo Router with file-based routing for better scalability and maintainability.

♻️ Reset Project

If you want a clean start:

npm run reset-project

This will move the example code to app-example/ and generate a fresh app/ directory.

📖 Learn More

Expo Documentation

Expo Router

React Native

🤝 Contributing

Contributions, issues, and feature requests are welcome.
Feel free to fork the repository and submit a pull request.

📄 License

This project is for learning and development purposes.
