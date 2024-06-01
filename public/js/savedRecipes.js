document.addEventListener('DOMContentLoaded', () => {
  const savedRecipesList = document.getElementById('saved-recipes-list');

  // Fetch saved recipe IDs from the server
  fetch('/saved-recipes')
    .then(response => response.json())
    .then(savedRecipeIds => {
      // For each saved recipe ID, fetch the recipe details and display them
      savedRecipeIds.forEach(recipeId => {
        fetchRecipeDetails(recipeId);
      });
    })
    .catch(error => console.error('Error fetching saved recipes:', error));

  // Function to fetch recipe details by ID
  function fetchRecipeDetails(recipeId) {
    // Replace the URL with the endpoint to fetch recipe details by ID
    const API_URL = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=69800e3a7b334cbbb0a48e6be0ec886b`;

    fetch(API_URL)
      .then(response => response.json())
      .then(recipe => {
        // Create HTML elements to display the recipe details
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
          <h2><a href="/recipeDetails/${recipe.id}">${recipe.title}</a></h2>
          <img src="${recipe.image}" alt="${recipe.title}">
        `;
        savedRecipesList.appendChild(recipeCard);
      })
      .catch(error => console.error(`Error fetching recipe details for ID ${recipeId}:`, error));
  }
});
