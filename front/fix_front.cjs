const fs = require('fs');

function applyRegexes(filePath, edits) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  edits.forEach(e => {
    content = content.replace(e.find, e.replace);
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
}

// 1. Maincomp.jsx
applyRegexes('src/Components/home/Maincomp.jsx', [
  {
    find: /resData\.products \|\| \(Array\.isArray\(resData\) \? resData : \[\]\)/g,
    replace: 'resData.data || (Array.isArray(resData.data) ? resData.data : [])'
  }
]);

// 2. wishlistSlice.js
applyRegexes('src/Components/redux/features/wishlistSlice.js', [
  {
    find: /const data = await res\.json\(\);\n\s*return data\.wishlist \|\| \[\];/g,
    replace: 'const data = await res.json();\n      return data.data || [];'
  }
]);

// 3. Cart.jsx
applyRegexes('src/Components/cart/Cart.jsx', [
  {
    find: /const wData = await wRes\.json\(\);\n\s*const list = wData\.wishlist \|\| \[\];/g,
    replace: 'const wData = await wRes.json();\n              const list = wData.data || [];'
  }
]);

// 4. Slide.jsx (does not fetch directly)

// 5. ProfilePage.jsx (Add pagination)
let profilePath = 'src/Components/profile/ProfilePage.jsx';
if (fs.existsSync(profilePath)) {
  let profileContent = fs.readFileSync(profilePath, 'utf8');
  
  if (!profileContent.includes('Pagination from')) {
    profileContent = profileContent.replace(
      'import BackButton from "../common/BackButton";',
      'import BackButton from "../common/BackButton";\nimport Pagination from "../common/Pagination";'
    );
  }
  
  profileContent = profileContent.replace(
    'const [myProducts, setMyProducts] = useState([]);',
    'const [myProducts, setMyProducts] = useState([]);\n  const [prodPage, setProdPage] = useState(1);\n  const [prodTotalPages, setProdTotalPages] = useState(1);'
  );
  
  profileContent = profileContent.replace(
    /const productsResponse = await fetch\(apiUrl\("\/profile\/products"\), \{(.)+?\n\s+\}\);\n\s+if \(productsResponse\.ok\) \{\n\s+const productsData = await productsResponse\.json\(\);\n\s+setMyProducts\(Array\.isArray\(productsData\) \? productsData : \[\]\);\n\s+\}/s,
    `const loadMyProducts = async (page = 1) => {
          try {
            const productsResponse = await fetch(apiUrl("/profile/products?page=" + page), { credentials: "include" });
            if (productsResponse.ok) {
              const resData = await productsResponse.json();
              setMyProducts(resData.data || []);
              setProdTotalPages(resData.total_pages || 1);
              setProdPage(resData.page || 1);
            }
          } catch(e){}
        };
        await loadMyProducts(1);
        
        // Expose to window for pagination click, this is a hack wrapper since it's hard to inject loadMyProducts correctly into the component scope via plain replace
        // Wait, better to just inject a handlePageChange function below the useEffect
        `
  );
  
  // Re-write to inject handlePageChange inside component
  profileContent = profileContent.replace(
    /const updateField = \(e\) =>/g,
    `const handlePageChange = async (newPage) => {
      setProdPage(newPage);
      try {
        const productsResponse = await fetch(apiUrl("/profile/products?page=" + newPage), { credentials: "include" });
        if (productsResponse.ok) {
          const resData = await productsResponse.json();
          setMyProducts(resData.data || []);
          setProdTotalPages(resData.total_pages || 1);
        }
      } catch(e){}
    };
    
  const updateField = (e) =>`
  );
  
  profileContent = profileContent.replace(
    /(\n\s*)(\<\/div>\n\s*\<\/div>\n\s*\<\/section>)/g,
    `$1  {prodTotalPages > 1 && (
        <div style={{ padding: "20px" }}>
            <Pagination currentPage={prodPage} totalPages={prodTotalPages} onPageChange={handlePageChange} />
        </div>
      )}$2`
  );
  
  fs.writeFileSync(profilePath, profileContent, 'utf8');
  console.log('Fixed ProfilePage.jsx');
}

// 6. WishlistPage.jsx
let wlPath = 'src/Components/wishlist/WishlistPage.jsx';
if (fs.existsSync(wlPath)) {
  let wlContent = fs.readFileSync(wlPath, 'utf8');
  
  if (!wlContent.includes('Pagination from')) {
    wlContent = wlContent.replace(
      'import BackButton from "../common/BackButton";',
      'import BackButton from "../common/BackButton";\nimport Pagination from "../common/Pagination";'
    );
  }

  wlContent = wlContent.replace(
    'const [wishlist, setWishlist] = useState([]);',
    'const [wishlist, setWishlist] = useState([]);\n  const [wlPage, setWlPage] = useState(1);\n  const [wlTotalPages, setWlTotalPages] = useState(1);'
  );
  
  wlContent = wlContent.replace(
    /const fetchWishlistItems = async \(\) => \{(.+?)const res = await fetch\(apiUrl\("\/wishlist"\), \{(.+?)const data = await res\.json\(\);\n\s+if \(data\.wishlist\)/s,
    `const fetchWishlistItems = async (page = wlPage) => {$1const res = await fetch(apiUrl("/wishlist?page=" + page), {$2const data = await res.json();\n      if (data.data) { setWlTotalPages(data.total_pages); setWlPage(data.page); data.wishlist = data.data; }`
  );
  
  wlContent = wlContent.replace(
    /const handleRemove = async \(productId\) => \{/g,
    `const handlePageChange = (newPage) => fetchWishlistItems(newPage);\n\n  const handleRemove = async (productId) => {`
  );
  
  wlContent = wlContent.replace(
    /(\n\s*)(\<\/div>\n\s*\<\/div>\n\s*\<\/div>)/g,
    `$1  {wlTotalPages > 1 && (
        <div style={{ padding: "20px" }}>
            <Pagination currentPage={wlPage} totalPages={wlTotalPages} onPageChange={handlePageChange} />
        </div>
      )}$2`
  );
  
  fs.writeFileSync(wlPath, wlContent, 'utf8');
  console.log('Fixed WishlistPage.jsx');
}
