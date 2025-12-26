export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  diet: 'veg' | 'non-veg';
  image: string;
  servings: number;
  cuisine?: string;
  calories?: string;
  macronutrients?: {
    protein: string;
    carbs: string;
    fat: string;
  };
  tips?: string[];
  serving_ideas?: string;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Classic Margherita Pizza',
    description: 'A simple yet delicious pizza with fresh basil, mozzarella, and tomato sauce.',
    ingredients: [
      { name: 'Pizza Dough', quantity: '1 ball' },
      { name: 'Tomato Sauce', quantity: '1/2 cup' },
      { name: 'Fresh Mozzarella', quantity: '200g' },
      { name: 'Fresh Basil', quantity: '1 bunch' },
      { name: 'Olive Oil', quantity: '2 tbsp' }
    ],
    instructions: [
      'Preheat oven to highest setting.',
      'Roll out dough.',
      'Spread sauce and top with cheese.',
      'Bake for 10-12 minutes.',
      'Garnish with fresh basil.'
    ],
    cookingTime: 30,
    difficulty: 'Easy',
    category: 'Dinner',
    diet: 'veg',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80',
    servings: 2
  },
  {
    id: '2',
    name: 'Creamy Mushroom Risotto',
    description: 'Rich and creamy Italian rice dish cooked with mushrooms and parmesan.',
    ingredients: [
      { name: 'Arborio Rice', quantity: '1 cup' },
      { name: 'Mushrooms', quantity: '200g' },
      { name: 'Vegetable Broth', quantity: '4 cups' },
      { name: 'Parmesan Cheese', quantity: '1/2 cup' },
      { name: 'Onion', quantity: '1 small' }
    ],
    instructions: [
      'Sauté onion and mushrooms.',
      'Add rice and toast slightly.',
      'Add broth one ladle at a time, stirring constantly.',
      'Finish with parmesan and butter.'
    ],
    cookingTime: 45,
    difficulty: 'Medium',
    category: 'Dinner',
    diet: 'veg',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80',
    servings: 2
  },
  {
    id: '3',
    name: 'Avocado Toast with Poached Egg',
    description: 'A healthy and filling breakfast option.',
    ingredients: [
      { name: 'Sourdough Bread', quantity: '2 slices' },
      { name: 'Avocado', quantity: '1 ripe' },
      { name: 'Eggs', quantity: '2' },
      { name: 'Chili Flakes', quantity: 'pinch' },
      { name: 'Lemon Juice', quantity: '1 tsp' }
    ],
    instructions: [
      'Toast the bread.',
      'Mash avocado with lemon juice.',
      'Poach the eggs.',
      'Assemble toast with avocado and egg on top.',
      'Sprinkle with chili flakes.'
    ],
    cookingTime: 15,
    difficulty: 'Medium',
    category: 'Breakfast',
    diet: 'non-veg',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&q=80',
    servings: 2
  },
  {
    id: '4',
    name: 'Spicy Chicken Curry',
    description: 'A flavorful and spicy chicken curry made with aromatic spices.',
    ingredients: [
      { name: 'Chicken Breast', quantity: '500g' },
      { name: 'Onions', quantity: '2' },
      { name: 'Tomatoes', quantity: '2' },
      { name: 'Ginger Garlic Paste', quantity: '1 tbsp' },
      { name: 'Curry Powder', quantity: '2 tbsp' }
    ],
    instructions: [
      'Sauté onions and ginger garlic paste.',
      'Add tomatoes and spices, cook until soft.',
      'Add chicken and cook until sealed.',
      'Simmer with water until chicken is cooked.',
      'Serve with rice.'
    ],
    cookingTime: 40,
    difficulty: 'Medium',
    category: 'Dinner',
    diet: 'non-veg',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80',
    servings: 4
  }
];

export function searchRecipes(query: string): Recipe[] {
  const searchTerms = query.toLowerCase().split(',').map(term => term.trim()).filter(Boolean);

  if (searchTerms.length === 0) return [];

  const scored = recipes.map(recipe => {
    const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
    const recipeName = recipe.name.toLowerCase();

    let matchCount = 0;
    let nameMatch = false;

    searchTerms.forEach(term => {
      if (recipeName.includes(term)) {
        nameMatch = true;
      }
      recipeIngredients.forEach(ingredient => {
        if (ingredient.includes(term)) {
          matchCount++;
        }
      });
    });

    return {
      recipe,
      score: nameMatch ? 100 + matchCount : matchCount,
      matchCount,
      missingCount: recipe.ingredients.length - matchCount,
    };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(recipe => recipe.id === id);
}
