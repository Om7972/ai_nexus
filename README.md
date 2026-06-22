# 🚀 AI Nexus - Intelligent Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

AI Nexus is a production-ready SaaS platform that combines AI-powered workflows, real-time collaboration, and intelligent knowledge management into a unified, enterprise-grade solution.

## ✨ Features

### 🤖 AI Capabilities
- **AI Agent Builder**: Drag-and-drop workflow builder with 7+ node types
- **Multiple AI Models**: Support for OpenAI, Google Gemini, and more
- **Knowledge Vault**: RAG-powered document management with semantic search
- **Image Generation**: AI-powered image processing and generation

### 🤝 Real-Time Collaboration
- **Live Document Editing**: Google Docs-style collaborative editing
- **Presence Indicators**: See who's online and what they're working on
- **Comments & Mentions**: Threaded discussions with @mentions
- **Version Control**: Complete document history with restore capability

### 👥 Team Management
- **Role-Based Access Control**: Owner, Admin, Editor, Viewer roles
- **Project Workspaces**: Organize work in teams and projects
- **Activity Feed**: Real-time activity tracking and audit logs
- **Permission Management**: Granular permissions at multiple levels

### 📊 Analytics & Insights
- **Usage Analytics**: Track API usage, model performance, and costs
- **Team Analytics**: Collaboration metrics and activity statistics
- **Custom Reports**: Generate insights from your data

### 🔒 Enterprise Security
- **JWT Authentication**: Secure token-based authentication
- **CSRF Protection**: Protection against cross-site request forgery
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Data Encryption**: Secure data transmission and storage
- **Audit Logging**: Comprehensive activity logging

### ⚡ Performance
- **Redis Caching**: Fast response times with intelligent caching
- **CDN Integration**: Cloudinary for optimized image delivery
- **Code Splitting**: Optimized bundle sizes with lazy loading
- **PWA Support**: Offline-capable progressive web app
- **SEO Optimized**: Server-side rendering support

## 🏗️ Architecture

```
ai-nexus/
├── server/                 # Backend API
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── validators/       # Request validators
├── src/                   # Frontend React app
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── store/           # Redux store
│   ├── hooks/           # Custom hooks
│   └── utils/           # Frontend utilities
├── nginx/                # Nginx configuration
├── .github/             # GitHub Actions CI/CD
└── docker/              # Docker configurations
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- Redis >= 7.0 (optional but recommended)
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-nexus.git
cd ai-nexus
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Copy example env files
cp .env.example .env
cp server/.env.example server/.env

# Edit .env files with your configuration
```

4. **Start MongoDB and Redis**
```bash
# Using Docker Compose (recommended)
docker-compose up -d mongodb redis

# Or install locally and start services
```

5. **Run the application**
```bash
# Start backend (in server directory)
cd server
npm run dev

# Start frontend (in root directory)
cd ..
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- API Documentation: http://localhost:5000/api-docs

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Deployment

### Deploy to Vercel (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-nexus)

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Render (Backend)

1. Connect your repository to Render
2. Create a new Web Service
3. Set environment variables from `.env.example`
4. Deploy!

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/ai-nexus)

### Deploy to AWS EC2

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed AWS deployment instructions.

### Deploy with Docker

```bash
# Build images
docker-compose build

# Push to registry
docker-compose push

# Deploy on your server
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

See [`.env.example`](./.env.example) for all available environment variables.

Key configurations:
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key
- `EMAIL_*`: SMTP email configuration
- `CLOUDINARY_*`: Cloudinary configuration

### API Rate Limits

Default rate limits (configurable):
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- AI endpoints: 20 requests per minute

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when running the server.

### Authentication

```bash
# Register
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Use the returned token in subsequent requests
Authorization: Bearer <your-token>
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🔐 Security

- All passwords are hashed using bcrypt
- JWT tokens with configurable expiration
- CSRF protection enabled
- XSS protection headers
- SQL injection protection via MongoDB sanitization
- Rate limiting on all endpoints
- HTTPS in production (configured via Nginx)

## 📊 Monitoring

### Health Checks

- Frontend: `GET /health`
- Backend: `GET /api/v1/health`
- Monitoring: `GET /api/v1/monitoring`

### Logging

Logs are stored in `server/logs/`:
- `application-YYYY-MM-DD.log`: General logs
- `error-YYYY-MM-DD.log`: Error logs
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [OpenAI](https://openai.com/)
- [Socket.IO](https://socket.io/)
- [Cloudinary](https://cloudinary.com/)

## 📞 Support

- Documentation: [https://docs.ainexus.com](https://docs.ainexus.com)
- Email: support@ainexus.com
- Discord: [Join our community](https://discord.gg/ainexus)
- GitHub Issues: [Report a bug](https://github.com/yourusername/ai-nexus/issues)

## 🗺️ Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Desktop app (Electron)
- [ ] Advanced AI models integration
- [ ] Video/audio calls
- [ ] Screen sharing
- [ ] Advanced analytics dashboard
- [ ] API webhooks
- [ ] Third-party integrations
- [ ] White-label solution

---

**Built with ❤️ by the AI Nexus Team**

⭐ Star us on GitHub if you find this project useful!
