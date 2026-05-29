const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, '..', 'src', 'features', 'meals', 'services', 'mealAnalysisService.js');

function extractPrompt(fileContent) {
  const m = fileContent.match(/text:\s*`([\s\S]*?)`/);
  return m ? m[1].trim() : null;
}

function testParsing(raw) {
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

try {
  const file = fs.readFileSync(servicePath, 'utf8');
  const prompt = extractPrompt(file);
  if (!prompt) {
    console.error('Failed to extract prompt from', servicePath);
    process.exitCode = 2;
  } else {
    console.log('--- Prompt excerpt ---');
    console.log(prompt.split('\n').slice(0, 6).join('\n'));
    console.log('--- End excerpt ---\n');

    // Simulate a Claude response with markdown fences
    const sampleRaw = "```json\n{\n  \"foodName\": \"Jollof rice\",\n  \"servingSize\": \"1 plate\",\n  \"calories\": 520,\n  \"protein\": 10,\n  \"carbs\": 80,\n  \"fats\": 15,\n  \"fiber\": 4,\n  \"sugar\": 5,\n  \"glycemicIndex\": \"Medium\",\n  \"diabetesSafe\": false,\n  \"insulinImpact\": \"Moderate\",\n  \"healthScore\": 62,\n  \"tip\": \"Pair with beans to add protein\"\n}\n```";

    try {
      const parsed = testParsing(sampleRaw);
      console.log('Parsing success — sample object:');
      console.log(parsed);
    } catch (err) {
      console.error('Parsing failed:', err.message);
      process.exitCode = 3;
    }

    // Also test direct JSON without fences
    try {
      const parsed2 = testParsing('{"ok":true}');
      console.log('Direct JSON parsing success:', parsed2);
    } catch (err) {
      console.error('Direct JSON parsing failed:', err.message);
      process.exitCode = 4;
    }
  }
} catch (err) {
  console.error('Error reading file:', err.message);
  process.exitCode = 1;
}
