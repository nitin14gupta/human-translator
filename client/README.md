# Human Translator App - Frontend

React Native mobile application for the Human Translator platform, built with Expo.

## Project Structure

```
client/
├── src/
│   ├── app/               # Application screens
│   │   ├── (auth)/        # Authentication-related screens
│   │   ├── (shared)/      # Components shared between user types
│   │   ├── (tabs)/        # Tab-based navigation screens
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   │   ├── AuthContext.tsx  # Authentication context
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization resources
│   ├── services/          # API services and utilities
│   │   ├── api.ts         # API client
├── assets/                # Static assets (images, fonts)
```

## Features

- User authentication (login, registration)
- Language preference selection
- User profiles (traveler and translator types)
- Translator profile creation and management
- Multi-language support

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npx expo start
   ```

3. Run on a device or emulator:
   - Press `a` to run on Android emulator
   - Press `i` to run on iOS simulator
   - Scan QR code with Expo Go app on physical device

## API Connection

The app connects to a Flask backend API. The API base URL can be configured in `src/services/api.ts`.

## User Types

The application supports two types of users:

1. **Travelers** - Users who need translation services
2. **Translators** - Users who provide translation services

## User Interface

The app provides a modern, intuitive interface with:

- Clean form elements for data input
- Robust validation
- Language selection with auto-complete
- Profile image upload support
- Profile creation workflow