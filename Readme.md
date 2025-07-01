# Color Normalization Project
## Overview

This project provides a user-friendly interface for applying different color normalization techniques to medical and histological images. Color normalization is crucial in medical image analysis as it helps standardize images from different scanners, lighting conditions, and staining protocols, making them more suitable for analysis and machine learning applications.

## Documentation Index

For detailed information about the project, please refer to our comprehensive documentation:

### Core Documentation

| Document | Description | Content |
|----------|-------------|---------|
| **[About Project](docs/About-Project.md)** | Project overview, objectives, and academic context | Institution details, team information, goals, problem statement, innovation impact, and future roadmap |
| **[System Architecture](docs/Architecture.md)** | Technical architecture and system design | Technology stack, system workflow, component hierarchy, API design, and deployment strategies |
| **[Color Normalization Techniques](docs/Color-Normalization.md)** | Detailed technical documentation of algorithms | Mathematical foundations, implementation details, clinical applications, and academic references |

---

## Technology Stack

### Backend
- FastAPI (Python) with OpenCV, scikit-image, and NumPy for high-performance image processing
- SPAMS, Pillow, and aiofiles for advanced processing and efficient file handling

### Frontend
- React 18 with Vite build tool and Tailwind CSS for modern, responsive UI
- Recharts, MUI X-Charts for visualization, and Axios for API communication

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment** (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**:
   ```bash
   python run.py
   ```

   The backend API will be available at `http://localhost:8080`
   
   **API Documentation**: Visit `http://localhost:8080/docs` for interactive API documentation

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend application will be available at `http://localhost:5173`

### Production Build

To build the frontend for production:
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.


## License

This project is licensed under the MIT License - see the LICENSE file for details.

