import fs from 'fs';

// Read the original database
const originalData = JSON.parse(fs.readFileSync('./public/data/philosophers/enhanced-repertory-database.json', 'utf8'));

// Create an optimized version with essential data only
const optimizedData = {
  metadata: originalData.metadata,
  categories: originalData.categories,
  // Take only the top 500 symptoms for each category to reduce size
  repertory: {}
};

// Process each category
Object.keys(originalData.repertory).forEach(category => {
  optimizedData.repertory[category] = {};
  
  // Get all symptoms in this category
  const symptoms = Object.keys(originalData.repertory[category]);
  
  // Take only the first 50 symptoms (or all if less than 50)
  const limitedSymptoms = symptoms.slice(0, 50);
  
  // Add these symptoms to the optimized data
  limitedSymptoms.forEach(symptom => {
    // For each symptom, take only the top 20 remedies
    const remedies = originalData.repertory[category][symptom].slice(0, 20);
    optimizedData.repertory[category][symptom] = remedies;
  });
});

// Write the optimized database
fs.writeFileSync('./public/data/philosophers/optimized-repertory-database.json', JSON.stringify(optimizedData, null, 2));

console.log('Database optimized successfully!');
console.log(`Original size: ${fs.statSync('./public/data/philosophers/enhanced-repertory-database.json').size / (1024 * 1024)} MB`);
console.log(`Optimized size: ${fs.statSync('./public/data/philosophers/optimized-repertory-database.json').size / (1024 * 1024)} MB`);