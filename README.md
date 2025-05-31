# Laptop Comparison System (LCS)

A full-stack web application for comparing laptops across multiple e-commerce platforms with real-time pricing and specifications.

## 🌟 Features

- **Multi-Platform Price Comparison**: Compare laptop prices from Amazon, Flipkart, and other major e-commerce platforms
- **Advanced Search & Filtering**: Search by brand, specifications, price range, and more
- **User Authentication**: Secure login/signup system with session management
- **Product Recommendations**: Personalized product suggestions based on user preferences
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **Real-time Data**: Live product information and pricing updates

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context for authentication and global state
- **Build Tool**: Vite for fast development and builds
- **Components**: Modular component architecture with reusable UI elements

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB for storing user data and product information
- **Authentication**: Session-based authentication with secure cookies
- **API**: RESTful API design with comprehensive error handling
- **Data Scraping**: Automated web scraping for real-time product data

### Data Sources
- **Amazon**: Product listings, prices, specifications, and reviews
- **Flipkart**: Product listings, prices, specifications, and reviews
- **Data Processing**: Duplicate removal, price matching, and data normalization

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lcs1
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   Create `.env` files in both `server` and `client` directories:
   
   **Server (.env)**
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/laptop-comparison
   SESSION_SECRET=your-secret-key
   NODE_ENV=development
   ```

5. **Start the application**
   
   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm start
   ```
   
   **Terminal 2 - Start the client:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## 📁 Project Structure

```
lcs1/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components (Home, Search, Profile)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React context providers
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend application
│   ├── model/             # Database models
│   ├── utils/             # Server utilities
│   ├── Data/              # Static data files
│   └── server.js          # Main server file
├── Scrapping/             # Web scraping scripts
│   ├── aM.js              # Amazon scraper
│   ├── Flip.js            # Flipkart scraper
│   └── match.js           # Data matching utilities
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/check-auth` - Check authentication status

### Products
- `GET /api/suggestions` - Get product suggestions
- `GET /api/search` - Search products with filters
- `GET /api/advancedsearch` - Advanced search with multiple parameters

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🛠️ Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Axios/Fetch API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- Express Session
- bcrypt (for password hashing)

### Development Tools
- ESLint
- Prettier
- PostCSS
- Git

## 🧪 Testing

Run tests for the project:

```bash
# Test API endpoints
node test-api.js

# Test suggestions functionality
node test-suggestions.js

# Detailed testing
node detailed-test.js
```

## 📊 Data Management

The application includes sophisticated data management features:

- **Data Scraping**: Automated scripts to fetch product data from multiple sources
- **Duplicate Removal**: Intelligent algorithms to identify and remove duplicate products
- **Price Matching**: Cross-platform price comparison and tracking
- **Data Normalization**: Standardized product specifications across platforms

## 🔐 Security Features

- Secure user authentication with session management
- Password hashing using bcrypt
- CORS protection
- Input validation and sanitization
- Secure cookie handling

## 🚀 Deployment

### Production Build

**Client:**
```bash
cd client
npm run build
```

**Server:**
```bash
cd server
npm run start
```

### Environment Variables for Production
Make sure to set appropriate environment variables for production:
- Database connection strings
- Session secrets
- API keys (if applicable)
- CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email [your-email] or create an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] Real-time price alerts
- [ ] Wishlist functionality
- [ ] Product comparison charts
- [ ] Mobile app development
- [ ] Machine learning-based recommendations
- [ ] More e-commerce platform integrations
- [ ] Advanced analytics dashboard

---

Built with ❤️ using React, Node.js, and MongoDB
