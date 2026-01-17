📚 StudyPal

StudyPal is a mobile application built with Expo (React Native) designed to help users organize study plans, manage tasks, and collaborate through real-time interactions in a simple and user-friendly experience.

🚀 Tech Stack

Framework: Expo (React Native)

Navigation: Expo Router (file-based routing)

UI: React Native Paper, NativeWind (Tailwind CSS)

API Communication: Axios

Real-time Communication: WebSocket, Server-Sent Events (SSE)

State & Storage: Secure token handling, local storage

Utilities: Day.js

✨ Features

User authentication and session management

Study plan and task management

Real-time chat and message streaming

User mentions for collaborative interaction

Push notifications for reminders and events

Clean, responsive, and user-centered interface

🛠️ Getting Started
Install dependencies

npm install

Start the development server

npx expo start

You can run the application on:

Android Emulator

iOS Simulator

Expo Go

Development Build

📂 Project Structure

app/
├─ (auth)/ Authentication screens
├─ (team)/ Team, plan, and task flows
├─ (me)/ User-related features
├─ components/ Reusable UI components
├─ hooks/ Custom hooks
└─ utils/ Helper functions and utilities

This project uses Expo Router with file-based routing to ensure scalability and maintainability.

♻️ Reset Project

npm run reset-project

This command moves the starter code to app-example/ and creates a fresh app/ directory for development.

📖 Learn More

Expo Documentation: https://docs.expo.dev/

Expo Router: https://docs.expo.dev/router/introduction/

React Native: https://reactnative.dev/

🤝 Contributing

Contributions, issues, and feature requests are welcome.
Feel free to fork the repository and submit a pull request.

📄 License

This project is intended for learning and development purposes.
