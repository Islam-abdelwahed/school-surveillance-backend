# School Safety Monitoring System (SAMS)

![SAMS Architecture Diagram](docs/architecture-overview.png)

SAMS is a comprehensive safety monitoring system designed for educational environments. It integrates edge computing devices (like NVIDIA Jetson or Raspberry Pi) with school camera systems to detect safety incidents in real-time using deep learning models. The system provides immediate alerts to administrators via mobile apps while maintaining student privacy through local processing.

## Key Features

- **Real-time Incident Detection**: AI-powered analysis of classroom video streams
- **Edge Processing**: On-device video analysis to reduce latency and bandwidth
- **Hybrid Architecture**: Combines local device processing with cloud management
- **Automated Storage Management**: Configurable video retention policies
- **Role-based Access Control**: Granular permissions for staff and admins
- **Mobile Alerts**: Instant push notifications for detected incidents

## Technology Stack

### Core Components
| Component               | Technology                  |
|-------------------------|-----------------------------|
| **Backend Framework**   | Node.js 18+ with Express    |
| **Language**            | TypeScript 5.x              |
| **Database**            | MongoDB 6.0+                |
| **Queue System**        | Redis 7.x + BullMQ          |
| **Edge Runtime**        | Node.js 18 (ARM64)          |
| **File Storage**        | Local FS / S3 Compatible    |

### Key Libraries
- **Deep Learning**: TensorFlow.js + C++ Addons
- **Video Processing**: FFmpeg + NVIDIA Video Codec SDK
- **Notifications**: Firebase Cloud Messaging
- **Auth**: JWT + OAuth 2.0
- **Validation**: Zod

## System Architecture

```
.
├── device-backend/       # Runs on edge devices (Jetson/RPi)
│   ├── video-processor   # Real-time DL model execution
│   ├── dvr-adapter       # Camera integration
│   └── local-storage     # On-device video management
│
├── global-server/        # Cloud management system
│   ├── device-mgmt       # Edge device orchestration
│   ├── user-mgmt         # Mobile app user management
│   └── notification      # Push notification service
│
├── mobile-app/           # React Native application
│   ├── ios/              # iOS implementation
│   └── android/          # Android implementation
```

[View detailed architecture documentation](docs/ARCHITECTURE.md)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 7.0+
- NVIDIA Jetson/ Raspberry Pi (for edge deployment)
- FFmpeg with hardware acceleration

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/sams-backend.git
cd sams-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
nano .env  # Configure your settings
```

### Configuration
Configure your `.env` file:
```ini
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/sams

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Video Storage
VIDEO_STORAGE_PATH=/var/sams/videos
MAX_VIDEO_SIZE_MB=500

# Security
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d

# Device Settings
DEVICE_ID=jetson-001
SCHOOL_ID=school-123
```

### Running the System
```bash
# Start development server
npm run dev

# Start production server
npm run build
npm start

# Run cleanup scheduler
npm run scheduler

# Run health monitor
npm run monitor
```

## Project Structure
```
server/
├── src/
│   ├── core/               # Framework-agnostic business logic
│   │   ├── scheduler/      # Cron jobs and queues
│   │   ├── storage/        # File management
│   │   └── notifications/  # Alerting system
│   │
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── video/          # Video processing
│   │   ├── devices/        # Edge device management
│   │   └── storage-settings # Retention policies
│   │
│   ├── config/             # Configuration files
│   ├── utils/              # Helper functions
│   └── app.ts              # Application entry point
│
├── scripts/                # Database migration/seed scripts
├── public/                 # Static assets
├── docs/                   # Architecture and API documentation
└── tests/                  # Unit and integration tests
```

## API Documentation

[![OpenAPI Specification](https://img.shields.io/badge/OAS-3.0-brightgreen)](public/openapi.yaml)

Key Endpoints:
- `POST /api/v1/videos/store-video` - Upload video for analysis
- `GET /api/v1/videos/stream/:id` - Stream processed video
- `POST /api/v1/devices/register` - Register edge device
- `PUT /api/v1/storage-settings` - Configure retention policies

[View Full API Documentation](public/docs)

## Deployment

### Edge Device Setup (Jetson Nano)
```bash
# Flash device with JetPack 5.1
sudo apt update
sudo apt install nodejs npm redis-server mongodb-org ffmpeg

# Clone repository
git clone https://github.com/your-org/sams-backend.git

# Install dependencies
npm install --build-from-source  # For native TensorFlow addons

# Configure as system service
sudo cp deploy/sams.service /etc/systemd/system/
sudo systemctl enable sams.service
sudo systemctl start sams.service
```

### Cloud Deployment (AWS)
```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f deploy/k8s/
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

Before contributing, please read our:
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Guidelines](CONTRIBUTING.md)

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- NVIDIA for hardware acceleration libraries
- TensorFlow.js team for edge ML capabilities
- MongoDB for flexible data storage solutions
- Redis for reliable queue management

---

**School Safety Matters** - Protecting educational environments with AI-powered monitoring systems.
