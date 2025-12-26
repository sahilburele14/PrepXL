## 🎯 Overview

PrepXL is a comprehensive AI-powered interview preparation platform that helps job seekers prepare for their dream jobs through resume analysis, AI mock interviews, multi-platform job search, and curated question banks.

**Live Demo**: 

---

## ✨ Features

### 🤖 AI Resume Analyzer
- Upload resume (PDF, DOCX, DOC, TXT)
- Get ATS compatibility score (0-100)
- Receive personalized recommendations
- Compare against job descriptions
- Track improvement over time

### 💬 AI Interview Practice
- Practice with AI interviewer
- Real-time feedback on responses
- Voice recording support
- Interview history tracking
- Performance analytics

### 💼 Multi-Platform Job Search
- Search across multiple job boards
- Advanced filtering options
- Auto-search with daily matches
- Save and track applications
- Email notifications

### 📚 Interview Question Bank
- 1000+ curated questions
- Filter by category and difficulty
- Technical & behavioral questions
- Sample answers and hints
- Bookmark favorites

### 📊 Progress Dashboard
- Track your preparation journey
- View activity calendar
- Monitor interview performance
- Resume score history
- Personalized insights

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Routing**: React Router DOM 7.9.4
- **State Management**: Redux Toolkit 2.9.2
- **Styling**: Tailwind CSS 4.1.14
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.546.0

### Backend Integration
- **Authentication**: Firebase 12.4.0
- **API**: REST API (https://api.prepxl.app)
- **Real-time**: Firebase Firestore

### Development Tools
- **Linting**: ESLint 9.30.1
- **Package Manager**: npm
- **Version Control**: Git

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sahilburele14/PrepXL
cd PrepXL/WebSite
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=https://api.prepxl.app
```

4. **Start development server**
```bash
npm run dev
```
---

## 📁 Project Structure
PrepXL/
├── WebSite/                    # Main application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── common/         # Reusable UI components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   ├── InterviewPractice.jsx
│   │   │   ├── JobSearch.jsx
│   │   │   └── QuestionBank.jsx
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── store/                  # Redux store
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment template
│   └── package.json            # Dependencies
└── README.md                   # This file

---

## 🎨 Key Features Implementation

### Authentication Flow
- Google OAuth via Firebase
- Automatic profile creation
- Token-based API authentication
- Protected routes

### Resume Analysis
- Drag-and-drop file upload
- Real-time progress tracking
- AI-powered ATS scoring
- Detailed recommendations

### Interview Practice
- Real-time chat interface
- Voice recording with MediaRecorder API
- Speech-to-text transcription
- Interview session tracking

### Job Search
- Multi-platform aggregation
- Advanced filtering
- Daily automated searches
- Email notifications

---

## 🧪 Testing
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### Environment Variables
Make sure to set these in your deployment platform:
- All `VITE_*` variables from `.env`
- Firebase configuration
- API base URL

---



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sahil Burele**
- Portfolio: https://sahil-burele-6rhu7x2.gamma.site/
- LinkedIn: https://www.linkedin.com/in/burelesahil/
- GitHub: https://github.com/sahilburele14
- Email: sahilburele6789@gmail.com

---

## 🙏 Acknowledgments

- Firebase for authentication services
- Anthropic for AI capabilities
- React team for the amazing framework
- All open-source contributors

---

## 📊 Project Stats

- **Lines of Code**: 3,500+
- **Components**: 15+
- **API Endpoints**: 20+
- **Features**: 5 major features
- **Development Time**: 3 months

---

## 🔮 Future Enhancements

- [ ] Video interview practice
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Interview scheduling
- [ ] Salary negotiation tools
- [ ] Career path recommendations

---

## 📞 Support

For support, email sahilburele6789@gmail.com



