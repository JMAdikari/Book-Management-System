# 📚 Book Management System

A comprehensive full-stack web application designed to help book enthusiasts organize and manage their personal book collections. Built with modern technologies, this system provides a seamless experience for discovering, tracking, and managing books with advanced features like reading progress monitoring, favorites management, and integration with Google Books API for extensive book discovery.

## 📖 Description

The Book Management System is a modern web application that serves as your personal digital library. Whether you're an avid reader looking to organize your collection or someone who wants to keep track of books to read, this application provides all the tools you need. 

**Key highlights:**
- 🔐 **Secure Authentication** - JWT-based user authentication with encrypted passwords
- 📚 **Personal Library Management** - Add, organize, and track your book collection
- 🔍 **Smart Book Discovery** - Search millions of books using Google Books API
- 📊 **Reading Progress Tracking** - Monitor your reading journey with status indicators
- ⭐ **Favorites System** - Quick access to your most loved books
- 📱 **Responsive Design** - Seamless experience across all devices
- ⚡ **Modern Tech Stack** - Built with React 19, .NET 9.0, and SQL Server

## ✨ Features

### 🔐 User Authentication & Security
- **Secure Registration & Login**: JWT-based authentication system with encrypted password storage
- **User Profile Management**: Personalized user accounts with secure session management
- **Protected Routes**: Role-based access control ensuring data privacy
- **Password Encryption**: BCrypt hashing for maximum security
- **Session Persistence**: Automatic login state management

### 📚 Comprehensive Book Management
- **Personal Library**: Create and maintain your own digital book collection
- **Book Details Storage**: Store comprehensive information including title, author, ISBN, and cover images
- **Bulk Book Operations**: Add multiple books efficiently to your collection
- **Book Organization**: Categorize and organize books according to your preferences
- **Data Persistence**: All your book data is securely stored and accessible across sessions

### 🔍 Advanced Book Discovery
- **Google Books API Integration**: Search from millions of books in Google's vast database
- **Real-time Search**: Instant search results as you type
- **Detailed Book Information**: Access comprehensive book details including:
  - Cover images and thumbnails
  - Author information
  - Publication details
  - ISBN numbers
  - Book descriptions
- **Easy Add to Library**: One-click addition of discovered books to your personal collection

### 📊 Reading Progress Tracking
- **Reading Status Management**: Track books with three distinct statuses:
  - 📖 **Want to Read** - Books on your wishlist
  - 📚 **Currently Reading** - Books you're actively reading
  - ✅ **Finished** - Completed books
- **Progress Visualization**: Visual indicators for different reading statuses
- **Reading History**: Maintain a complete history of your reading journey
- **Status Updates**: Easy status modification as you progress through books

### ⭐ Favorites & Personalization
- **Favorites System**: Mark special books as favorites for quick access
- **Personalized Dashboard**: Customized view of your reading activity
- **Quick Filters**: Filter books by status, favorites, or other criteria
- **Reading Statistics**: Track your reading habits and progress over time

### 🎨 Modern User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Clean & Intuitive UI**: Modern design with focus on usability
- **Smooth Animations**: Enhanced user experience with Framer Motion animations
- **Dark/Light Mode Support**: Comfortable reading in any lighting condition
- **Fast Loading**: Optimized performance for quick page loads
- **Accessibility**: Built with accessibility best practices

### 🔄 Real-time Updates
- **Live Data Synchronization**: Real-time updates across all your devices
- **Instant Search Results**: Immediate feedback as you search for books
- **Dynamic Content Loading**: Efficient loading of book covers and details
- **Responsive Interactions**: Immediate visual feedback for all user actions

### 🛡️ Data Management & Security
- **Secure Data Storage**: All data encrypted and securely stored
- **Backup & Recovery**: Reliable data persistence with SQL Server
- **Data Validation**: Comprehensive input validation on both client and server
- **Error Handling**: Graceful error handling with user-friendly messages
- **Performance Optimization**: Efficient database queries and caching strategies

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API requests

### Backend
- **ASP.NET Core 9.0** - Cross-platform web framework
- **Entity Framework Core** - Object-relational mapping
- **SQL Server** - Database management system
- **JWT Authentication** - Secure token-based authentication
- **BCrypt.NET** - Password hashing

