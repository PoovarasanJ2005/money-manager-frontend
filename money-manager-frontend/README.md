# Money Manager Frontend

A modern, responsive web application for managing personal finances built with React, Vite, and TailwindCSS.

## Features

- 🎨 **Beautiful UI**: Modern design with glassmorphism, gradients, and smooth animations
- 📊 **Interactive Dashboard**: Real-time charts and statistics
- 💰 **Transaction Management**: Add, edit, and delete income/expenses
- 🔍 **Advanced Filtering**: Filter by type, category, division, and date range
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔐 **Secure Authentication**: JWT-based authentication
- ⏰ **12-Hour Edit Window**: Edit/delete transactions within 12 hours
- 📈 **Visual Analytics**: Charts powered by Recharts
- 🎯 **Category Management**: Custom categories with icons and colors

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update API URL if needed

3. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   └── LoadingSpinner.jsx
│   ├── layout/           # Layout components
│   │   └── Layout.jsx
│   └── transactions/     # Transaction-specific components
│       └── TransactionModal.jsx
├── context/              # React Context providers
│   └── AuthContext.jsx
├── pages/                # Page components
│   ├── Dashboard.jsx
│   ├── Transactions.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/             # API services
│   └── api.js
├── utils/                # Utility functions
│   └── helpers.js
├── App.jsx               # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Features in Detail

### Dashboard
- **Period Selection**: View data by daily, weekly, monthly, or yearly periods
- **Stats Cards**: Beautiful gradient cards showing income, expense, and balance
- **Trends Chart**: Line chart showing income vs expense over time
- **Category Breakdown**: Pie chart of top expense categories
- **Recent Transactions**: Quick view of latest transactions

### Transactions
- **Add/Edit/Delete**: Full CRUD operations with 12-hour restriction
- **Advanced Filters**: 
  - Type (Income/Expense)
  - Category
  - Division (Office/Personal)
  - Date Range
  - Search by description
- **Summary Cards**: Real-time totals for filtered data
- **Visual Indicators**: Color-coded transaction types

### Authentication
- **Login/Register**: Secure authentication with JWT
- **Form Validation**: Client-side validation for all forms
- **Auto-redirect**: Automatic navigation based on auth state
- **Token Management**: Automatic token refresh and validation

## Design System

### Colors
- **Primary**: Blue (#0ea5e9)
- **Success**: Green (#22c55e)
- **Danger**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)

### Components
All components follow a consistent design pattern:
- Rounded corners (xl/2xl)
- Soft shadows
- Smooth transitions
- Hover effects
- Responsive spacing

### Animations
- Fade in
- Slide up/down
- Scale in
- Smooth transitions

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## API Integration

The app communicates with the backend API using Axios. All API calls are centralized in `src/services/api.js`.

### API Endpoints Used:
- `/auth/register` - User registration
- `/auth/login` - User login
- `/auth/me` - Get current user
- `/transactions` - CRUD operations
- `/categories` - Category management
- `/dashboard/*` - Dashboard analytics

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in Netlify dashboard

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist` folder to your hosting service
3. Configure environment variables

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the GitHub repository.
