const fs = require('fs');
const path = require('path');

// 1. Update HomePage.jsx
const appPath = path.join(__dirname, 'src', 'pages', 'HomePage', 'HomePage.jsx');
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');

    // Add imports
    const searchImports = `import { Link } from 'react-router-dom';
import { Activity, Moon, Sun, ArrowRight, Calendar, Video, Shield, Users, Star, CheckCircle } from 'lucide-react';`;

    const replaceImports = `import { Link, useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, ArrowRight, Calendar, Video, Shield, Users, Star, CheckCircle, Search } from 'lucide-react';`;

    // Add state hooks
    const searchState = `const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);`;

    const replaceState = `const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();`;

    // Inject Form
    const searchForm = `            <p className="hero-subtitle">
              Connect with top healthcare professionals, manage appointments, and access your medical records - all in one secure platform.
            </p>
            
            <div className="hero-cta">`;

    const replaceForm = `            <p className="hero-subtitle">
              Connect with top healthcare professionals, manage appointments, and access your medical records - all in one secure platform.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); navigate(\`/find?search=\${searchQuery}\`); }} className="hero-search-bar">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search doctor, specialties (e.g. Cardiologist)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="hero-cta">`;

    if (content.includes(searchForm)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchState, replaceState);
        content = content.replace(searchForm, replaceForm);
        fs.writeFileSync(appPath, content);
        console.log('Successfully added Search Bar to HomePage.jsx');
    } else {
        console.log('Target Form placeholder not found in HomePage.jsx');
    }
}

// 2. Update HomePage.css
const cssPath = path.join(__dirname, 'src', 'pages', 'HomePage', 'HomePage.css');
if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const cssAddition = `
/* Hero Search Bar */
.hero-search-bar {
  display: flex;
  background: #ffffff;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  max-width: 500px;
  margin-bottom: 32px;
  border: 1px solid rgba(0,0,0,0.05);
  gap: 8px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 0 12px;
}

.search-input-wrapper .search-icon {
  color: #757575;
}

.search-input-wrapper input {
  border: none;
  outline: none;
  font-size: 15px;
  width: 100%;
  color: #424242;
}

.hero-search-bar button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
}

/* Dark Mode Adjustments */
body.dark .hero-search-bar {
  background-color: #1e1e1e;
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
}

body.dark .search-input-wrapper input {
  background-color: transparent !important;
  color: #e0e0e0 !important;
}
`;
    
    fs.appendFileSync(cssPath, cssAddition);
    console.log('Successfully appended styles to HomePage.css');
}
