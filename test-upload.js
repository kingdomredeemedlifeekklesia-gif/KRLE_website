// Test script to simulate gallery upload
const formData = new FormData();
formData.append('title', 'Test Image');
formData.append('description', 'Test description');
formData.append('category', 'programs');

// Create a dummy file (this won't work in Node.js, but let's see)
console.log('Test form data prepared');