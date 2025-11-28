# 🎓 جامعتي (Gamaati) - Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Modern, Responsive University Management System Frontend**

[Live Demo](https://gamaati.netlify.app/) | [Backend Repo](https://github.com/Yous2ef/uniSystemBackend) | [Documentation](./Guides/)

</div>

---

## 📋 Table of Contents

-   [About](#-about)
-   [Features](#-features)
-   [Tech Stack](#-tech-stack)
-   [Prerequisites](#-prerequisites)
-   [Quick Start](#-quick-start)
-   [Environment Variables](#-environment-variables)
-   [Running the Application](#-running-the-application)
-   [Building for Production](#-building-for-production)
-   [Project Structure](#-project-structure)
-   [User Roles & Access](#-user-roles--access)
-   [Internationalization](#-internationalization)
-   [Theming](#-theming)
-   [Deployment](#-deployment)
-   [Troubleshooting](#-troubleshooting)
-   [Contributing](#-contributing)

---

## 🎯 About

**جامعتي (Gamaati)** frontend is a modern, responsive web application for managing university operations. Built with React 19 and TypeScript, it provides an intuitive interface for students, faculty, and administrators to manage academic activities.

### 🌟 Key Highlights

-   ✅ **Bilingual Interface**: Full Arabic (RTL) and English (LTR) support
-   ✅ **Theme Support**: Light and Dark modes
-   ✅ **Fully Responsive**: Works on mobile, tablet, and desktop
-   ✅ **Type-Safe**: Complete TypeScript implementation
-   ✅ **Modern UI**: Built with shadcn/ui components
-   ✅ **Real-time Updates**: Toast notifications and progress tracking
-   ✅ **Optimized Performance**: Code splitting and lazy loading

---

## ✨ Features

### 👥 User Roles

#### **Super Admin / Admin**

-   📊 Dashboard with system statistics
-   🏢 Department management
-   📚 Course and curriculum management
-   👥 Student and faculty management
-   📅 Academic term and section management
-   📋 Department application approvals
-   📄 Comprehensive reports
-   💾 Database backup and restore
-   ⚙️ System settings

#### **Faculty / Teaching Assistant**

-   📊 Faculty dashboard
-   📖 Course management (8 tabs per course):
    -   Students list
    -   Grades entry
    -   Attendance tracking
    -   Course materials
    -   Announcements
    -   Schedule
    -   Exams
    -   Analytics
-   📄 Faculty reports

#### **Student**

-   📊 Student dashboard with academic summary
-   📚 Course registration with validation
-   📅 Schedule viewing
-   📖 Enrolled subjects with materials
-   📊 Grades and transcript viewing
-   📋 Attendance tracking
-   🎓 Department (specialization) selection
-   📝 Request submission
-   ⚙️ Profile settings

### 🎨 UI/UX Features

-   Modern card-based design
-   Smooth animations and transitions
-   Loading states and error handling
-   Toast notifications (success/error/info)
-   Progress indicators for long operations
-   Modal dialogs for confirmations
-   Data tables with sorting and filtering
-   Responsive navigation sidebar
-   Breadcrumb navigation

---

## 🛠️ Tech Stack

| Technology          | Purpose                      |
| ------------------- | ---------------------------- |
| **React 19**        | UI framework                 |
| **TypeScript**      | Type-safe JavaScript         |
| **Vite**            | Build tool and dev server    |
| **TailwindCSS 4**   | Utility-first CSS framework  |
| **shadcn/ui**       | Accessible component library |
| **Zustand**         | State management             |
| **React Router**    | Client-side routing          |
| **Axios**           | HTTP client                  |
| **i18next**         | Internationalization         |
| **React Hook Form** | Form handling                |
| **Zod**             | Schema validation            |
| **Recharts**        | Charts and graphs            |
| **Lucide React**    | Icon library                 |
| **Sonner**          | Toast notifications          |

---

## 📦 Prerequisites

Before you begin, ensure you have:

-   **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
-   **npm** or **yarn**: Latest version
-   **Git**: For cloning the repository
-   **Backend API**: Running backend server (see [Backend Setup](https://github.com/Yous2ef/uniSystemBackend))

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
# Clone the frontend repository
git clone https://github.com/Yous2ef/uniSystemFrontend.git
cd uniSystemFrontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit `.env` with your backend API URL (see [Environment Variables](#-environment-variables) section).

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will start at `http://localhost:5173` 🚀

### 5. Login with Default Account

Use one of these accounts (after backend seeding):

-   **Admin**: `admin@university.edu` / `Admin@123`
-   **Faculty**: `faculty@university.edu` / `Faculty@123`
-   **Student**: `student@university.edu` / `Student@123`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API Configuration
VITE_BACKEND_API_URL=http://localhost:5000/api

# Optional: Netlify Build Configuration
# (Automatically set by Netlify)
```

### 📝 Environment Variables Explanation

| Variable               | Description          | Default                     |
| ---------------------- | -------------------- | --------------------------- |
| `VITE_BACKEND_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> **Note**: For production, Vite automatically uses `import.meta.env.VITE_BACKEND_API_URL` or falls back to the default value.

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

-   Runs with **hot module replacement (HMR)**
-   Opens at `http://localhost:5173`
-   Auto-reloads on file changes
-   Source maps enabled for debugging

### Preview Production Build

```bash
# Build first
npm run build

# Preview the build
npm run preview
```

### Available Scripts

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |

---

## 📦 Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:

-   Minified JavaScript and CSS
-   Code splitting for optimal loading
-   Asset optimization
-   Source maps (optional)

### 2. Test the Build

```bash
npm run preview
```

### 3. Deploy

The `dist/` directory is ready to be deployed to any static hosting service (Netlify, Vercel, etc.).

---

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   └── layout/             # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── admin/              # Admin pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DepartmentsPage.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   └── ...
│   │   ├── faculty/            # Faculty pages
│   │   │   ├── FacultyDashboard.tsx
│   │   │   ├── FacultyCourseManagement.tsx
│   │   │   └── ...
│   │   └── student/            # Student pages
│   │       ├── StudentDashboard.tsx
│   │       ├── StudentGradesPage.tsx
│   │       ├── RegistrationPage.tsx
│   │       └── ...
│   ├── services/
│   │   └── api.ts              # API service with axios
│   ├── store/
│   │   ├── auth.ts             # Auth state (Zustand)
│   │   └── theme.ts            # Theme state
│   ├── i18n/
│   │   ├── config.ts           # i18next configuration
│   │   ├── en.json             # English translations
│   │   └── ar.json             # Arabic translations
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── assets/                 # Images, fonts, etc.
│   ├── animations.css          # Custom animations
│   ├── index.css               # Global styles
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── public/
│   └── _redirects              # Netlify redirects
├── Guides/                     # Documentation
│   ├── IMPLEMENTATION_PLAN.md
│   ├── SIDEBAR_STRUCTURE.md
│   ├── USER_GUIDE_AR.md
│   └── ...
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── components.json             # shadcn/ui config
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies & scripts
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md                   # This file
```

---

## 👥 User Roles & Access

### Route Protection

The app uses route guards to protect pages based on user roles:

```typescript
// Protected Routes (any authenticated user)
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Admin Only Routes
<AdminRoute>
  <DepartmentsPage />
</AdminRoute>

// Student Only Routes
<StudentRoute>
  <RegistrationPage />
</StudentRoute>

// Faculty Only Routes
<FacultyRoute>
  <FacultyCourseManagement />
</FacultyRoute>
```

### Navigation Structure

#### **Admin/Super Admin Sidebar**

-   📊 Dashboard
-   📄 Reports
-   📋 Department Applications
-   🏢 Departments
-   📚 Courses
-   📖 Curricula
-   👥 Students
-   👥 Batches
-   📅 Academic Terms
-   📅 Sections
-   ⏰ Schedule Management
-   👨‍🏫 Faculty
-   ⚙️ Settings

#### **Faculty Sidebar**

-   📊 Dashboard
-   📄 Reports
-   📚 My Courses (collapsible)
    -   📖 Course 1 (with 8 tabs)
    -   📖 Course 2
    -   ...

#### **Student Sidebar**

-   📊 Dashboard
-   📚 My Subjects
-   📊 Grades
-   📋 Attendance
-   📅 Schedule
-   📝 Registration
-   🎓 Department Selection
-   ⚙️ Settings

---

## 🌍 Internationalization

The app supports Arabic and English with full RTL/LTR support.

### Changing Language

Use the language toggle in the header:

-   🇬🇧 **English** (LTR)
-   🇸🇦 **العربية** (RTL)

### Adding Translations

1. Add keys to `src/i18n/en.json` and `src/i18n/ar.json`
2. Use in components:

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
    const { t } = useTranslation();

    return <h1>{t("welcome")}</h1>;
}
```

---

## 🎨 Theming

### Theme Toggle

Use the theme toggle in the header to switch between:

-   ☀️ **Light Mode**
-   🌙 **Dark Mode**

### Customizing Theme

Edit `src/index.css` to customize colors:

```css
:root {
    --primary: #2563eb;
    --secondary: #64748b;
    --success: #16a34a;
    --danger: #dc2626;
    /* ... more colors */
}

.dark {
    --primary: #3b82f6;
    --secondary: #94a3b8;
    /* ... dark mode colors */
}
```

---

## 🚀 Deployment

### Deploying to Netlify (Current)

The live demo is hosted at: **https://gamaati.netlify.app/**

#### Automatic Deployment

1. Connect your GitHub repo to Netlify
2. Configure build settings:
    - **Build Command**: `npm run build`
    - **Publish Directory**: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy automatically on every push to `main`

#### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod
```

### Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploying to Other Platforms

The `dist/` folder can be deployed to:

-   GitHub Pages
-   AWS S3 + CloudFront
-   DigitalOcean App Platform
-   Firebase Hosting
-   Any static hosting service

---

## 🐛 Troubleshooting

### Common Issues

#### **1. Cannot Connect to Backend**

**Error**: `Network Error` or `API request failed`

**Solution**:

```bash
# Check if backend is running
curl http://localhost:5000/health

# Verify VITE_BACKEND_API_URL in .env
# Make sure CORS_ORIGIN in backend .env matches frontend URL
```

#### **2. Build Fails**

**Error**: `Build failed with errors`

**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### **3. Environment Variables Not Working**

**Error**: Variables are `undefined`

**Solution**:

```bash
# Vite env variables MUST start with VITE_
# Restart dev server after changing .env
npm run dev
```

#### **4. RTL/LTR Issues**

**Solution**:

-   Check `dir` attribute in `index.html`
-   Verify TailwindCSS RTL plugin is configured
-   Use logical properties (e.g., `ms-4` instead of `ml-4`)

#### **5. Authentication Issues**

**Solution**:

```typescript
// Clear localStorage and cookies
localStorage.clear();
// Refresh and login again
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

-   Use TypeScript with strict mode
-   Follow React best practices
-   Use functional components with hooks
-   Add proper TypeScript types
-   Follow TailwindCSS conventions
-   Write meaningful commit messages

---

## 📄 Documentation

Additional documentation available in the `Guides/` folder:

-   [Implementation Plan](./Guides/IMPLEMENTATION_PLAN.md)
-   [Sidebar Structure](./Guides/SIDEBAR_STRUCTURE.md)
-   [User Guide (Arabic)](./Guides/USER_GUIDE_AR.md)
-   [Faculty UI Guide](./Guides/FACULTY_UI_GUIDE.md)
-   [How to Access Tabs](./Guides/HOW_TO_ACCESS_TABS.md)

---

## 🔗 Links

-   🌐 **Live Demo**: [https://gamaati.netlify.app/](https://gamaati.netlify.app/)
-   💻 **Frontend Repository**: [https://github.com/Yous2ef/uniSystemFrontend](https://github.com/Yous2ef/uniSystemFrontend)
-   🔧 **Backend Repository**: [https://github.com/Yous2ef/uniSystemBackend](https://github.com/Yous2ef/uniSystemBackend)

---

## 🙏 Acknowledgments

Built with ❤️ for the College of Computer Science

-   **React** and **Vite** teams
-   **shadcn/ui** for beautiful components
-   **TailwindCSS** for utility-first styling
-   All open-source contributors

---

<div align="center">

**Made with 💻 and ☕**

If you find this project helpful, please give it a ⭐️!

</div>
