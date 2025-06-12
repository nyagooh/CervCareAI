# Cervical Cancer Prediction AI Tool

## Project Overview

An AI-powered predictive tool designed to assist healthcare professionals in early cervical cancer risk assessment. This tool uses machine learning algorithms to analyze patient data and provide risk predictions, supporting early diagnosis and intervention strategies.

**⚠️ Disclaimer:** This tool is for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment.

## Architecture

┌─────────────────┐ HTTP/REST API ┌──────────────────┐ Go Scripts ┌─────────────────┐
│ │◄──────────────────►│ │◄────────────────────►│ │
│ React Frontend │ │ Go Backend │ │ ML Model │
│ │ │ │ │  │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
▼
┌────────────────┐
│ Database │
│ (SQLite/PostgreSQL) │
└────────────────┘


## Technology Stack

### Frontend
- **React.js** - User interface framework
- **Axios** - HTTP client for API communication
- **Material-UI/Tailwind CSS** - UI components and styling
- **Chart.js/Recharts** - Data visualization

### Backend
- **Go (Golang)** - REST API server
- **Gin/Echo** - Web framework
- **GORM** - ORM for database operations
- **SQLite** (development) / **PostgreSQL** (production)

### Machine Learning
- **Go** - ML model development
- **Decision Tree** - Machine learning algorithms
- **Jupyter Notebooks** - Model development and analysis

## Features

### Core Functionality
- ✅ User-friendly data input form
- ✅ Real-time risk assessment
- ✅ Decision tree-based predictions
- ✅ Risk level categorization (Low/Medium/High)
- ✅ Contributing factors analysis
- ✅ Medical recommendations
- ✅ Data validation and error handling

### Technical Features
- Secure data handling
- Interactive result visualization
- Responsive design
- Fast API response times
- Real-time predictions
- Model performance metrics

## Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16.0+)
- **Go** (v1.19+)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/code-her-care.git
cd code-her-care
```

# Backend setup(GO)

## Navigate to backend directory
cd backend

## Initialize Go module (if not already done)
go mod init cervical-cancer-ai

## Install dependencies
go mod tidy

## Run the backend server
go run cmd/server/main.go

The backend server will start on http://localhost:8080 

# Frontend Setup(React)
## Navigate to frontend directory (in a new terminal)
cd frontend

## Install dependencies
npm install

## Start the development server
npm start

The frontend will start on http://localhost:3000

## ML Model Setup (Python)

## Navigate to ML model directory (in a new terminal)
cd ml_model

## Create virtual environment
python -m venv venv

## Activate virtual environment

### On macOS/Linux:
source venv/bin/activate

## Install dependencies
pip install -r requirements.txt

## Train the model (optional - pre-trained model included)
python src/train_model.py


# Project Structure
