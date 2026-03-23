const fs = require('fs');
const path = require('path');

const findPath = path.join(__dirname, 'frontend', 'src', 'pages', 'FindDoctorsPage', 'FindDoctorsPage.jsx');
if (fs.existsSync(findPath)) {
    let content = fs.readFileSync(findPath, 'utf8');

    const searchImports = `import { Link } from 'react-router-dom';`;
    const replaceImports = `import { Link, useLocation } from 'react-router-dom';`;

    const searchState = `  const [specialtyFilter, setSpecialtyFilter] = useState('');`;
    const replaceState = `  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const specialtyParam = params.get('specialty');
    
    if (searchParam) setSearchTerm(searchParam);
    if (specialtyParam) setSpecialtyFilter(specialtyParam);
  }, [location.search]);`;

    if (content.includes(searchState)) {
        content = content.replace(searchImports, replaceImports);
        content = content.replace(searchState, replaceState);
        fs.writeFileSync(findPath, content);
        console.log('Successfully bound URL search parameters to state in FindDoctorsPage.jsx');
    } else {
        console.log('Target State placeholder not found in FindDoctorsPage.jsx');
    }
} else {
    console.log('Path not found:', findPath);
}
