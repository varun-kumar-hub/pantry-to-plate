export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
  image: string;
  servings: number;
}

export const recipes: Recipe[] = [
  {
    id: 'pasta-aglio-olio',
    name: 'Pasta Aglio e Olio',
    description: 'A classic Italian pasta dish with garlic, olive oil, and chili flakes. Simple yet incredibly flavorful.',
    ingredients: [
      { name: 'spaghetti', quantity: '400g' },
      { name: 'garlic', quantity: '6 cloves' },
      { name: 'olive oil', quantity: '1/2 cup' },
      { name: 'red chili flakes', quantity: '1 tsp' },
      { name: 'parsley', quantity: '1/4 cup chopped' },
      { name: 'parmesan cheese', quantity: '1/2 cup grated' },
      { name: 'salt', quantity: 'to taste' },
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
      'While pasta cooks, slice garlic thinly and heat olive oil in a large pan over medium-low heat.',
      'Add sliced garlic to the oil and cook until golden, about 2-3 minutes. Be careful not to burn.',
      'Add chili flakes and remove from heat.',
      'Reserve 1 cup of pasta water, then drain the spaghetti.',
      'Add pasta to the pan with garlic oil, toss well, adding pasta water as needed.',
      'Add fresh parsley and toss again. Serve with grated parmesan.',
    ],
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    servings: 4,
  },
  {
    id: 'classic-omelette',
    name: 'Classic French Omelette',
    description: 'A perfectly cooked, creamy French omelette with herbs. Master this and you master eggs.',
    ingredients: [
      { name: 'eggs', quantity: '3' },
      { name: 'butter', quantity: '2 tbsp' },
      { name: 'chives', quantity: '1 tbsp chopped' },
      { name: 'salt', quantity: '1/4 tsp' },
      { name: 'pepper', quantity: 'pinch' },
    ],
    instructions: [
      'Crack eggs into a bowl, add salt and pepper, and beat until well combined.',
      'Heat butter in a non-stick pan over medium-high heat until foaming.',
      'Pour in eggs and let sit for 10 seconds.',
      'Using a spatula, pull cooked edges toward center, tilting pan to let uncooked egg flow to edges.',
      'When almost set but still slightly wet on top, add chives.',
      'Fold omelette in thirds and slide onto a warm plate.',
    ],
    cookingTime: 10,
    difficulty: 'Medium',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    servings: 1,
  },
  {
    id: 'chicken-stir-fry',
    name: 'Quick Chicken Stir Fry',
    description: 'A healthy and quick stir fry with tender chicken and colorful vegetables in a savory sauce.',
    ingredients: [
      { name: 'chicken breast', quantity: '500g, sliced' },
      { name: 'bell peppers', quantity: '2, sliced' },
      { name: 'broccoli', quantity: '2 cups florets' },
      { name: 'soy sauce', quantity: '3 tbsp' },
      { name: 'garlic', quantity: '3 cloves, minced' },
      { name: 'ginger', quantity: '1 inch, grated' },
      { name: 'vegetable oil', quantity: '2 tbsp' },
      { name: 'cornstarch', quantity: '1 tbsp' },
      { name: 'sesame oil', quantity: '1 tsp' },
    ],
    instructions: [
      'Mix soy sauce, cornstarch, and sesame oil in a bowl. Set aside.',
      'Heat vegetable oil in a wok or large pan over high heat.',
      'Add chicken and stir-fry until golden, about 4-5 minutes. Remove and set aside.',
      'Add more oil if needed, then add garlic and ginger. Stir for 30 seconds.',
      'Add vegetables and stir-fry for 3-4 minutes until crisp-tender.',
      'Return chicken to wok, add sauce, and toss until everything is coated and sauce thickens.',
      'Serve immediately over steamed rice.',
    ],
    cookingTime: 25,
    difficulty: 'Easy',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    servings: 4,
  },
  {
    id: 'vegetable-fried-rice',
    name: 'Vegetable Fried Rice',
    description: 'A delicious way to use leftover rice. Packed with vegetables and perfectly seasoned.',
    ingredients: [
      { name: 'cooked rice', quantity: '4 cups (cold)' },
      { name: 'eggs', quantity: '2' },
      { name: 'carrots', quantity: '1 cup, diced' },
      { name: 'peas', quantity: '1 cup' },
      { name: 'green onions', quantity: '4, sliced' },
      { name: 'soy sauce', quantity: '3 tbsp' },
      { name: 'vegetable oil', quantity: '3 tbsp' },
      { name: 'garlic', quantity: '2 cloves, minced' },
      { name: 'sesame oil', quantity: '1 tsp' },
    ],
    instructions: [
      'Heat 1 tablespoon oil in a wok over high heat. Scramble eggs and set aside.',
      'Add remaining oil to wok. Add carrots and cook for 2 minutes.',
      'Add garlic and peas, stir-fry for 1 minute.',
      'Add cold rice, breaking up any clumps. Stir-fry for 3-4 minutes.',
      'Add soy sauce and toss to coat evenly.',
      'Add scrambled eggs and green onions, toss to combine.',
      'Drizzle with sesame oil and serve hot.',
    ],
    cookingTime: 15,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    servings: 4,
  },
  {
    id: 'tomato-soup',
    name: 'Creamy Tomato Soup',
    description: 'A comforting, velvety tomato soup that pairs perfectly with grilled cheese sandwiches.',
    ingredients: [
      { name: 'tomatoes', quantity: '1 kg, roughly chopped' },
      { name: 'onion', quantity: '1 large, diced' },
      { name: 'garlic', quantity: '4 cloves' },
      { name: 'vegetable broth', quantity: '2 cups' },
      { name: 'heavy cream', quantity: '1/2 cup' },
      { name: 'olive oil', quantity: '2 tbsp' },
      { name: 'basil', quantity: '1/4 cup fresh' },
      { name: 'sugar', quantity: '1 tsp' },
      { name: 'salt', quantity: 'to taste' },
    ],
    instructions: [
      'Heat olive oil in a large pot over medium heat. Add onion and cook until soft, about 5 minutes.',
      'Add garlic and cook for 1 minute more.',
      'Add tomatoes, sugar, and salt. Cook for 10 minutes, stirring occasionally.',
      'Pour in vegetable broth and bring to a simmer. Cook for 15 minutes.',
      'Use an immersion blender to puree until smooth.',
      'Stir in heavy cream and most of the basil. Season to taste.',
      'Serve hot, garnished with remaining basil leaves.',
    ],
    cookingTime: 35,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    servings: 6,
  },
  {
    id: 'banana-pancakes',
    name: 'Fluffy Banana Pancakes',
    description: 'Light and fluffy pancakes with sweet banana flavor. Perfect weekend breakfast.',
    ingredients: [
      { name: 'ripe bananas', quantity: '2, mashed' },
      { name: 'flour', quantity: '1.5 cups' },
      { name: 'eggs', quantity: '2' },
      { name: 'milk', quantity: '1 cup' },
      { name: 'baking powder', quantity: '2 tsp' },
      { name: 'butter', quantity: '2 tbsp, melted' },
      { name: 'sugar', quantity: '2 tbsp' },
      { name: 'vanilla extract', quantity: '1 tsp' },
      { name: 'cinnamon', quantity: '1/2 tsp' },
    ],
    instructions: [
      'Mix flour, baking powder, sugar, and cinnamon in a large bowl.',
      'In another bowl, combine mashed bananas, eggs, milk, melted butter, and vanilla.',
      'Pour wet ingredients into dry ingredients and mix until just combined. Lumps are okay.',
      'Heat a non-stick pan over medium heat. Lightly grease with butter.',
      'Pour 1/4 cup batter per pancake. Cook until bubbles form on surface, about 2 minutes.',
      'Flip and cook another 1-2 minutes until golden brown.',
      'Serve warm with maple syrup and sliced bananas.',
    ],
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    servings: 4,
  },
  {
    id: 'grilled-cheese',
    name: 'Ultimate Grilled Cheese',
    description: 'Crispy, buttery bread with melted cheese perfection. Comfort food at its best.',
    ingredients: [
      { name: 'bread', quantity: '4 slices' },
      { name: 'cheddar cheese', quantity: '4 slices' },
      { name: 'butter', quantity: '3 tbsp, softened' },
      { name: 'mayonnaise', quantity: '1 tbsp' },
    ],
    instructions: [
      'Mix softened butter with mayonnaise until smooth.',
      'Spread butter mixture on one side of each bread slice.',
      'Heat a pan over medium-low heat.',
      'Place one slice butter-side down in the pan. Top with cheese slices.',
      'Place second slice on top, butter-side up.',
      'Cook for 3-4 minutes until golden brown, then flip.',
      'Cook another 3-4 minutes until cheese is melted and bread is golden.',
    ],
    cookingTime: 10,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
    servings: 2,
  },
  {
    id: 'dal-tadka',
    name: 'Dal Tadka',
    description: 'Comforting Indian lentils tempered with aromatic spices. A hostel favorite.',
    ingredients: [
      { name: 'yellow lentils (toor dal)', quantity: '1 cup' },
      { name: 'onion', quantity: '1, finely chopped' },
      { name: 'tomatoes', quantity: '2, chopped' },
      { name: 'garlic', quantity: '4 cloves, minced' },
      { name: 'cumin seeds', quantity: '1 tsp' },
      { name: 'turmeric', quantity: '1/2 tsp' },
      { name: 'red chili powder', quantity: '1/2 tsp' },
      { name: 'ghee', quantity: '2 tbsp' },
      { name: 'coriander leaves', quantity: 'for garnish' },
    ],
    instructions: [
      'Wash lentils and pressure cook with 3 cups water, turmeric, and salt until soft.',
      'Mash the cooked lentils slightly and set aside.',
      'Heat ghee in a pan. Add cumin seeds and let them splutter.',
      'Add garlic and sauté until golden.',
      'Add onions and cook until translucent.',
      'Add tomatoes and spices. Cook until tomatoes are soft.',
      'Pour the tadka over the lentils, mix well, and garnish with coriander.',
    ],
    cookingTime: 30,
    difficulty: 'Easy',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    servings: 4,
  },
  {
    id: 'masala-maggi',
    name: 'Masala Maggi',
    description: 'The ultimate hostel comfort food - spiced instant noodles with vegetables.',
    ingredients: [
      { name: 'maggi noodles', quantity: '2 packets' },
      { name: 'onion', quantity: '1 small, chopped' },
      { name: 'tomato', quantity: '1, chopped' },
      { name: 'green peas', quantity: '1/4 cup' },
      { name: 'green chili', quantity: '1, chopped' },
      { name: 'butter', quantity: '1 tbsp' },
      { name: 'maggi masala', quantity: '2 packets' },
      { name: 'water', quantity: '2 cups' },
    ],
    instructions: [
      'Heat butter in a pan. Add onions and sauté until light brown.',
      'Add green chili and tomatoes. Cook for 2 minutes.',
      'Add green peas and water. Bring to a boil.',
      'Add Maggi noodles and masala packets.',
      'Cook for 2-3 minutes, stirring occasionally.',
      'Let it cook until noodles absorb most of the water.',
      'Serve hot with extra butter on top.',
    ],
    cookingTime: 10,
    difficulty: 'Easy',
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800',
    servings: 2,
  },
  {
    id: 'chocolate-mug-cake',
    name: 'Chocolate Mug Cake',
    description: 'A single-serving chocolate cake ready in 5 minutes. Perfect for late-night cravings.',
    ingredients: [
      { name: 'flour', quantity: '4 tbsp' },
      { name: 'sugar', quantity: '3 tbsp' },
      { name: 'cocoa powder', quantity: '2 tbsp' },
      { name: 'milk', quantity: '3 tbsp' },
      { name: 'vegetable oil', quantity: '2 tbsp' },
      { name: 'vanilla extract', quantity: '1/4 tsp' },
      { name: 'baking powder', quantity: '1/4 tsp' },
      { name: 'chocolate chips', quantity: '1 tbsp' },
    ],
    instructions: [
      'In a microwave-safe mug, mix flour, sugar, cocoa powder, and baking powder.',
      'Add milk, oil, and vanilla extract. Stir until smooth.',
      'Fold in chocolate chips.',
      'Microwave on high for 1 minute 30 seconds to 2 minutes.',
      'Let it cool for a minute before eating.',
      'Top with ice cream or whipped cream if desired.',
    ],
    cookingTime: 5,
    difficulty: 'Easy',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
    servings: 1,
  },
  {
    id: 'caprese-salad',
    name: 'Caprese Salad',
    description: 'Fresh Italian salad with ripe tomatoes, mozzarella, and basil. Light and refreshing.',
    ingredients: [
      { name: 'tomatoes', quantity: '4 ripe, sliced' },
      { name: 'mozzarella cheese', quantity: '250g, sliced' },
      { name: 'fresh basil', quantity: '1 bunch' },
      { name: 'olive oil', quantity: '3 tbsp' },
      { name: 'balsamic glaze', quantity: '2 tbsp' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'black pepper', quantity: 'to taste' },
    ],
    instructions: [
      'Arrange tomato and mozzarella slices alternating on a serving plate.',
      'Tuck fresh basil leaves between the slices.',
      'Drizzle generously with olive oil.',
      'Add balsamic glaze in a zigzag pattern.',
      'Season with salt and freshly ground black pepper.',
      'Serve immediately at room temperature.',
    ],
    cookingTime: 10,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1608032077018-c9aad9565d29?w=800',
    servings: 2,
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    description: 'Creamy, rich Indian chicken curry with a velvety tomato-based sauce. Restaurant quality at home.',
    ingredients: [
      { name: 'chicken thighs', quantity: '500g, cubed' },
      { name: 'butter', quantity: '4 tbsp' },
      { name: 'onion', quantity: '1 large, pureed' },
      { name: 'tomato puree', quantity: '1 cup' },
      { name: 'heavy cream', quantity: '1/2 cup' },
      { name: 'ginger-garlic paste', quantity: '2 tbsp' },
      { name: 'garam masala', quantity: '1 tsp' },
      { name: 'kashmiri red chili', quantity: '1 tsp' },
      { name: 'yogurt', quantity: '1/2 cup' },
    ],
    instructions: [
      'Marinate chicken in yogurt, ginger-garlic paste, and spices for 2 hours.',
      'Cook marinated chicken in a pan until golden. Set aside.',
      'In the same pan, melt butter and add onion puree. Cook until golden.',
      'Add tomato puree and cook for 10 minutes.',
      'Add spices and cook for 2 more minutes.',
      'Add cooked chicken and simmer for 10 minutes.',
      'Stir in cream, adjust seasoning, and garnish with butter and cream.',
    ],
    cookingTime: 45,
    difficulty: 'Medium',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    servings: 4,
  },
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
