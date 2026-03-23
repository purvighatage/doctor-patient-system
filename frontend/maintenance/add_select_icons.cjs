const fs = require('fs');
const path = require('path');

// 1. Update FindDoctorsPage.jsx
const findPath = path.join(__dirname, 'frontend', 'src', 'pages', 'FindDoctorsPage', 'FindDoctorsPage.jsx');
if (fs.existsSync(findPath)) {
    let content = fs.readFileSync(findPath, 'utf8');

    // Add ChevronDown to imports
    const searchImports = `import { Search, MapPin, Star, Clock, Activity, ArrowLeft } from 'lucide-react';`;
    const replaceImports = `import { Search, MapPin, Star, Clock, Activity, ArrowLeft, ChevronDown } from 'lucide-react';`;

    // Inject Icons around select
    const searchSelect = `          <div className="filter-wrapper">
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >`;
            
    const replaceSelect = `          <div className="filter-wrapper">
            <Search size={18} className="filter-icon" />
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >`;

    const searchSelectEnd = `            </select>
          </div>`;
          
    const replaceSelectEnd = `            </select>
            <ChevronDown size={18} className="chevron-icon" />
          </div>`;

    if (content.includes(searchSelect) && content.includes(searchSelectEnd)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchSelect, replaceSelect);
        // Beware of multiple </select> </div> pairs, replace precisely
        content = content.replace(searchSelectEnd, replaceSelectEnd);
        fs.writeFileSync(findPath, content);
        console.log('Successfully added Icons to FindDoctorsPage select');
    } else {
        console.log('Target Select placeholders not found in FindDoctorsPage.jsx');
    }
}

// 2. Update FindDoctorsPage.css
const cssPath = path.join(__dirname, 'frontend', 'src', 'pages', 'FindDoctorsPage', 'FindDoctorsPage.css');
if (fs.existsSync(cssPath)) {
    let content = fs.readFileSync(cssPath, 'utf8');

    const searchCss = `.filter-wrapper {
  flex: 1;
}

.filter-wrapper select {
  width: 100%;
  padding: 12px 16px;`;

    const replaceCss = `.filter-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 16px;
  color: var(--text-light);
  pointer-events: none;
}

.chevron-icon {
  position: absolute;
  right: 16px;
  color: var(--text-light);
  pointer-events: none;
}

.filter-wrapper select {
  width: 100%;
  padding: 12px 40px 12px 44px;`;

    if (content.includes(searchCss)) {
        content = content.replace(searchCss, replaceCss);
        fs.writeFileSync(cssPath, content);
        console.log('Successfully added CSS absolute positioning for layout icons');
    } else {
        console.log('Target CSS selector block not found in FindDoctorsPage.css');
    }
}
