# Binance IQ

A modern web application for cryptocurrency analysis and trading insights, built with React, TypeScript, and FastAPI.

## Features

- Real-time cryptocurrency data analysis
- AI-powered trading insights
- Modern, responsive UI with Tailwind CSS
- Secure backend API with FastAPI
- Type-safe development with TypeScript

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- React Router
- Axios for API calls
- Heroicons for UI components

### Backend
- FastAPI
- Python 3.12
- OpenAI API integration
- Pydantic for data validation
- Uvicorn for ASGI server

## Prerequisites

- Node.js (v16 or higher)
- Python 3.12
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/binance-iq.git
cd binance-iq
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both root and backend directories
   - Add your OpenAI API key to the backend `.env` file

## Development

### Frontend Development
```bash
npm start
```
The frontend will be available at http://localhost:3000

### Backend Development
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python3 src/server.py
```
The API will be available at http://localhost:8000

## Building for Production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Project Structure

```
binance-iq/
├── src/                    # Frontend source code
├── public/                 # Static assets
├── backend/
│   ├── src/               # Backend source code
│   ├── data/              # Data files
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend environment variables
├── package.json           # Frontend dependencies
└── tsconfig.json         # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Binance for cryptocurrency data
- All contributors and maintainers
