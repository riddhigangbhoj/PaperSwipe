# PaperSwipe

A Tinder-style web application for discovering academic research papers. Swipe through papers from arXiv and build your personal research library!

## Features

- **Swipe Interface**: Intuitive Tinder-like swipe gestures to browse papers
- **Multiple Research Topics**: AI, Machine Learning, Computer Vision, Physics, Math, and more
- **Paper Details**: View full abstracts, authors, and publication information
- **Save Papers**: Build a personal collection of interesting papers
- **Local Storage**: All data stored locally in your browser (no account needed)
- **Direct Links**: Quick access to PDFs and source pages

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone or navigate to the project directory:
```bash
cd paper-swipe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Select Topics**: On first visit, choose research topics you're interested in
2. **Swipe Papers**:
   - Swipe right or click ✓ to save papers
   - Swipe left or click ✗ to skip
   - Tap the card to view full details
3. **View Saved**: Access your saved papers from the "Saved" tab
4. **Adjust Settings**: Change topics or clear history in "Settings"

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Swipe Library**: react-tinder-card
- **API**: arXiv API
- **Storage**: LocalStorage

## API Information

This app uses the [arXiv API](https://arxiv.org/help/api/index) to fetch research papers. The API is free and doesn't require authentication, but has a rate limit of 1 request per 3 seconds (automatically handled by the app).

## Project Structure

```
paper-swipe/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Card/        # Paper cards and swipe stack
│   │   ├── Layout/      # Header and navigation
│   │   └── Modal/       # Paper detail modal
│   ├── context/         # React context for state management
│   ├── pages/           # Main page components
│   ├── services/        # API integration
│   └── utils/           # Helper functions
├── public/              # Static assets
└── package.json
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Future Enhancements

- User authentication and cloud sync
- More research paper APIs (Semantic Scholar, PubMed)
- Advanced filtering options
- Export saved papers (BibTeX, CSV)
- Paper recommendations based on swipe history
- Mobile app version

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License

## Acknowledgments

- Research papers provided by [arXiv.org](https://arxiv.org)
- Built with React and Vite
- Inspired by Tinder's swipe interface
