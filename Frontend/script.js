const CORS_PROXY = ''; 
const SEARCH_URL = "http://localhost:8000/api/exercises"; // my backend endpoint for searching exercises
const DETAIL_URL = "http://localhost:8000/api/exercises/"; // my backend endpoint for detailed exercise info

const exerciseSearchInput = document.getElementById('exerciseSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const browseExercisesBtn = document.getElementById('browseExercisesBtn');
const searchResultsContainer = document.getElementById('searchResults');

browseExercisesBtn.addEventListener('click', searchExercises);
clearSearchBtn.addEventListener('click', clearSearch);

async function searchExercises() {
    const searchTerm = exerciseSearchInput.value.trim();
    if (!searchTerm) {
        searchResultsContainer.innerHTML = '<p>Please enter an exercise to search.</p>';
        return;
    }

    searchResultsContainer.innerHTML = '<p>Searching...</p>';

    try {
        const searchResponse = await fetch(`${SEARCH_URL}?search=${searchTerm}`);
        if (!searchResponse.ok) {
            throw new Error(`HTTP error! status: ${searchResponse.status}`);
        }
        const searchData = await searchResponse.json();

        if (searchData.error) {
            let friendlyErrorMessage = searchData.error;
            if (searchData.error.includes('429 - Too Many Requests')) {
                friendlyErrorMessage = 'We are getting too many requests for exercises right now. Please try again in a moment. You might be hitting an API rate limit.';
            } else if (searchData.error.includes('401 - Unauthorized')) {
                friendlyErrorMessage = 'Authentication failed. Please check your API key configuration.';
            } else if (searchData.error.includes('403 - Forbidden')) {
                friendlyErrorMessage = 'Access to the exercise data is forbidden. This might be a permission issue.';
            }
            searchResultsContainer.innerHTML = `<p>Error: ${friendlyErrorMessage}</p>`;
            return;
        }

        if (!searchData.data || searchData.data.length === 0) {
            searchResultsContainer.innerHTML = '<p>No exercises found for your search.</p>';
            return;
        }

        searchResultsContainer.innerHTML = '';

        const exercisePromises = searchData.data.map(async (exercise) => {
            //  DETAIL_URL is used to fetch detailed information about each exercise
            const detailResponse = await fetch(`${DETAIL_URL}${exercise.exerciseId}`);
            if (!detailResponse.ok) {
                throw new Error(`HTTP error! status: ${detailResponse.status}`);
            }
            const detailData = await detailResponse.json();
            return detailData.data;
        });

        const searchResults = await Promise.all(exercisePromises);

        searchResults.forEach(displayExerciseResult);

    } catch (error) {
        console.error('Error fetching exercises:', error);
        let errorMessage = 'An unexpected error occurred while fetching exercises. Please try again later.';
        if (error.response && error.response.json) {
            const errorJson = await error.response.json();
            let backendError = errorJson.error || '';
            if (backendError.includes('429 - Too Many Requests')) {
                errorMessage = 'We are getting too many requests for exercises right now. Please try again in a moment. You might be hitting an API rate limit.';
            } else if (backendError.includes('401 - Unauthorized')) {
                errorMessage = 'Authentication failed. Please check your API key configuration.';
            } else if (backendError.includes('403 - Forbidden')) {
                errorMessage = 'Access to the exercise data is forbidden. This might be a permission issue.';
            } else {
                errorMessage = backendError || errorMessage;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        searchResultsContainer.innerHTML = `<p>${errorMessage}</p>`;
    }
}

function displayExerciseResult(result) {
    const exerciseName = result.name;
    const exerciseEquipments = result.equipments.join(', ');
    const exerciseBodyParts = result.bodyParts.join(', ');
    const exerciseOverview = result.overview || 'No overview available.';
    const exerciseInstructions = result.instructions ? result.instructions.map(inst => `<li>${inst}</li>`).join('') : 'No instructions available.';

    const resultBox = document.createElement('div');
    resultBox.classList.add('exercise-result-box');
    resultBox.innerHTML = `
        <h4>${exerciseName}</h4>
        ${result.imageUrl ? `<img src="${result.imageUrl}" alt="${exerciseName}" style="max-width: 100%; height: auto;">` : ''}
        <p><strong>Equipments:</strong> ${exerciseEquipments}</p>
        <p><strong>Body Parts:</strong> ${exerciseBodyParts}</p>
        <p><strong>Overview:</strong> ${exerciseOverview}</p>
        <p><strong>Instructions:</strong></p>
        <ul>${exerciseInstructions}</ul>
    `;
    searchResultsContainer.appendChild(resultBox);
}

function clearSearch() {
    exerciseSearchInput.value = '';
    searchResultsContainer.innerHTML = '';
}