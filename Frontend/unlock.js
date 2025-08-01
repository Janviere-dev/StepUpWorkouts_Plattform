document.addEventListener('DOMContentLoaded', () => {
    const goalBoxes = document.querySelectorAll('.goal-box');
    const welcomeNote = document.getElementById('welcomeNote');
    const workoutPlanDiv = document.getElementById('workoutPlan');
    const nutritionAdviceDiv = document.getElementById('nutritionAdvice');

    goalBoxes.forEach(box => {
        box.addEventListener('click', async () => {
            const goal = box.dataset.goal;
            displayWelcomeNote(goal);

            // Show relevant sections, but don't fetch yet
            workoutPlanDiv.classList.remove('hidden');
            nutritionAdviceDiv.classList.remove('hidden');

            // Clear previous results and re-add buttons
            workoutPlanDiv.innerHTML = '<h3>Workout Plan:</h3><button class="generate-workout-button">Generate Workout Plan</button>';
            nutritionAdviceDiv.innerHTML = '<h3>Nutrition Advice:</h3><button class="get-nutrition-button">Get Nutrition Advice</button>';

            // Select buttons after content has been set
            const generateWorkoutButton = workoutPlanDiv.querySelector('.generate-workout-button');
            const getNutritionButton = nutritionAdviceDiv.querySelector('.get-nutrition-button');

            // Add event listeners
            generateWorkoutButton.addEventListener('click', () => fetchWorkoutPlan(goal));
            getNutritionButton.addEventListener('click', () => fetchNutritionAdvice(goal));
        });
    });

    function displayWelcomeNote(goal) {
        welcomeNote.classList.remove('hidden');
        let noteContent = '';
        if (goal === 'gain weight') {
            noteContent = 'Welcome! We\'re excited to help you gain weight, build muscle, break unhealthy habits, and reach your full potential to get your dream body!';
        } else if (goal === 'lose weight') {
            noteContent = 'Welcome! We\'re here to guide you gently towards your weight loss goals, help you break unhealthy habits, and reach your full potential to get your dream body!';
        } else if (goal === 'maintain fitness') {
            noteContent = 'Welcome! We\'ll help you maintain your fitness, break unhealthy habits, and reach your full potential to get your dream body!';
        } else if (goal === 'energy and peace') {
            noteContent = 'Welcome! We\'ll help you find energy and peace through fitness, break unhealthy habits, and reach your full potential to get your dream body!';
        }
        welcomeNote.innerHTML = `<h3>${noteContent}</h3>`;
    }

    async function fetchWorkoutPlan(goal) {
        workoutPlanDiv.innerHTML = '<p>Generating workout plan...</p>';
        try {
            const response = await fetch('http://localhost:8080/api/generateWorkoutPlan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goal: getWorkoutGoal(goal),
                    fitness_level: 'Beginner', // Default
                    preferences: ['Weight training'], // Default, could be user input
                    health_conditions: ['None'], // Default
                    schedule: {
                        days_per_week: 3,
                        session_duration: 45
                    },
                    plan_duration_weeks: 4,
                    lang: 'en'
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayWorkoutPlan(data.result); // Call new function to format and display
        } catch (error) {
            console.error('Error fetching workout plan:', error);
            let displayErrorMessage = error.message || 'An unknown error occurred.';
            if (error.message.includes('JSON.parse')) {
                displayErrorMessage = 'Could not get a valid response from the server. The external API might be rate-limited or unavailable.';
            }
            workoutPlanDiv.innerHTML = `<p>Error generating workout plan: ${displayErrorMessage}</p>`;
        }
    }

    async function fetchNutritionAdvice(goal) {
        nutritionAdviceDiv.innerHTML = '<p>Getting nutrition advice...</p>';
        try {
            const response = await fetch('http://localhost:8080/api/nutritionAdvice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goal: getNutritionGoal(goal),
                    dietary_restrictions: ['None'], // Default
                    current_weight: 70, // Default
                    target_weight: 65, // Default
                    daily_activity_level: 'Moderate', // Default
                    lang: 'en'
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayNutritionAdvice(data.result); // Call new function to format and display
        } catch (error) {
            console.error('Error fetching nutrition advice:', error);
            let displayErrorMessage = error.message || 'An unknown error occurred.';
            if (error.message.includes('JSON.parse')) {
                displayErrorMessage = 'Could not get a valid response from the server. The external API might be rate-limited or unavailable.';
            }
            nutritionAdviceDiv.innerHTML = `<p>Error getting nutrition advice: ${displayErrorMessage}</p>`;
        }
    }

    function getWorkoutGoal(frontendGoal) {
        switch (frontendGoal) {
            case 'gain weight': return 'Build muscle';
            case 'lose weight': return 'Lose weight';
            case 'maintain fitness': return 'Maintain fitness';
            case 'energy and peace': return 'Improve overall well-being';
            default: return 'General fitness';
        }
    }

    function getNutritionGoal(frontendGoal) {
        switch (frontendGoal) {
            case 'gain weight': return 'Gain weight';
            case 'lose weight': return 'Lose weight';
            case 'maintain fitness': return 'Maintain weight';
            case 'energy and peace': return 'Improve overall health';
            default: return 'Healthy eating';
        }
    }

    function displayWorkoutPlan(plan) {
        let html = `<h3>Workout Plan for ${plan.goal} (${plan.total_weeks} Weeks)</h3>`;
        html += `<p><strong>Fitness Level:</strong> ${plan.fitness_level}</p>`;
        html += `<p><strong>Schedule:</strong> ${plan.schedule.days_per_week} days/week, ${plan.schedule.session_duration} minutes/session</p>`;
        
        plan.exercises.forEach(dayPlan => {
            html += `<h4>${dayPlan.day}</h4>`;
            if (dayPlan.exercises && dayPlan.exercises.length > 0) {
                html += `<ul>`;
                dayPlan.exercises.forEach(exercise => {
                    html += `<li><strong>${exercise.name}</strong>: ${exercise.duration} | Reps: ${exercise.repetitions} | Sets: ${exercise.sets} | Equipment: ${exercise.equipment}</li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p>No exercises planned for this day.</p>`;
            }
        });
        workoutPlanDiv.innerHTML = html;
    }

    function displayNutritionAdvice(advice) {
        let html = `<h3>Nutrition Advice for ${advice.goal}</h3>`;
        html += `<p><strong>Daily Calories:</strong> ${advice.calories_per_day}</p>`;
        html += `<p><strong>Macronutrients:</strong> Carbs: ${advice.macronutrients.carbohydrates}, Proteins: ${advice.macronutrients.proteins}, Fats: ${advice.macronutrients.fats}</p>`;
        
        html += `<h4>Meal Suggestions:</h4>`;
        if (advice.meal_suggestions && advice.meal_suggestions.length > 0) {
            advice.meal_suggestions.forEach(meal => {
                html += `<h5>${meal.meal}</h5>`;
                html += `<ul>`;
                meal.suggestions.forEach(suggestion => {
                    html += `<li><strong>${suggestion.name}</strong> (${suggestion.calories} calories): ${suggestion.ingredients.join(', ')}</li>`;
                });
                html += `</ul>`;
            });
        } else {
            html += `<p>No meal suggestions available.</p>`;
        }
        nutritionAdviceDiv.innerHTML = html;
    }
});
