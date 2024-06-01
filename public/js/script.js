function saveRecipe(recipeId) {
  // Ensure recipeId is valid before sending the request
  if (!recipeId) {
    console.error('Invalid recipeId:', recipeId);
    return; // Exit function if recipeId is invalid
  }

  const requestData = { recipeId: recipeId }; // Check the data being sent

  fetch('/save-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Change content type
    },
    body: `recipeId=${recipeId}` // Send recipeId as a form parameter
  })
  .then(response => {
    if (response.ok) {
    } else {
      console.error('Failed to save recipe');
    }
  })
  .catch(error => console.error('Error saving recipe:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const recipeSearch = document.getElementById('recipe-search');
  const recipeResults = document.getElementById('recipe-results');

  // Ensure searchButton exists before adding event listener
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      searchRecipes();
    });

    recipeSearch.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        searchRecipes();
      }
    });
  }

  function searchRecipes() {
    const query = recipeSearch.value.trim();
    if (query === '') return;

    const API_KEY = '69800e3a7b334cbbb0a48e6be0ec886b';
    const API_URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}`;

    fetch(API_URL)
      .then(response => response.json())
      .then(data => displayRecipes(data.results))
      .catch(error => console.error('Error fetching recipes:', error));
  }

  function displayRecipes(recipes) {
    recipeResults.innerHTML = '';
    recipes.forEach(recipe => {
      const recipeCard = document.createElement('div');
      recipeCard.classList.add('recipe-card');
      recipeCard.innerHTML = `
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}">
        <button onclick="saveRecipe('${recipe.id}')">Save Recipe</button>
        <a href="/recipeDetails/${recipe.id}">View Details</a>
      `;
      recipeResults.appendChild(recipeCard);
    });
  }



});
