# Flex Living Reviews Dashboard

A modern, full-featured reviews management dashboard for Flex Living property managers.

## Features

### 📊 Dashboard
- Real-time statistics and metrics
- Rating distribution charts
- Property performance comparison
- Recent reviews overview

### 👥 Reviews Management
- Comprehensive filtering (property, rating, status, channel)
- Sortable review table
- Quick approve/reject actions
- Detailed review view

### 🔌 Integrations
- **Hostaway API**: Real guest review data
- **Google Reviews**: Integration with Google Places API
- **Mock Data**: Fallback for development and testing

### 🎨 Modern UI
- Responsive design
- Dark mode support
- Loading states and error boundaries
- Accessible components

## Quick Start

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flex-living-reviews-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev