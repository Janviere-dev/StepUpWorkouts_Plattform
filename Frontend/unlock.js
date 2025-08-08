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
            generateWorkoutButton.addEventListener('click', () => showWorkoutInputForm(goal));
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

    function showWorkoutInputForm(goal) {
        const formHTML = `
            <h3>Customize Your Workout Plan</h3>
            <div class="workout-form">
                <div class="form-group">
                    <label for="sessions-per-week">How many sessions do you want per week?</label>
                    <select id="sessions-per-week">
                        <option value="2">2 sessions</option>
                        <option value="3" selected>3 sessions</option>
                        <option value="4">4 sessions</option>
                        <option value="5">5 sessions</option>
                        <option value="6">6 sessions</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="fitness-level">What's your current fitness level?</label>
                    <select id="fitness-level">
                        <option value="Beginner" selected>Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="workout-type">What type of workout do you prefer?</label>
                    <select id="workout-type">
                        <option value="Strength" selected>Strength Training</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Mobility">Mobility</option>
                        <option value="Core">Core</option>
                    </select>
                </div>
                
                <button id="generate-plan-btn" class="generate-plan-button">Generate My Workout Plan</button>
            </div>
        `;
        
        workoutPlanDiv.innerHTML = formHTML;
        
        // Add event listener to the generate plan button
        document.getElementById('generate-plan-btn').addEventListener('click', () => {
            const sessionsPerWeek = parseInt(document.getElementById('sessions-per-week').value);
            const fitnessLevel = document.getElementById('fitness-level').value;
            const workoutType = document.getElementById('workout-type').value;
            
            fetchWorkoutPlan(goal, sessionsPerWeek, fitnessLevel, workoutType);
        });
    }

    async function fetchWorkoutPlan(goal, sessionsPerWeek, fitnessLevel, workoutType) {
        workoutPlanDiv.innerHTML = '<p>Generating your personalized workout plan...</p>';
        try {
            const workoutGoal = getWorkoutGoal(goal);
            const preferences = getWorkoutPreferences(workoutType);
            
            const response = await fetch('http://localhost:8000/api/generateWorkoutPlan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goal: workoutGoal,
                    fitness_level: fitnessLevel,
                    preferences: preferences,
                    health_conditions: ['None'],
                    schedule: {
                        days_per_week: sessionsPerWeek,
                        session_duration: getSessionDuration(fitnessLevel)
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
            displayWorkoutPlan(data.result);
        } catch (error) {
            console.error('Error fetching workout plan:', error);
            let displayErrorMessage = error.message || 'An unknown error occurred.';
            if (error.message.includes('JSON.parse')) {
                displayErrorMessage = 'Could not get a valid response from the server. The external API might be rate-limited or unavailable.';
            }
            workoutPlanDiv.innerHTML = `<p>Error generating workout plan: ${displayErrorMessage}</p>
                <button onclick="location.reload()">Try Again</button>`;
        }
    }

    async function fetchNutritionAdvice(goal) {
        nutritionAdviceDiv.innerHTML = '<p>Getting personalized nutrition advice...</p>';
        try {
            const nutritionGoal = getNutritionGoal(goal);
            const nutritionData = getNutritionDefaults(goal);
            
            const response = await fetch('http://localhost:8000/api/nutritionAdvice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goal: nutritionGoal,
                    dietary_restrictions: ['None'],
                    current_weight: nutritionData.currentWeight,
                    target_weight: nutritionData.targetWeight,
                    daily_activity_level: 'Moderate',
                    lang: 'en'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            displayNutritionAdvice(data.result);
        } catch (error) {
            console.error('Error fetching nutrition advice:', error);
            let displayErrorMessage = error.message || 'An unknown error occurred.';
            if (error.message.includes('JSON.parse')) {
                displayErrorMessage = 'Could not get a valid response from the server. The external API might be rate-limited or unavailable.';
            }
            nutritionAdviceDiv.innerHTML = `<p>Error getting nutrition advice: ${displayErrorMessage}</p>
                <button onclick="location.reload()">Try Again</button>`;
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

    function getWorkoutPreferences(workoutType) {
        switch (workoutType) {
            case 'Strength': return ['Weight training', 'Strength'];
            case 'Cardio': return ['Cardio', 'Running'];
            case 'Mobility': return ['Flexibility', 'Yoga'];
            case 'Core': return ['Core training', 'Functional'];
            default: return ['Weight training'];
        }
    }

    function getSessionDuration(fitnessLevel) {
        switch (fitnessLevel) {
            case 'Beginner': return 30;
            case 'Intermediate': return 45;
            case 'Advanced': return 60;
            default: return 45;
        }
    }

    function getNutritionDefaults(goal) {
        switch (goal) {
            case 'gain weight':
                return { currentWeight: 65, targetWeight: 75 };
            case 'lose weight':
                return { currentWeight: 80, targetWeight: 70 };
            case 'maintain fitness':
                return { currentWeight: 70, targetWeight: 70 };
            case 'energy and peace':
                return { currentWeight: 70, targetWeight: 70 };
            default:
                return { currentWeight: 70, targetWeight: 70 };
        }
    }

    function displayWorkoutPlan(plan) {
        if (
            !plan ||
            typeof plan.goal === 'undefined' ||
            typeof plan.total_weeks === 'undefined' ||
            !plan.fitness_level ||
            !plan.schedule ||
            typeof plan.schedule.days_per_week === 'undefined' ||
            typeof plan.schedule.session_duration === 'undefined' ||
            !Array.isArray(plan.exercises)
        ) {
            console.error("Invalid or incomplete workout plan:", plan);
            workoutPlanDiv.innerHTML = `<p>Sorry, the workout plan couldn't be loaded properly.</p>`;
            return;
        }

        let html = `<h3>Your Personalized Workout Plan</h3>`;
        html += `<div class="plan-summary">`;
        html += `<p><strong>Goal:</strong> ${plan.goal}</p>`;
        html += `<p><strong>Duration:</strong> ${plan.total_weeks} Weeks</p>`;
        html += `<p><strong>Fitness Level:</strong> ${plan.fitness_level}</p>`;
        html += `<p><strong>Schedule:</strong> ${plan.schedule.days_per_week} days/week, ${plan.schedule.session_duration} minutes/session</p>`;
        html += `</div>`;

        plan.exercises.forEach(dayPlan => {
            html += `<div class="day-plan">`;
            html += `<h4>${dayPlan.day}</h4>`;
            if (dayPlan.exercises && dayPlan.exercises.length > 0) {
                html += `<ul class="exercise-list">`;
                dayPlan.exercises.forEach(exercise => {
                    html += `<li class="exercise-item">`;
                    html += `<strong>${exercise.name}</strong><br>`;
                    html += `Duration: ${exercise.duration} | `;
                    html += `Reps: ${exercise.repetitions} | `;
                    html += `Sets: ${exercise.sets} | `;
                    html += `Equipment: ${exercise.equipment}`;
                    html += `</li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p>Rest day or no exercises planned.</p>`;
            }
            html += `</div>`;
        });

        workoutPlanDiv.innerHTML = html;
    }

    function displayNutritionAdvice(advice) {
        let html = `<h3>Your Personalized Nutrition Plan</h3>`;
        html += `<div class="nutrition-summary">`;
        html += `<p><strong>Goal:</strong> ${advice.goal}</p>`;
        html += `<p><strong>Daily Calories:</strong> ${advice.calories_per_day}</p>`;
        html += `<p><strong>Macronutrients:</strong></p>`;
        html += `<ul class="macro-list">`;
        html += `<li>Carbohydrates: ${advice.macronutrients.carbohydrates}</li>`;
        html += `<li>Proteins: ${advice.macronutrients.proteins}</li>`;
        html += `<li>Fats: ${advice.macronutrients.fats}</li>`;
        html += `</ul>`;
        html += `</div>`;
        
        html += `<h4>Meal Suggestions:</h4>`;
        if (advice.meal_suggestions && advice.meal_suggestions.length > 0) {
            advice.meal_suggestions.forEach(meal => {
                html += `<div class="meal-section">`;
                html += `<h5>${meal.meal}</h5>`;
                html += `<ul class="meal-list">`;
                meal.suggestions.forEach(suggestion => {
                    html += `<li class="meal-item">`;
                    html += `<strong>${suggestion.name}</strong> (${suggestion.calories} calories)<br>`;
                    html += `Ingredients: ${suggestion.ingredients.join(', ')}`;
                    html += `</li>`;
                });
                html += `</ul>`;
                html += `</div>`;
            });
        } else {
            html += `<p>No meal suggestions available.</p>`;
        }
        nutritionAdviceDiv.innerHTML = html;
    }
});