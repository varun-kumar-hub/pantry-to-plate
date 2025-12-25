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
    id: 'pesarattu',
    name: 'Pesarattu',
    description: 'A nutritious green gram dosa from Andhra Pradesh. High in protein and perfect for breakfast.',
    ingredients: [
      { name: 'green gram (moong dal)', quantity: '2 cups' },
      { name: 'green chilies', quantity: '3-4' },
      { name: 'ginger', quantity: '1 inch piece' },
      { name: 'cumin seeds', quantity: '1 tsp' },
      { name: 'onion', quantity: '1, finely chopped' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'oil', quantity: 'for cooking' },
    ],
    instructions: [
      'Soak green gram for 4-5 hours, then drain.',
      'Grind with green chilies, ginger, cumin seeds, and salt to a smooth batter.',
      'The batter should be slightly thicker than dosa batter.',
      'Heat a tawa and pour a ladleful of batter, spread in circular motion.',
      'Sprinkle chopped onions on top and drizzle oil around edges.',
      'Cook until crispy and golden on the bottom.',
      'Serve hot with ginger chutney and upma.',
    ],
    cookingTime: 30,
    difficulty: 'Medium',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
    servings: 4,
  },
  {
    id: 'gongura-pachadi',
    name: 'Gongura Pachadi',
    description: 'Tangy sorrel leaves chutney, a signature dish of Andhra cuisine with distinct sour flavor.',
    ingredients: [
      { name: 'gongura leaves', quantity: '2 cups' },
      { name: 'red chilies', quantity: '6-8 dried' },
      { name: 'garlic', quantity: '6 cloves' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'fenugreek seeds', quantity: '1/2 tsp' },
      { name: 'oil', quantity: '3 tbsp' },
      { name: 'salt', quantity: 'to taste' },
    ],
    instructions: [
      'Wash gongura leaves and remove stems.',
      'Heat oil in a pan, add mustard seeds and fenugreek seeds.',
      'Add dried red chilies and garlic, sauté until golden.',
      'Add gongura leaves and cook until wilted, about 5 minutes.',
      'Let it cool, then grind to a coarse paste.',
      'Temper with mustard seeds and curry leaves.',
      'Serve with hot rice and ghee.',
    ],
    cookingTime: 25,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',
    servings: 4,
  },
  {
    id: 'hyderabadi-biryani',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic layered rice dish with tender chicken, saffron, and traditional spices. A royal delicacy.',
    ingredients: [
      { name: 'basmati rice', quantity: '2 cups' },
      { name: 'chicken', quantity: '500g' },
      { name: 'yogurt', quantity: '1 cup' },
      { name: 'onions', quantity: '3 large, sliced' },
      { name: 'saffron', quantity: '1/2 tsp in milk' },
      { name: 'biryani masala', quantity: '2 tbsp' },
      { name: 'ghee', quantity: '4 tbsp' },
      { name: 'mint leaves', quantity: '1 cup' },
      { name: 'ginger-garlic paste', quantity: '2 tbsp' },
    ],
    instructions: [
      'Marinate chicken with yogurt, ginger-garlic paste, biryani masala, and salt for 2 hours.',
      'Fry sliced onions until golden brown. Set half aside for layering.',
      'Cook marinated chicken with fried onions until half done.',
      'Parboil rice with whole spices until 70% cooked.',
      'Layer rice over chicken, add mint, saffron milk, and fried onions.',
      'Seal with dough and cook on dum (low heat) for 25 minutes.',
      'Gently mix and serve with raita and mirchi ka salan.',
    ],
    cookingTime: 90,
    difficulty: 'Hard',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
    servings: 6,
  },
  {
    id: 'pappu-charu',
    name: 'Pappu Charu',
    description: 'Andhra style lentil soup with tangy tamarind flavor. A staple comfort food in Telugu homes.',
    ingredients: [
      { name: 'toor dal', quantity: '1 cup' },
      { name: 'tamarind', quantity: 'small lemon sized' },
      { name: 'tomatoes', quantity: '2, chopped' },
      { name: 'green chilies', quantity: '2' },
      { name: 'curry leaves', quantity: '1 sprig' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'cumin seeds', quantity: '1 tsp' },
      { name: 'turmeric', quantity: '1/2 tsp' },
      { name: 'ghee', quantity: '2 tbsp' },
    ],
    instructions: [
      'Pressure cook toor dal until soft and mash well.',
      'Extract tamarind juice and add to cooked dal.',
      'Add tomatoes, green chilies, turmeric, and salt. Simmer for 10 minutes.',
      'In a small pan, heat ghee and add mustard seeds, cumin seeds.',
      'Add curry leaves and dried red chilies for tempering.',
      'Pour the tempering over the rasam and mix well.',
      'Serve hot with rice and a dollop of ghee.',
    ],
    cookingTime: 35,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    servings: 4,
  },
  {
    id: 'gutti-vankaya',
    name: 'Gutti Vankaya Kura',
    description: 'Stuffed baby eggplants in spicy peanut-coconut masala. A beloved Andhra vegetarian dish.',
    ingredients: [
      { name: 'baby eggplants', quantity: '250g' },
      { name: 'peanuts', quantity: '1/4 cup' },
      { name: 'coconut', quantity: '2 tbsp grated' },
      { name: 'sesame seeds', quantity: '1 tbsp' },
      { name: 'tamarind', quantity: '1 tbsp paste' },
      { name: 'red chili powder', quantity: '2 tsp' },
      { name: 'onion', quantity: '1, sliced' },
      { name: 'oil', quantity: '4 tbsp' },
      { name: 'curry leaves', quantity: '1 sprig' },
    ],
    instructions: [
      'Slit baby eggplants into quarters keeping stem intact.',
      'Dry roast peanuts, coconut, and sesame seeds. Grind to a powder.',
      'Mix ground powder with tamarind paste, chili powder, and salt to make stuffing.',
      'Stuff each eggplant with the masala mixture.',
      'Heat oil, add mustard seeds, cumin, and curry leaves.',
      'Add sliced onions and cook until golden.',
      'Add stuffed eggplants, cover and cook on low heat until tender.',
    ],
    cookingTime: 40,
    difficulty: 'Medium',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1594020293008-5f99f60bd4e0?w=800',
    servings: 4,
  },
  {
    id: 'pulihora',
    name: 'Pulihora',
    description: 'Tangy tamarind rice with aromatic tempering. A festive Telugu prasadam and travel-friendly meal.',
    ingredients: [
      { name: 'cooked rice', quantity: '3 cups' },
      { name: 'tamarind', quantity: 'lemon sized' },
      { name: 'peanuts', quantity: '2 tbsp' },
      { name: 'chana dal', quantity: '1 tbsp' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'dried red chilies', quantity: '4' },
      { name: 'turmeric', quantity: '1/2 tsp' },
      { name: 'curry leaves', quantity: '2 sprigs' },
      { name: 'sesame oil', quantity: '4 tbsp' },
    ],
    instructions: [
      'Soak tamarind in warm water and extract thick juice.',
      'Cook tamarind juice with turmeric and salt until it thickens.',
      'Heat sesame oil, add mustard seeds, chana dal, and peanuts.',
      'When dal turns golden, add dried chilies and curry leaves.',
      'Add tamarind mixture to the tempering and cook for 2 minutes.',
      'Spread cooked rice on a plate and pour the tamarind mixture.',
      'Mix gently to coat all rice grains. Serve at room temperature.',
    ],
    cookingTime: 25,
    difficulty: 'Easy',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
    servings: 4,
  },
  {
    id: 'mirapakaya-bajji',
    name: 'Mirapakaya Bajji',
    description: 'Crispy fried green chili fritters with gram flour batter. A popular Telugu evening snack.',
    ingredients: [
      { name: 'large green chilies', quantity: '10' },
      { name: 'gram flour (besan)', quantity: '1 cup' },
      { name: 'rice flour', quantity: '2 tbsp' },
      { name: 'red chili powder', quantity: '1 tsp' },
      { name: 'ajwain (carom seeds)', quantity: '1/2 tsp' },
      { name: 'baking soda', quantity: 'pinch' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'oil', quantity: 'for deep frying' },
    ],
    instructions: [
      'Slit green chilies lengthwise and remove seeds if you want less spicy.',
      'Mix gram flour, rice flour, chili powder, ajwain, salt, and baking soda.',
      'Add water gradually to make a thick coating batter.',
      'Heat oil in a deep pan for frying.',
      'Dip each chili in batter, coating evenly.',
      'Deep fry until golden and crispy, about 2-3 minutes.',
      'Serve hot with coconut chutney or tomato ketchup.',
    ],
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
    servings: 4,
  },
  {
    id: 'royyala-iguru',
    name: 'Royyala Iguru',
    description: 'Spicy Andhra prawn curry with bold flavors. A coastal Telugu specialty.',
    ingredients: [
      { name: 'prawns', quantity: '500g, cleaned' },
      { name: 'onions', quantity: '2, finely chopped' },
      { name: 'tomatoes', quantity: '2, pureed' },
      { name: 'ginger-garlic paste', quantity: '2 tbsp' },
      { name: 'red chili powder', quantity: '2 tsp' },
      { name: 'coriander powder', quantity: '1 tsp' },
      { name: 'curry leaves', quantity: '2 sprigs' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'oil', quantity: '4 tbsp' },
    ],
    instructions: [
      'Clean prawns thoroughly and marinate with salt and turmeric.',
      'Heat oil, add mustard seeds, curry leaves, and green chilies.',
      'Add onions and cook until golden brown.',
      'Add ginger-garlic paste and sauté for 2 minutes.',
      'Add tomato puree, chili powder, and coriander powder. Cook until oil separates.',
      'Add marinated prawns and cook on high heat for 5-7 minutes.',
      'Garnish with fresh coriander and serve with rice.',
    ],
    cookingTime: 30,
    difficulty: 'Medium',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
    servings: 4,
  },
  {
    id: 'double-ka-meetha',
    name: 'Double Ka Meetha',
    description: 'Hyderabadi bread pudding soaked in sweetened milk and garnished with nuts. A royal dessert.',
    ingredients: [
      { name: 'bread slices', quantity: '6' },
      { name: 'milk', quantity: '2 cups' },
      { name: 'sugar', quantity: '1 cup' },
      { name: 'ghee', quantity: '4 tbsp' },
      { name: 'cardamom powder', quantity: '1/2 tsp' },
      { name: 'saffron', quantity: 'few strands' },
      { name: 'almonds', quantity: '10, sliced' },
      { name: 'cashews', quantity: '10' },
      { name: 'raisins', quantity: '2 tbsp' },
    ],
    instructions: [
      'Remove bread crusts and cut into triangles.',
      'Deep fry bread pieces in ghee until golden. Set aside.',
      'Boil milk with sugar until reduced by half.',
      'Add saffron soaked in warm milk and cardamom powder.',
      'Fry nuts and raisins in ghee until golden.',
      'Arrange fried bread in a serving dish, pour the sweetened milk over.',
      'Garnish with fried nuts and raisins. Serve warm.',
    ],
    cookingTime: 40,
    difficulty: 'Medium',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
    servings: 6,
  },
  {
    id: 'upma',
    name: 'Upma',
    description: 'Savory semolina porridge with vegetables and aromatic tempering. A quick South Indian breakfast.',
    ingredients: [
      { name: 'semolina (rava)', quantity: '1 cup' },
      { name: 'onion', quantity: '1, finely chopped' },
      { name: 'green chilies', quantity: '2, chopped' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'urad dal', quantity: '1 tsp' },
      { name: 'chana dal', quantity: '1 tsp' },
      { name: 'curry leaves', quantity: '1 sprig' },
      { name: 'ghee', quantity: '2 tbsp' },
      { name: 'cashews', quantity: '10' },
    ],
    instructions: [
      'Dry roast semolina until light golden and aromatic. Set aside.',
      'Heat ghee, add mustard seeds, urad dal, chana dal, and cashews.',
      'When dal turns golden, add curry leaves and green chilies.',
      'Add onions and sauté until translucent.',
      'Add 2.5 cups water and salt, bring to a boil.',
      'Reduce heat and slowly add roasted semolina while stirring continuously.',
      'Cover and cook for 2 minutes. Serve hot with coconut chutney.',
    ],
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
    servings: 4,
  },
  {
    id: 'natu-kodi-pulusu',
    name: 'Natu Kodi Pulusu',
    description: 'Country chicken curry in tangy tamarind gravy. Authentic village-style Andhra cooking.',
    ingredients: [
      { name: 'country chicken', quantity: '500g' },
      { name: 'onions', quantity: '2, sliced' },
      { name: 'tomatoes', quantity: '2, chopped' },
      { name: 'tamarind', quantity: '1 tbsp paste' },
      { name: 'red chili powder', quantity: '2 tsp' },
      { name: 'coriander powder', quantity: '1 tbsp' },
      { name: 'turmeric', quantity: '1/2 tsp' },
      { name: 'curry leaves', quantity: '2 sprigs' },
      { name: 'oil', quantity: '4 tbsp' },
    ],
    instructions: [
      'Marinate chicken with turmeric and salt for 30 minutes.',
      'Heat oil, add mustard seeds, cumin, and curry leaves.',
      'Add onions and cook until golden brown.',
      'Add ginger-garlic paste and sauté for 2 minutes.',
      'Add tomatoes, chili powder, and coriander powder. Cook until mushy.',
      'Add chicken pieces and cook on high heat for 10 minutes.',
      'Add tamarind paste and water, simmer until chicken is tender.',
    ],
    cookingTime: 50,
    difficulty: 'Medium',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    servings: 4,
  },
  {
    id: 'attu',
    name: 'Attu / Pesarattu',
    description: 'Traditional Telugu rice flour dosa, thin and crispy. A beloved everyday breakfast.',
    ingredients: [
      { name: 'rice flour', quantity: '2 cups' },
      { name: 'cumin seeds', quantity: '1 tsp' },
      { name: 'green chilies', quantity: '2, finely chopped' },
      { name: 'ginger', quantity: '1 inch, grated' },
      { name: 'onion', quantity: '1, finely chopped' },
      { name: 'curry leaves', quantity: '1 sprig' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'oil', quantity: 'for cooking' },
    ],
    instructions: [
      'Mix rice flour with cumin seeds, green chilies, ginger, and salt.',
      'Add water gradually to make a thin, pourable batter.',
      'Add chopped onions and curry leaves to the batter.',
      'Heat a tawa and pour batter, spreading very thin.',
      'Drizzle oil around edges and cook until crispy.',
      'The dosa should be golden and crisp.',
      'Serve hot with allam pachadi (ginger chutney).',
    ],
    cookingTime: 20,
    difficulty: 'Easy',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
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
