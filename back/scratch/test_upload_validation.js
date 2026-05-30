const { validateImageFile } = require("../utils/imageUploadConfig");

const testCases = [
  // Valid Cases
  {
    name: "Valid PNG image",
    file: { originalname: "photo.png", mimetype: "image/png" },
    expectedValid: true
  },
  {
    name: "Valid GIF image",
    file: { originalname: "photo.gif", mimetype: "image/gif" },
    expectedValid: true
  },
  {
    name: "Valid AVIF image",
    file: { originalname: "photo.avif", mimetype: "image/avif" },
    expectedValid: true
  },
  {
    name: "Valid HEIC image",
    file: { originalname: "photo.heic", mimetype: "image/heic" },
    expectedValid: true
  },
  {
    name: "Valid ICO image",
    file: { originalname: "photo.ico", mimetype: "image/x-icon" },
    expectedValid: true
  },

  // Invalid Cases
  {
    name: "Invalid PDF file",
    file: { originalname: "file.pdf", mimetype: "application/pdf" },
    expectedValid: false
  },
  {
    name: "Invalid SVG image (Excluded for security)",
    file: { originalname: "file.svg", mimetype: "image/svg+xml" },
    expectedValid: false
  },
  {
    name: "Invalid EXE file",
    file: { originalname: "file.exe", mimetype: "application/octet-stream" },
    expectedValid: false
  },
  {
    name: "Mismatched Fake PNG with PDF mimetype",
    file: { originalname: "fake.png", mimetype: "application/pdf" },
    expectedValid: false
  },
  {
    name: "Mismatched Fake PDF with PNG mimetype",
    file: { originalname: "fake.pdf", mimetype: "image/png" },
    expectedValid: false
  }
];

console.log("==================================================");
console.log("RUNNING IMAGE UPLOAD VALIDATION TESTS");
console.log("==================================================");

let allPassed = true;

testCases.forEach((tc, idx) => {
  const result = validateImageFile(tc.file);
  const passed = result.valid === tc.expectedValid;
  
  if (passed) {
    console.log(`[PASS] Test #${idx + 1}: ${tc.name}`);
    console.log(`       File: ${tc.file.originalname} (${tc.file.mimetype})`);
    console.log(`       Result: valid = ${result.valid}${result.error ? `, error = "${result.error}"` : ""}\n`);
  } else {
    console.error(`[FAIL] Test #${idx + 1}: ${tc.name}`);
    console.error(`       File: ${tc.file.originalname} (${tc.file.mimetype})`);
    console.error(`       Expected: valid = ${tc.expectedValid}`);
    console.error(`       Actual: valid = ${result.valid}${result.error ? `, error = "${result.error}"` : ""}\n`);
    allPassed = false;
  }
});

console.log("==================================================");
if (allPassed) {
  console.log("ALL TESTS PASSED SUCCESSFULLY! ✅");
} else {
  console.error("SOME TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================");
