# ChartDreamer - Figma Plugin

📊 A Figma plugin for product managers and designers to effortlessly create beautiful and complex data visualizations like Sankey diagrams, perfect for B2B dashboards and data storytelling.

## 🚀 Features

- **React + Vite** based development environment
- **TypeScript** support for better development experience
- **Modern UI** with React components
- **Easy to extend** for new chart types

## 🛠️ Development

### Prerequisites

- Node.js 18.16.0 or higher
- npm 9.5.1 or higher

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── ui/           # React UI components
│   ├── App.tsx   # Main App component
│   ├── main.tsx  # React entry point
│   └── index.html # HTML template
├── code/         # Figma plugin core code
│   └── code.ts   # Main plugin logic
└── types/        # TypeScript type definitions
    └── figma.d.ts # Figma API types
```

## 🔌 Using in Figma

1. Build the project: `npm run build`
2. In Figma desktop app, go to Plugins > Development > Import plugin from manifest
3. Select the `manifest.json` file from this project
4. The plugin should now appear in your plugins list

## 🎯 Current Status

- ✅ Project structure setup
- ✅ React + Vite configuration
- ✅ TypeScript configuration
- ✅ Basic UI component
- ✅ Figma plugin integration
- 🔄 Next: Implement chart generation features

## 📝 License

MIT License - see LICENSE file for details
