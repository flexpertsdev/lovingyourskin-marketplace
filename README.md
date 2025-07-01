# Loving Your Skin - B2B Korean Beauty Marketplace

A modern B2B platform connecting Korean beauty brands with international retailers, built with React, TypeScript, and Tailwind CSS.

## 🌸 Overview

Loving Your Skin (LYS) is an invite-only B2B marketplace that eliminates barriers between Korean beauty brands and international retailers. The platform features:

- **Invite-Only Access**: Secure registration system with sales rep linking
- **Multi-Language Support**: English, Korean, and Chinese interfaces
- **MOQ Management**: Visual progress tracking for minimum order quantities
- **Per-Brand Ordering**: Separate checkout process for each brand
- **No Payment Processing**: Invoice-based system for established B2B relationships
- **CPNP Certification**: Focus on EU/UK compliant products

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/flexpertsdev/lovingyourskin.git
cd lovingyourskin

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Query
- **Authentication**: Firebase Auth (to be implemented)
- **Database**: Firebase Firestore (to be implemented)
- **Deployment**: Netlify

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API services (currently mock)
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
├── theme/           # Design system constants
└── mock-data/       # Sample data for development
```

## 🎨 Design System

The project uses a rose gold color palette with mobile-first responsive design:

- **Primary**: Rose Gold (#D4A5A5)
- **Background**: Soft Pink (#FDF8F6)
- **Text**: Deep Charcoal (#1A1A1A)
- **Typography**: Inter + Noto Sans KR

## 📱 Features

### For Retailers
- Browse verified Korean beauty brands
- Filter products by CPNP certification
- Visual MOQ tracking in shopping cart
- Multi-language product information
- Order status tracking
- In-platform messaging

### For Admins
- Invite-only user management
- Order processing dashboard
- Brand and product management
- Sales rep assignment
- Analytics and reporting

## 🔄 Current Status

The project is in active development with:
- ✅ Project setup and architecture
- ✅ Design system extracted from wireframes
- ✅ TypeScript types and mock services
- ✅ State management setup
- 🚧 Component library development
- 📅 Firebase integration planned

## 🤝 Contributing

This is currently a private project. For access or questions, please contact the project maintainers.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for the Korean beauty industry