const fs = require('fs');

let content = fs.readFileSync('routes/router.js', 'utf8');
content = content.replace(/\r\n/g, '\n');

// Helper to log if replacement happened
function doReplace(num, name, regex, replacer) {
  const orig = content;
  content = content.replace(regex, replacer);
  if (content !== orig) {
    console.log(`Success: ${num} - ${name}`);
  } else {
    console.log(`FAILED: ${num} - ${name}`);
  }
}

// 1-9. existing pagination replacements
doReplace(1, "GET /getproducts", /products: resolvedProducts,\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: resolvedProducts,\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(2, "POST /products/filter", /products: resolvedProducts,\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: resolvedProducts,\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(3, "GET /admin/categories", /data: payload,\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: payload,\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(4, "GET /admin/users", /data: users\.map\(toPublicUser\),\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: users.map(toPublicUser),\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(5, "GET /admin/products", /data: productDocs\.map\(toPublicProduct\),\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: productDocs.map(toPublicProduct),\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(6, "GET /admin/reviews", /data: reviews,\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}/,
  `data: reviews,\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)`);

doReplace(7, "GET /admin/reports", /data: enriched,\s*pagination: \{\s*totalItems,\s*totalPages: Math\.ceil\(totalItems \/ limitNum\),\s*currentPage: pageNum,\s*limit: limitNum,?\s*\}\s*\}/,
  `data: enriched,\n      page: pageNum,\n      limit: limitNum,\n      total: totalItems,\n      total_pages: Math.ceil(totalItems / limitNum)\n    }`);

doReplace(8, "GET /reviews/:targetType/:targetId", /reviews,\s*summary: \{\s*totalReviews,\s*averageRating: Math\.round\(averageRating \* 10\) \/ 10,\s*ratingDistribution,?\s*\},\s*pagination: \{\s*page,\s*limit,\s*total,\s*totalPages: Math\.ceil\(total \/ limit\),?\s*\},/,
  `data: reviews,\n      summary: {\n        totalReviews,\n        averageRating: Math.round(averageRating * 10) / 10,\n        ratingDistribution,\n      },\n      page,\n      limit,\n      total,\n      total_pages: Math.ceil(total / limit)`);

doReplace(9, "GET /comments/:productId", /comments: commentsWithReplies,\s*pagination: \{ page, limit, total, hasMore: skip \+ comments\.length < total \},/,
  `data: commentsWithReplies,\n      page,\n      limit,\n      total,\n      total_pages: Math.ceil(total / limit)`);

// 10. GET /products/filter
doReplace(10, "GET /products/filter", /(const query = clauses\.length \? \{ \$and: clauses \} : \{\};\n\s+)(const productsData = await products\.find\(query\)\.lean\(\);\n\s+const productsWithCategory = productsData\.map\(resolveProductCategory\);\n\n\s+res\.status\(200\)\.json\(productsWithCategory\);)/,
  (m, p1) => {
    return p1 + `const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 12;
    const skip = (pageNum - 1) * limitNum;
    
    const [productsData, totalItems] = await Promise.all([
      products.find(query).skip(skip).limit(limitNum).lean(),
      products.countDocuments(query)
    ]);
    const productsWithCategory = productsData.map(resolveProductCategory);

    res.status(200).json({
      data: productsWithCategory,
      page: pageNum,
      limit: limitNum,
      total: totalItems,
      total_pages: Math.ceil(totalItems / limitNum)
    });`;
  }
);

doReplace(11, "GET /getcategories", /(const categoryDocs = await Category\.find\(\{\}, \{ name: 1, _id: 0 \}\)\.sort\(\{\s+name: 1,\s+\}\);\s+const categories = categoryDocs\.map\(\(item\) => item\.name\);\s+res\.status\(200\)\.json\(\[CATEGORY_ALL, \.\.\.categories\]\);)/,
  `const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    
    const [categoryDocs, totalItems] = await Promise.all([
      Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).skip(skip).limit(limitNum),
      Category.countDocuments({})
    ]);
    
    const categories = categoryDocs.map((item) => item.name);

    res.status(200).json({
      data: pageNum === 1 ? [CATEGORY_ALL, ...categories] : categories,
      page: pageNum,
      limit: limitNum,
      total: totalItems + (pageNum === 1 ? 1 : 0),
      total_pages: Math.ceil((totalItems + (pageNum === 1 ? 1 : 0)) / limitNum)
    });`
);

doReplace(12, "GET /profile/products", /(const productDocs = await products\s*\.find\(\{ createdBy: req\.userID \}\)\s*\.sort\(\{ createdAt: -1 \}\);\s*res\.status\(200\)\.json\(productDocs\.map\(toPublicProduct\)\);)/,
  `const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [productDocs, totalItems] = await Promise.all([
      products.find({ createdBy: req.userID }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      products.countDocuments({ createdBy: req.userID })
    ]);
    res.status(200).json({
      data: productDocs.map(toPublicProduct),
      page: pageNum,
      limit: limitNum,
      total: totalItems,
      total_pages: Math.ceil(totalItems / limitNum)
    });`
);

doReplace(13, "GET /products/mine", /(const productDocs = await products\s*\.find\(\{ createdBy: req\.userID \}\)\s*\.sort\(\{ createdAt: -1 \}\);\s*res\.status\(200\)\.json\(productDocs\.map\(toPublicProduct\)\);)/,
  `const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [productDocs, totalItems] = await Promise.all([
      products.find({ createdBy: req.userID }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      products.countDocuments({ createdBy: req.userID })
    ]);
    res.status(200).json({
      data: productDocs.map(toPublicProduct),
      page: pageNum,
      limit: limitNum,
      total: totalItems,
      total_pages: Math.ceil(totalItems / limitNum)
    });`
);

doReplace(14, "GET /products/trending", /(const limit = parseInt\(req\.query\.limit\) \|\| 10;\s*const trending = await products\s*\.find\(\)\s*\.sort\(\{ views: -1, createdAt: -1 \}\)\s*\.limit\(limit\);\s*res\.status\(200\)\.json\(trending\.map\(resolveProductCategory\)\);)/,
  `const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [trending, total] = await Promise.all([
      products.find().sort({ views: -1, createdAt: -1 }).skip(skip).limit(limit),
      products.countDocuments()
    ]);

    res.status(200).json({
      data: trending.map(resolveProductCategory),
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    });`
);

doReplace(15, "GET /products/top-rated", /(const limit = parseInt\(req\.query\.limit\) \|\| 10;\s*const topRated = await products\s*\.find\(\{ totalReviews: \{ \$gt: 0 \} \}\)\s*\.sort\(\{ averageRating: -1, totalReviews: -1 \}\)\s*\.limit\(limit\);\s*res\.status\(200\)\.json\(topRated\.map\(resolveProductCategory\)\);)/,
  `const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [topRated, total] = await Promise.all([
      products.find({ totalReviews: { $gt: 0 } }).sort({ averageRating: -1, totalReviews: -1 }).skip(skip).limit(limit),
      products.countDocuments({ totalReviews: { $gt: 0 } })
    ]);

    res.status(200).json({
      data: topRated.map(resolveProductCategory),
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    });`
);

doReplace(16, "GET /conversations", /(const conversations = await Conversation\.find\(\{\s*participants: req\.userID,\s*\}\)\s*\.populate\("participants", "fname email"\)\s*\.sort\(\{ updatedAt: -1 \}\);\s*res\.status\(200\)\.json\(conversations\);)/,
  `const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: req.userID })
        .populate("participants", "fname email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ participants: req.userID })
    ]);

    res.status(200).json({
      data: conversations,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    });`
);

doReplace(17, "GET /wishlist", /(res\.status\(200\)\.json\(\{ wishlist \}\);)/,
  `const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 20;
    const start = (pageNum - 1) * limitNum;
    const paginatedWishlist = wishlist.slice(start, start + limitNum);

    res.status(200).json({
      data: paginatedWishlist,
      page: pageNum,
      limit: limitNum,
      total: wishlist.length,
      total_pages: Math.ceil(wishlist.length / limitNum)
    });`
);

fs.writeFileSync('routes/router.js', content, 'utf8');
