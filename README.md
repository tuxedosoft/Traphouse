# Traphouse Tumblelog/Microblog

A modern, lightweight tumbleloggin/microblogging platform built with Next.js, TypeScript, and SQLite. Share your thoughts with the world through a simple, elegant interface.

## 🚀 Features

- **Simple Posting**: Create and share posts with a clean, minimal interface
- **User Authentication**: Secure login system with admin access
- **Admin Dashboard**: Manage posts, view statistics, and customize site settings
- **Dark/Light Theme**: Toggle between themes for comfortable reading
- **Real-time Updates**: Posts appear instantly without page refresh
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **SQLite Database**: Lightweight, file-based database for easy deployment
- **TypeScript**: Full type safety for better development experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.4
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Authentication**: bcrypt for password hashing
- **State Management**: React Context API
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd microblog
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up the Database

The database will be automatically created when you first run the application. However, you can seed it with initial data:

```bash
# Seed admin user and default settings
npm run seed-admin
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔐 Default Credentials

After running the seed script, you can log in with:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials in production!

## 📁 Project Structure

```
microblog/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── login/             # Login page
│   │   ├── posts/             # Posts page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   ├── context/               # React context providers
│   └── lib/                   # Utility functions and database
├── scripts/                   # Database seeding scripts
├── microblog.db              # SQLite database file
└── package.json
```

## 🎯 Key Features Explained

### Authentication System
- Simple token-based authentication using localStorage
- Secure password hashing with bcrypt
- Protected admin routes

### Database Schema
- **posts**: Stores blog posts with id, content, and timestamp
- **users**: Stores user credentials (username, hashed password)
- **settings**: Stores site configuration (site name, tagline, privacy settings)

### Admin Dashboard
- View site statistics (post count, user count)
- Manage and delete posts
- Customize site settings (name, tagline, privacy)
- User profile management

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

### Other Platforms

The application can be deployed to any platform that supports Node.js:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### CPanel Installation

The *Server.js* file is the one that should be called in your Node.js setup on CPanel environments.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory for local development:

```env
# Database path (optional, defaults to microblog.db)
DATABASE_PATH=./microblog.db
```

### Site Settings

You can customize the site through the admin dashboard or by modifying the database directly:

- **Site Name**: The name displayed in the header
- **Site Tagline**: A brief description of your blog
- **Posts Public**: Whether posts are visible to non-authenticated users

## 📝 API Endpoints

- `GET /api/posts` - Retrieve posts
- `POST /api/posts` - Create a new post
- `DELETE /api/posts/[id]` - Delete a post
- `GET /api/stats` - Get site statistics
- `GET /api/settings` - Get site settings
- `POST /api/settings` - Update site settings
- `POST /api/auth` - Authenticate user

## 🎨 Customization

### Themes
The application supports dark and light themes. You can customize the theme colors by modifying the CSS variables in `src/app/globals.css`.

### Styling
The application uses Tailwind CSS for styling. You can customize the design by modifying the Tailwind configuration or adding custom CSS.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/tuxedosoft/microblog/issues) page
2. Create a new issue with a detailed description
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---

**Happy blogging! 🎉**
