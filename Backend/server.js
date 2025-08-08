require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000; // Use environment variable or default to 8000

// Enable CORS for all origins (you can restrict this to your frontend's origin in production)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from ../Frontend
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

// Proxy endpoint for the exercise API
app.get('/api/exercises', async (req, res) => {
    const apiKey = process.env.EXERCISE_API_KEY; // Get API key from environment variable
    const baseUrl = 'https://v2.exercisedb.dev/api/v1/exercises';
    const searchTerm = req.query.search || ''; // Get search term from frontend query parameter

    let url = `${baseUrl}`;
    if (searchTerm) {
        url = `${baseUrl}/search?search=${searchTerm}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com' // This host might be required by the API
            }
        });

        if (!response.ok) {
            // Log the status and any error message from the external API
            const errorText = await response.text();
            console.error(`External API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `External API error: ${response.status} - ${errorText}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying exercise API request:', error);
        res.status(500).json({ error: 'Internal server error while fetching exercises.' });
    }
});

// Proxy endpoint for individual exercise details
app.get('/api/exercises/:exerciseId', async (req, res) => {
    const apiKey = process.env.EXERCISE_API_KEY;
    const exerciseId = req.params.exerciseId;
    const url = `https://v2.exercisedb.dev/api/v1/exercises/${exerciseId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`External API detail error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `External API error: ${response.status} - ${errorText}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying exercise detail API request:', error);
        res.status(500).json({ error: 'Internal server error while fetching exercise details.' });
    }
});

// Proxy endpoint for generating workout plans
app.post('/api/generateWorkoutPlan', async (req, res) => {
    const apiKey = process.env.EXERCISE_API_KEY; // Using the same API key as exerciseDB
    const url = 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/generateWorkoutPlan?noqueue=1';
    
    console.log('Received workout plan request:', req.body); // Debug log
    
    const options = {
        method: 'POST',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body) // Use the request body from frontend instead of hardcoded data
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Workout Plan API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `Workout Plan API error: ${response.status} - ${errorText}` });
        }
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error generating workout plan:', error);
        res.status(500).json({ error: 'Internal server error while generating workout plan.' });
    }
});

// Proxy endpoint for nutrition advice
app.post('/api/nutritionAdvice', async (req, res) => {
    const apiKey = process.env.EXERCISE_API_KEY; // Using the same API key
    const url = 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice?noqueue=1';
    
    console.log('Received nutrition advice request:', req.body); // Debug log
    
    const options = {
        method: 'POST',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body) // Forward the request body from frontend
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Nutrition Advice API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `Nutrition Advice API error: ${response.status} - ${errorText}` });
        }
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error getting nutrition advice:', error);
        res.status(500).json({ error: 'Internal server error while getting nutrition advice.' });
    }
});

// ONLY ONE app.listen() - this is the fix!
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});