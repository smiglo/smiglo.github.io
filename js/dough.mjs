const IN_CLI = typeof process !== 'undefined' && process.versions?.node;

let sourdough = {
  enabled: false,
  initial: 0,
  flour: [],
  water: [],
};

let preferment = {
  enabled: false,
  flour: 0,
  water: 0,
};

let dough = {
  flour: 0,
  totalFlour: 0,
  salt: 0,
  otherIngredients: [],
  hydrationPercent: 65,
};

if (!IN_CLI) {
  let recipeName = '';
  document.addEventListener('DOMContentLoaded', () => {
    const sourdoughCheckbox = document.getElementById('sourdoughCheckbox');
    const sourdoughSection = document.getElementById('sourdough-section');
    const sourdoughAdditionsBody = document.getElementById('sourdough-additions');
    const initialAmountInput = document.getElementById('initialAmountInput');
    const prefermentCheckbox = document.getElementById('prefermentCheckbox');
    const prefermentSection = document.getElementById('preferment-section');
    const prefermentFlourInput = document.getElementById('prefermentFlourInput');
    const prefermentWaterInput = document.getElementById('prefermentWaterInput');
    const prefermentHeader = document.getElementById('preferment-header');
    const doughFlourInput = document.getElementById('doughFlourInput');
    const totalFlourInput = document.getElementById('totalFlourInput');
    const sourdoughTotalWeight = document.getElementById('sourdoughTotalWeight');
    const doughFlourPercentage = document.getElementById('doughFlourPercentage');
    const totalFlourPercentage = document.getElementById('totalFlourPercentage');
    const sourdoughPercentage = document.getElementById('sourdoughPercentage');
    const saltInput = document.getElementById('saltInput');
    const saltPercentage = document.getElementById('saltPercentage');
    const prefermentTotalWeight = document.getElementById('prefermentTotalWeight');
    const prefermentPercentage = document.getElementById('prefermentPercentage');
    const hydrationWeightInput = document.getElementById('hydrationWeightInput');
    const hydrationPercentageInput = document.getElementById('hydrationPercentageInput');
    const totalDoughWeight = document.getElementById('totalDoughWeight');
    const recipeNameInput = document.getElementById('recipeNameInput');
    const recipeJsonOutput = document.getElementById('recipeJsonOutput');
    const recipeDataCheckbox = document.getElementById('recipeDataCheckbox');
    const recipeDataSection = document.getElementById('recipe-data-section');
    const loadRecipeButton = document.getElementById('loadRecipeButton');
    const otherIngredientsContainer = document.getElementById('other-ingredients-container');
    const addOtherIngredientWrapper = document.getElementById('add-other-ingredient-wrapper');
    const saveRecipeButton = document.getElementById('saveRecipeButton');
    const savedRecipesList = document.getElementById('saved-recipes-list');
    const STORAGE_KEY = 'dough-recipes';

    const recalculateAllTotals = () => {
      let totalFlour = 0;

      totalFlour += dough.flour;

      dough.otherIngredients.forEach(ing => {
        if (ing.name.toLowerCase() === 'gluten') {
          totalFlour += ing.weight;
        }
      });

      if (sourdough.enabled) {
        const feedingsFlour = sourdough.flour.reduce((sum, current) => sum + current, 0);
        const sourdoughInitialFlour = sourdough.initial / 2;
        totalFlour += feedingsFlour + sourdoughInitialFlour;
      }

      if (preferment.enabled) {
        totalFlour += preferment.flour;
      }
      dough.totalFlour = totalFlour;
      totalFlourInput.value = Math.round(totalFlour);
      totalFlourPercentage.value = totalFlour > 0 ? '100%' : '0%';

      const doughFlourPerc = totalFlour > 0 ? (dough.flour / totalFlour) * 100 : 0;
      doughFlourPercentage.value = `${Math.round(doughFlourPerc)}%`;

      dough.salt = totalFlour * 0.02;
      saltInput.value = Math.round(dough.salt);
      saltPercentage.value = totalFlour > 0 ? '2%' : '0%';

      document.querySelectorAll('.other-ingredient-percentage-input').forEach((input, index) => {
        const weight = dough.otherIngredients[index]?.weight || 0;
        const perc = totalFlour > 0 ? (weight / totalFlour) * 100 : 0;
        input.value = `${Math.round(perc)}%`;
      });
      if (sourdough.enabled) {
        const feedingsFlour = sourdough.flour.reduce((sum, current) => sum + current, 0);
        const feedingsWater = sourdough.water.reduce((sum, current) => sum + current, 0);
        const sdTotal = sourdough.initial + feedingsFlour + feedingsWater;
        sourdoughTotalWeight.value = Math.round(sdTotal);
        const sdPerc = totalFlour > 0 ? (sdTotal / totalFlour) * 100 : 0;
        sourdoughPercentage.value = `${Math.round(sdPerc)}%`;
      }

      if (preferment.enabled) {
        const pfTotal = preferment.flour + preferment.water;
        prefermentTotalWeight.value = Math.round(pfTotal);
        const pfPerc = totalFlour > 0 ? (pfTotal / totalFlour) * 100 : 0;
        prefermentPercentage.value = `${Math.round(pfPerc)}%`;
      }

      let existingWater = 0;
      if (sourdough.enabled) {
        const feedingsWater = sourdough.water.reduce((sum, current) => sum + current, 0);
        const initialWater = sourdough.initial / 2;
        existingWater += feedingsWater + initialWater;
      }
      if (preferment.enabled) {
        existingWater += preferment.water;
      }
      dough.otherIngredients.forEach(ing => {
        if (ing.name.toLowerCase() === 'molasses') {
          existingWater += ing.weight * 0.2;
        }
      });

      if (totalFlour > 0) {
        const totalWaterNeeded = totalFlour * (dough.hydrationPercent / 100);
        const additionalWater = totalWaterNeeded - existingWater;
        hydrationWeightInput.value = Math.round(Math.max(0, additionalWater));
      } else {
        hydrationWeightInput.value = "0";
      }

      const totalWater = totalFlour * (dough.hydrationPercent / 100);
      const otherIngredientsWeight = dough.otherIngredients.reduce((sum, ing) => {
        const name = ing.name.toLowerCase();
        if (name === 'gluten') {
          return sum;
        }
        if (name === 'molasses') {
          return sum + (ing.weight * 0.8);
        }
        return sum + ing.weight;
      }, 0);

      const finalWeight = totalFlour + totalWater + dough.salt + otherIngredientsWeight;
      totalDoughWeight.value = Math.round(finalWeight);

      const doughForJson = { ...dough };
      delete doughForJson.totalFlour;
      delete doughForJson.salt;

      const recipeData = {
        name: recipeName,
        sourdough: sourdough,
        preferment: preferment,
        dough: doughForJson,
      };
      recipeJsonOutput.value = JSON.stringify(recipeData, null, 2);

    };

    const getSavedRecipes = () => {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    };

    const saveRecipes = (recipes) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    };

    const renderRecipeList = () => {
      const recipes = getSavedRecipes();
      savedRecipesList.innerHTML = '';
      recipes.forEach(recipe => {
        const li = document.createElement('li');
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('recipe-info');
        infoDiv.innerHTML = `
          <span class="recipe-name">${recipe.name}</span>
          <span class="recipe-date">${new Date(recipe.timestamp).toLocaleString()}</span>
        `;
        infoDiv.addEventListener('click', () => loadRecipe(recipe.name));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => removeRecipe(recipe.name));

        li.appendChild(infoDiv);
        li.appendChild(removeBtn);
        savedRecipesList.appendChild(li);
      });
    };

    const saveRecipe = () => {
      if (!recipeName.trim()) {
        alert('Please enter a name for the recipe before saving.');
        return;
      }
      const recipes = getSavedRecipes();
      const existingIndex = recipes.findIndex(r => r.name === recipeName);

      const recipeData = JSON.parse(recipeJsonOutput.value);
      recipeData.timestamp = new Date().toISOString();

      if (existingIndex > -1) {
        recipes[existingIndex] = recipeData;
      } else {
        recipes.push(recipeData);
      }
      saveRecipes(recipes);
      renderRecipeList();
    };

    const loadRecipe = (name) => {
      const recipes = getSavedRecipes();
      const recipeToLoad = recipes.find(r => r.name === name);
      if (recipeToLoad) {
        recipeJsonOutput.value = JSON.stringify(recipeToLoad, null, 2);
        loadRecipeFromJson();
      }
    };

    const removeRecipe = (name) => {
      let recipes = getSavedRecipes();
      recipes = recipes.filter(r => r.name !== name);
      saveRecipes(recipes);
      renderRecipeList();
    };

    const addSourdoughRowFromData = (flourValue, waterValue) => {
      const newRow = document.createElement('div');
      newRow.classList.add('input-container');
      const innerDiv = document.createElement('div');
      const rowIndex = sourdough.flour.length -1;

      const addButton = document.createElement('button');
      addButton.textContent = '+';
      addButton.classList.add('add-row-btn');
      addButton.disabled = true;

      const flourInput = document.createElement('input');
      flourInput.type = 'number';
      flourInput.value = flourValue;
      flourInput.classList.add('half-value-input-1');

      const waterInput = document.createElement('input');
      waterInput.type = 'number';
      waterInput.value = waterValue;
      waterInput.classList.add('half-value-input-2');

      flourInput.addEventListener('input', () => {
        sourdough.flour[rowIndex] = Number(flourInput.value) || 0;
        recalculateAllTotals();
      });
      waterInput.addEventListener('input', () => {
        sourdough.water[rowIndex] = Number(waterInput.value) || 0;
        recalculateAllTotals();
      });

      innerDiv.append(addButton, flourInput, waterInput);
      newRow.appendChild(innerDiv);
      sourdoughAdditionsBody.appendChild(newRow);
    };

    const loadRecipeFromJson = () => {
      try {
        const data = JSON.parse(recipeJsonOutput.value);

        recipeName = data.name || '';
        Object.assign(sourdough, data.sourdough);
        Object.assign(preferment, data.preferment);
        Object.assign(dough, data.dough);

        recipeNameInput.value = recipeName;
        sourdoughCheckbox.checked = sourdough.enabled;
        initialAmountInput.value = sourdough.initial;
        prefermentCheckbox.checked = preferment.enabled;
        prefermentFlourInput.value = preferment.flour;
        prefermentWaterInput.value = preferment.water;
        doughFlourInput.value = dough.flour;
        hydrationPercentageInput.value = dough.hydrationPercent;

        rebuildSourdoughUI();
        prefermentSection.style.display = preferment.enabled ? 'block' : 'none';
        updatePrefermentHeaderVisibility();
        rebuildOtherIngredientsUI();

        recalculateAllTotals();
      } catch (e) {
        console.error("Failed to parse or load recipe JSON:", e);
        alert("Could not load recipe. Please check if the JSON data is valid.");
      }
    };

    const updateSourdoughTotals = () => {
      sourdough.initial = Number(initialAmountInput.value) || 0;
      recalculateAllTotals();
    };

    const updatePrefermentTotals = () => {
      preferment.flour = Number(prefermentFlourInput.value) || 0;
      preferment.water = Number(prefermentWaterInput.value) || 0;
      recalculateAllTotals();
    };

    const updateDoughTotals = () => {
      dough.flour = Number(doughFlourInput.value) || 0;
      dough.hydrationPercent = Number(hydrationPercentageInput.value) || 0;
      recalculateAllTotals();
    };

    const addOtherIngredientRow = (ingredient = { name: '', weight: 0 }, isInitial = false) => {
      const rowIndex = dough.otherIngredients.length;
      if (isInitial) {
        dough.otherIngredients.push(ingredient);
      }

      const newRow = document.createElement('div');
      newRow.classList.add('input-container');
      const innerDiv = document.createElement('div');

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Ingredient Name';
      nameInput.value = ingredient.name;
      nameInput.classList.add('other-ingredient-name-input');

      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.value = ingredient.weight;
      weightInput.classList.add('value-input');

      const percentageInput = document.createElement('input');
      percentageInput.type = 'text';
      percentageInput.readOnly = true;
      percentageInput.tabIndex = -1;
      percentageInput.classList.add('percentage-input', 'other-ingredient-percentage-input');

      nameInput.addEventListener('input', () => {
        dough.otherIngredients[rowIndex].name = nameInput.value;
        recalculateAllTotals();
      });
      weightInput.addEventListener('input', () => {
        dough.otherIngredients[rowIndex].weight = Number(weightInput.value) || 0;
        recalculateAllTotals();
      });

      innerDiv.append(nameInput, weightInput, percentageInput);
      newRow.appendChild(innerDiv);
      otherIngredientsContainer.appendChild(newRow);
    };

    const createAddOtherButton = () => {
      addOtherIngredientWrapper.innerHTML = '';
      const addButton = document.createElement('button');
      addButton.textContent = '+';
      addButton.classList.add('add-row-btn');
      addButton.addEventListener('click', () => {
        addOtherIngredientRow({ name: '', weight: 0 }, true);
        createAddOtherButton();
      }, { once: true });
      addOtherIngredientWrapper.appendChild(addButton);
    };

    const rebuildOtherIngredientsUI = () => {
      otherIngredientsContainer.innerHTML = '';
      addOtherIngredientWrapper.innerHTML = '';
      dough.otherIngredients.forEach(ingredient => {
        addOtherIngredientRow(ingredient, false);
      });
      createAddOtherButton();
    };

    const updatePrefermentHeaderVisibility = () => {
      const showHeader = prefermentCheckbox.checked && !sourdoughCheckbox.checked;
      prefermentHeader.style.display = showHeader ? 'table-header-group' : 'none';
    };

    const rebuildSourdoughUI = () => {
      sourdoughAdditionsBody.innerHTML = '';
      sourdoughSection.style.display = sourdough.enabled ? 'block' : 'none';
      if (sourdough.enabled) {
        sourdough.flour.forEach((flourValue, index) => {
          addSourdoughRowFromData(flourValue, sourdough.water[index]);
        });
        addNewAdditionRow();
      }
    };

    const addNewAdditionRow = () => {
      const newRow = document.createElement('div');
      newRow.classList.add('input-container');
      const innerDiv = document.createElement('div');
      const rowIndex = sourdough.flour.length;

      const addButton = document.createElement('button');
      addButton.textContent = '+';
      addButton.classList.add('add-row-btn');

      const flourInput = document.createElement('input');
      flourInput.type = 'number';
      flourInput.disabled = true;
      flourInput.classList.add('half-value-input-1');

      const waterInput = document.createElement('input');
      waterInput.type = 'number';
      waterInput.disabled = true;
      waterInput.classList.add('half-value-input-2');

      let waterManuallySet = false;
      let flourManuallySet = false;

      waterInput.addEventListener('input', () => { waterManuallySet = true; });
      flourInput.addEventListener('input', () => { flourManuallySet = true; });

      const handleFlourInput = () => {
        sourdough.flour[rowIndex] = Number(flourInput.value) || 0;
        if (!waterManuallySet) {
          waterInput.value = flourInput.value;
          sourdough.water[rowIndex] = sourdough.flour[rowIndex];
        }
        updateSourdoughTotals();
      };

      const handleWaterInput = () => {
        sourdough.water[rowIndex] = Number(waterInput.value) || 0;
        if (!flourManuallySet) {
          flourInput.value = waterInput.value;
          sourdough.flour[rowIndex] = sourdough.water[rowIndex];
        }
        updateSourdoughTotals();
      };

      flourInput.addEventListener('input', handleFlourInput);
      waterInput.addEventListener('input', handleWaterInput);

      innerDiv.append(addButton, flourInput, waterInput);
      newRow.appendChild(innerDiv);

      sourdoughAdditionsBody.appendChild(newRow);

      addButton.addEventListener('click', (e) => {
        e.preventDefault();
        flourInput.disabled = false;
        waterInput.disabled = false;
        addButton.disabled = true;
        sourdough.flour.push(0);
        sourdough.water.push(0);
        addNewAdditionRow();
      }, { once: true });
    };

    initialAmountInput.addEventListener('input', updateSourdoughTotals);

    sourdoughCheckbox.addEventListener('change', () => {
      sourdough.enabled = sourdoughCheckbox.checked;
      sourdoughSection.style.display = sourdoughCheckbox.checked ? 'block' : 'none';
      updatePrefermentHeaderVisibility();
      recalculateAllTotals();
      if (sourdough.enabled && sourdoughAdditionsBody.children.length === 0) {
        addNewAdditionRow();
      }
    });

    prefermentCheckbox.addEventListener('change', () => {
      preferment.enabled = prefermentCheckbox.checked;
      prefermentSection.style.display = prefermentCheckbox.checked ? 'block' : 'none';
      updatePrefermentHeaderVisibility();
      recalculateAllTotals();
    });

    let prefermentWaterManuallySet = false;
    let prefermentFlourManuallySet = false;
    prefermentWaterInput.addEventListener('input', () => { prefermentWaterManuallySet = true; });
    prefermentFlourInput.addEventListener('input', () => { prefermentFlourManuallySet = true; });

    prefermentFlourInput.addEventListener('input', () => {
      if (!prefermentWaterManuallySet) {
        prefermentWaterInput.value = prefermentFlourInput.value;
      }
      updatePrefermentTotals();
    });

    prefermentWaterInput.addEventListener('input', () => {
      if (!prefermentFlourManuallySet) {
        prefermentFlourInput.value = prefermentWaterInput.value;
      }
      updatePrefermentTotals();
    });

    doughFlourInput.addEventListener('input', updateDoughTotals);
    recipeNameInput.addEventListener('input', () => {
      recipeName = recipeNameInput.value;
      recalculateAllTotals();
    });

    recipeJsonOutput.addEventListener('click', () => {
      navigator.clipboard.writeText(recipeJsonOutput.value)
        .then(() => {
          recipeJsonOutput.classList.add('copied');
          setTimeout(() => {
            recipeJsonOutput.classList.remove('copied');
          }, 350);
        })
        .catch(err => {
          console.error('Failed to copy JSON to clipboard:', err);
        });
    });

    hydrationPercentageInput.addEventListener('input', updateDoughTotals);

    loadRecipeButton.addEventListener('click', loadRecipeFromJson);
    saveRecipeButton.addEventListener('click', saveRecipe);

    recipeDataCheckbox.addEventListener('change', () => {
      recipeDataSection.style.display = recipeDataCheckbox.checked ? 'block' : 'none';
    });

    document.getElementById('themeCheckbox').addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      document.body.classList.toggle('light-mode');
    });

    updateSourdoughTotals();
    updatePrefermentTotals();
    updateDoughTotals();
    rebuildOtherIngredientsUI();
    renderRecipeList();
    recalculateAllTotals();

    const savedRecipes = getSavedRecipes();
    if (savedRecipes.length > 0) {
      const lastRecipe = savedRecipes.reduce((prev, current) =>
        new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current
      );
      recipeJsonOutput.value = JSON.stringify(lastRecipe, null, 2);
      loadRecipeFromJson();
      recipeDataCheckbox.checked = true;
      recipeDataSection.style.display = 'block';
    }
  });
} else {
  console.log("Welcome in cli");
}
