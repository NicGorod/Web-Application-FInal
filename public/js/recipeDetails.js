
document.addEventListener('DOMContentLoaded', () => {
  const recipeDetailsContainer = document.querySelector('.recipe-details-container');

  // Extract recipe ID from the URL path
  const pathSegments = window.location.pathname.split('/');
  const recipeId = pathSegments[pathSegments.length - 1];

  if (recipeId) {
    fetchRecipeDetails(recipeId);
  } else {
    console.error('Recipe ID not found in URL');
  }

  // Function to fetch recipe details by ID
  function fetchRecipeDetails(recipeId) {
    const API_KEY = '69800e3a7b334cbbb0a48e6be0ec886b';
    const API_URL = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;

    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch recipe details');
        }
        return response.json();
      })
      .then(recipe => {
        displayRecipeDetails(recipe);
      })
      .catch(error => {
        console.error('Error fetching recipe details:', error);
      });
  }

  // Function to display recipe details
  function displayRecipeDetails(recipe) {
    const { title, image, servings, readyInMinutes, sourceUrl, summary, extendedIngredients } = recipe;

    // Create HTML elements to display recipe details
    const recipeTitle = document.createElement('h2');
    recipeTitle.textContent = title;

    const recipeImage = document.createElement('img');
    recipeImage.src = image;
    recipeImage.alt = title;

    const recipeServings = document.createElement('p');
    recipeServings.textContent = `Servings: ${servings}`;

    const recipeReadyInMinutes = document.createElement('p');
    recipeReadyInMinutes.textContent = `Ready in: ${readyInMinutes} minutes`;

    const recipeSourceLink = document.createElement('a');
    recipeSourceLink.href = sourceUrl;
    recipeSourceLink.textContent = 'View Recipe Source';

    const recipeSummary = document.createElement('div');
    recipeSummary.innerHTML = summary;

    const ingredientsList = document.createElement('ul');
    extendedIngredients.forEach(ingredient => {
      const listItem = document.createElement('li');
      listItem.textContent = ingredient.original;
      ingredientsList.appendChild(listItem);
    });

    // Append all elements to the recipe details container
    recipeDetailsContainer.appendChild(recipeTitle);
    recipeDetailsContainer.appendChild(recipeImage);
    recipeDetailsContainer.appendChild(recipeServings);
    recipeDetailsContainer.appendChild(recipeReadyInMinutes);
    recipeDetailsContainer.appendChild(recipeSourceLink);
    recipeDetailsContainer.appendChild(recipeSummary);
    recipeDetailsContainer.appendChild(ingredientsList);
  }
});
