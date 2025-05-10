# BodyNote

BodyNote is a mobile-first pain and injury tracking web application designed for health monitoring and rehabilitation support.

## Features

- **Mobile-optimized Interface**: Built as a Progressive Web App (PWA) with touch-friendly controls
- **Pain Tracking**: Mark and track pain points on uploaded photos
- **Offline Capability**: Service worker enables offline functionality
- **Photo Upload**: Capture or upload images directly from your device
- **Pain Marking Tools**: Customizable color and intensity markers
- **Touch Gestures**: Swipe navigation and haptic feedback
- **Multi-language Support**: Available in English and Spanish

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL
- **Mobile Features**: Progressive Web App capabilities, haptic feedback, touch gestures
- **Internationalization**: i18next for multi-language support

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/jhellrzr/BodyNote.git
   cd BodyNote
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Usage

1. Open the app in a mobile browser
2. Upload or take a photo
3. Use the pain marking tools to indicate pain locations
4. Save your pain tracking record

## Installing as a Mobile App

As a PWA, BodyNote can be installed on your mobile device:

1. Open the website in your mobile browser
2. Tap the "Add to Home Screen" or "Install" option in your browser menu
3. Follow the prompts to install the app on your device

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Replit
- Icons from Lucide React