### APIs & Integrations
- **Google Books API** - Book search and information retrieval

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server Express
- **Google Books API Key** (see setup instructions below)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Book Management System"
```

### 2. Google Books API Setup

To enable book search functionality, you need to obtain a Google Books API key:

#### Getting Google Books API Key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Books API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Books API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

#### Configure Environment Variables:
Create a `.env` file in the **backend** directory and add your Google Books API key:

```env
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
```

**Note**: Replace `your_google_books_api_key_here` with your actual Google Books API key.

**Important**: 
- Keep your API key secure and never commit it to version control
- The `.env` file is already included in `.gitignore` to prevent accidental commits
- Restart the backend server after adding the API key

### 3. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
dotnet restore
```

Configure the database connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER_NAME;Initial Catalog=booksystem;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False"
  },
  "Jwt": {
    "Key": "BookManagementSystemSecretKey123456789",
    "Issuer": "BookManagementSystem",
    "Audience": "BookManagementSystemUsers"
  }
}
```

**Note**: Replace `YOUR_SERVER_NAME` with your actual SQL Server instance name (e.g., `localhost`, `(localdb)\MSSQLLocalDB`, or your computer name).

**Ensure SQL Server is running** on your machine.

Run database migrations to create the database:
```bash
dotnet ef database update
```

If you don't have Entity Framework tools installed globally, install them first:
```bash
dotnet tool install --global dotnet-ef
```

### 4. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

## 🚀 Running the Application

### Method 1: Using VS Code Tasks (Recommended)

This project includes pre-configured VS Code tasks for easy startup:

1. **Start Backend**: Press `Ctrl+Shift+P`, type "Tasks: Run Task", and select "Start Backend"
2. **Start Frontend**: Press `Ctrl+Shift+P`, type "Tasks: Run Task", and select "Start Frontend"

### Method 2: Manual Startup

#### Step 1: Start the Backend Server
Open a terminal and navigate to the backend directory:
```bash
cd backend
dotnet run
```
The API will be available at:
- **HTTPS**: `https://localhost:7023`
- **HTTP**: `http://localhost:5131`

#### Step 2: Start the Frontend Development Server
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm run dev
```
The React application will be available at `http://localhost:5173`

### Important Notes:
- **Start the backend first** before starting the frontend
- The frontend is configured to proxy API calls to `https://localhost:7023`
- Make sure SQL Server is running and accessible
- The database connection uses Windows Authentication (Integrated Security)
- **Ensure your Google Books API key is configured** in the `.env` file for book search functionality

## 📁 Project Structure

```
Book Management System/
├── backend/                 # ASP.NET Core API
│   ├── Controllers/        # API controllers
│   │   ├── AuthController.cs
│   │   ├── BooksController.cs
│   │   └── UserController.cs
│   ├── Data/               # Database context
│   │   └── ApplicationDbContext.cs
│   ├── Models/             # Data models
│   │   ├── Book.cs
│   │   └── User.cs
│   ├── Services/           # Business logic
│   │   ├── AuthService.cs
│   │   └── BookService.cs
│   └── Migrations/         # EF Core migrations
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── BookCard.jsx
│   │   │   ├── BookCatalog.jsx
│   │   │   ├── BookDetailsModal.jsx
│   │   │   ├── BookSearch.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   └── services/       # API services
│   │       ├── api.js
│   │       ├── authService.js
│   │       └── googleBooksService.js
│   └── public/             # Static assets
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get user's books
- `POST /api/books` - Add a new book
- `PUT /api/books/{id}` - Update book information
- `DELETE /api/books/{id}` - Delete a book

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## � Features in Detail

### 📚 Book Search & Discovery
- **Intelligent Search**: Powered by Google Books API, search through millions of books by title, author, or ISBN
- **Rich Book Information**: Access detailed book metadata including:
  - High-quality cover images
  - Complete author information
  - Publication dates and publishers
  - Book descriptions and summaries
  - ISBN numbers for easy identification
- **Preview Integration**: View book previews and additional information directly from Google Books

### 📖 Personal Library Management
- **Comprehensive Collection**: Build and maintain your personal digital library
- **Reading Status Workflow**: Organize books through your reading journey:
  - Add books to your "Want to Read" list for future reading
  - Move books to "Currently Reading" when you start them
  - Mark books as "Finished" when completed
- **Favorites Management**: Quickly identify and access your most beloved books
- **Library Analytics**: Track your reading habits and progress over time

### 🔐 Security & User Experience
- **Enterprise-Grade Security**: 
  - JWT token-based authentication
  - BCrypt password encryption
  - Secure session management
  - Protected API endpoints
- **Seamless User Experience**:
  - Automatic login persistence
  - Smooth page transitions
  - Responsive design for all devices
  - Fast loading times with optimized performance



