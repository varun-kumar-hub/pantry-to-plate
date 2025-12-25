export interface DishVarietyData {
  variety_name: string;
  short_description: string;
  tags?: string[];
  image_url?: string;
}

export const fallbackVarieties: Record<string, DishVarietyData[]> = {
  biryani: [
    { variety_name: "Hyderabadi Chicken Biryani", short_description: "World-famous dum cooked spicy biryani" },
    { variety_name: "Lucknowi Chicken Biryani", short_description: "Aromatic Awadhi style with mild spices" },
    { variety_name: "Kolkata Chicken Biryani", short_description: "Bengali style with potato and egg" },
    { variety_name: "Ambur Chicken Biryani", short_description: "Tangy and spicy Tamil Nadu style" },
    { variety_name: "Thalassery Chicken Biryani", short_description: "Kerala Malabar style with Jeerakasala rice" },
    { variety_name: "Dindigul Chicken Biryani", short_description: "Flavorful Seeraga Samba rice biryani" },
    { variety_name: "Donne Chicken Biryani", short_description: "Classic Karnataka green masala biryani" },
    { variety_name: "Andhra Spicy Chicken Biryani", short_description: "Fiery hot coastal Andhra style" },
  ],
  "mutton biryani": [
    { variety_name: "Hyderabadi Mutton Biryani", short_description: "The King of Biryanis - slow cooked dum style" },
    { variety_name: "Lucknowi Mutton Biryani", short_description: "Royal Awadhi flavor with saffron and rose water" },
    { variety_name: "Thalassery Mutton Biryani", short_description: "Rich Malabar flavors with ghee" },
    { variety_name: "Ambur Mutton Biryani", short_description: "Arcot style spicy mutton biryani" },
    { variety_name: "Kashmiri Yakhni Biryani", short_description: "Mild yogurt-based saffron biryani" },
    { variety_name: "Andhra Mutton Biryani", short_description: "Spicy gongura or fry piece biryani" },
  ],
  "prawn biryani": [
    { variety_name: "Malabar Prawn Biryani", short_description: "Coastal Kerala style with aromatic spices" },
    { variety_name: "Andhra Prawn Biryani", short_description: "Spicy masala rich prawn biryani" },
    { variety_name: "Prawn Dum Biryani", short_description: "Layered rice and prawn masala cooked on dum" },
    { variety_name: "Goan Prawn Biryani", short_description: "Tangy and spicy Goan fusion style" },
    { variety_name: "Chettinad Prawn Biryani", short_description: "Peppery and aromatic Tamil style" },
  ],
  "veg biryani": [
    { variety_name: "Hyderabadi Veg Biryani", short_description: "Spicy mixed vegetable dum biryani" },
    { variety_name: "Paneer Biryani", short_description: "Basmati rice layered with marinated paneer" },
    { variety_name: "Mushroom Biryani", short_description: "Simply delicious earthy flavors" },
    { variety_name: "Soya Chunk Biryani", short_description: "Protein-rich meal maker biryani" },
    { variety_name: "Chettinad Veg Biryani", short_description: "Spicy roasted spice flavor" },
    { variety_name: "Kashmiri Veg Biryani", short_description: "Sweet and savory with dry fruits" },
  ],
  "egg biryani": [
    { variety_name: "Hyderabadi Egg Biryani", short_description: "Spicy masala coated eggs in aromatic rice" },
    { variety_name: "Kolkata Egg Biryani", short_description: "Classic potato and egg combination" },
    { variety_name: "Andhra Egg Biryani", short_description: "Spicy roasted egg masala biryani" },
    { variety_name: "Street-style Egg Biryani", short_description: "Quick tawa fried spicy rice" },
  ],
  pizza: [
    { variety_name: "Margherita Pizza", short_description: "Classic tomato, mozzarella and basil" },
    { variety_name: "Farmhouse Pizza", short_description: "Loaded with onion, capsicum, tomato and mushroom" },
    { variety_name: "Paneer Tikka Pizza", short_description: "Indian fusion with marinated paneer" },
    { variety_name: "Chicken Pepperoni Pizza", short_description: "Spicy chicken sausage slices" },
    { variety_name: "BBQ Chicken Pizza", short_description: "Smoky barbecue sauce with grilled chicken" },
    { variety_name: "Peri Peri Chicken Pizza", short_description: "Spicy African bird's eye chili flavor" },
    { variety_name: "Tandoori Veg Pizza", short_description: "Desi style roasted vegetable toppings" },
  ],
  burger: [
    { variety_name: "Classic Veg Burger", short_description: "Crispy vegetable patty with mayo" },
    { variety_name: "McAloo Tikki Style", short_description: "Potato and pea spiced patty" },
    { variety_name: "Crispy Chicken Burger", short_description: "Fried chicken fillet with lettuce" },
    { variety_name: "Grilled Chicken Burger", short_description: "Healthy grilled breast with veggies" },
    { variety_name: "Mutton Burger", short_description: "Juicy minced lamb patty" },
    { variety_name: "Paneer Burger", short_description: "Crispy pani patty with spicy sauce" },
  ],
  curry: [
    { variety_name: "Butter Chicken", short_description: "Creamy tomato buttery gravy (Makhani)" },
    { variety_name: "Chicken Chettinad", short_description: "Spicy roasted coconut and spice gravy" },
    { variety_name: "North Indian Chicken Curry", short_description: "Classic onion tomato gravy" },
    { variety_name: "Rogan Josh", short_description: "Aromatic Kashmiri mutton curry" },
    { variety_name: "Mutton Korma", short_description: "Rich Mughlai creamy mutton gravy" },
    { variety_name: "Palak Paneer", short_description: "Healthy spinach gravy with paneer cubes" },
    { variety_name: "Andhra Chicken Curry", short_description: "Spicy red chili based gravy (Kodi Kura)" },
    { variety_name: "Dal Makhani", short_description: "Slow cooked black lentils with cream" },
    { variety_name: "Chole Masala", short_description: "Spicy chickpea curry North Indian style" },
  ],
  "fish curry": [
    { variety_name: "Kerala Fish Curry", short_description: "Tangy coconut and kokum curry" },
    { variety_name: "Goan Fish Curry", short_description: "Coconut milk based sour curry" },
    { variety_name: "Bengali Fish Curry", short_description: "Mustard oil based Macher Jhol" },
    { variety_name: "Fish Molee", short_description: "Mild coconut milk stew from Kerala" },
    { variety_name: "Chettinad Fish Curry", short_description: "Spicy roasted masala fish gravy" },
    { variety_name: "Andhra Fish Pulusu", short_description: "Tangy tamarind based spicy fish stew" },
  ],
  "chicken curry": [
    { variety_name: "Butter Chicken", short_description: "Creamy tomato buttery gravy (Makhani)" },
    { variety_name: "Chicken Tikka Masala", short_description: "Grilled chicken in spiced tomato gravy" },
    { variety_name: "Chicken Kolhapuri", short_description: "Fiery Maharashtrian style spicy curry" },
    { variety_name: "Gongura Chicken", short_description: "Tangy sorrel leaf chicken curry" },
  ],
  "fry": [
    { variety_name: "Chicken 65", short_description: "Spicy deep fried chicken chunks" },
    { variety_name: "Prawn Fry", short_description: "Crispy coated fried prawns" },
    { variety_name: "Fish Fry", short_description: "Tawa grilled marinated fish slices" },
    { variety_name: "Mutton Chukka", short_description: "Dry roasted spicy mutton chunks" },
    { variety_name: "Apollo Fish", short_description: "Hyderabadi style spicy stir fried fish" },
    { variety_name: "Prawn Ghee Roast", short_description: "Mangalorean tangy spicy roast" },
  ],
  "semi gravy": [
    { variety_name: "Chilli Chicken", short_description: "Indo-Chinese spicy semi-dry chicken" },
    { variety_name: "Chicken Manchurian", short_description: "Fried chicken in tangy soy sauce" },
    { variety_name: "Pepper Chicken", short_description: "Dry chicken roast with black pepper" },
  ],
  "veg curry": [
    { variety_name: "Paneer Butter Masala", short_description: "Rich cashew tomato gravy with cottage cheese" },
    { variety_name: "Kadai Vegetable", short_description: "Mixed veggies in spicy tomato gravy" },
    { variety_name: "Aloo Gobi", short_description: "Potato and cauliflower dry curry" },
    { variety_name: "Malai Kofta", short_description: "Fried dumplings in rich white gravy" },
    { variety_name: "Palak Paneer", short_description: "Spinach smooth gravy with paneer" },
    { variety_name: "Veg Kolhapuri", short_description: "Spicy Maharashtrian mixed veg curry" },
    { variety_name: "Mushroom Masala", short_description: "Spicy onion tomato gravy with mushrooms" },
  ],
  "brinjal": [
    { variety_name: "Gutti Vankaya Curry", short_description: "Andhra special stuffed brinjal curry", image_url: "/gutti-vankaya.png" },
    { variety_name: "Baingan Bharta", short_description: "Smoky roasted mashed eggplant curry" },
    { variety_name: "Brinjal Fry", short_description: "Crispy sliced eggplant fry" },
    { variety_name: "Vankaya Pulusu", short_description: "Tangy tamarind stew with brinjal" },
    { variety_name: "Aloo Baingan", short_description: "Potato and brinjal dry stir fry" },
    { variety_name: "Ennai Kathirikkai", short_description: "Tamil style oily stuffed brinjal gravy" },
  ],
  "potato": [
    { variety_name: "Aloo Fry", short_description: "Simple crispy potato fry" },
    { variety_name: "Dum Aloo", short_description: "Baby potatoes in spicy yogurt gravy" },
    { variety_name: "Jeera Aloo", short_description: "Cumin tempered dry potato dish" },
    { variety_name: "Aloo Matar", short_description: "Potato and peas in tomato gravy" },
    { variety_name: "Honey Chilli Potato", short_description: "Crispy fried potatoes in sweet spicy sauce" },
  ],
  "veg fry": [
    { variety_name: "Aloo Fry", short_description: "Crispy potato fry" },
    { variety_name: "Gobi 65", short_description: "Spicy fried cauliflower florets" },
    { variety_name: "Paneer 65", short_description: "Spicy deep fried paneer cubes" },
    { variety_name: "Mushroom Fry", short_description: "Pepper roasted mushrooms" },
    { variety_name: "Crispy Corn", short_description: "Fried sweet corn with spices" },
    { variety_name: "Baby Corn Manchurian", short_description: "Batter fried baby corn in sauce" },
  ],
  "prawn curry": [
    { variety_name: "Prawn Masala", short_description: "Thick spicy gravy with onions and tomatoes" },
    { variety_name: "Malabar Prawn Curry", short_description: "Coconut rich Kerala curry with raw mango" },
    { variety_name: "Goan Prawn Curry", short_description: "Tangy coconut and spice blend" },
    { variety_name: "Andhra Prawn Curry", short_description: "Spicy red chili prawn masala" },
    { variety_name: "Chingri Malai Curry", short_description: "Bengali creamy coconut prawn curry" },
    { variety_name: "Chettinad Prawn Curry", short_description: "Aromatic peppery prawn gravy" },
  ],
  "chicken fry": [
    { variety_name: "Chicken 65", short_description: "Spicy deep fried chicken chunks" },
    { variety_name: "Pepper Chicken", short_description: "Dry chicken roast with black pepper" },
    { variety_name: "Chicken Ghee Roast", short_description: "Mangalorean tangy spicy roast" },
    { variety_name: "Chicken Sukka", short_description: "Dry coconut based chicken dish" },
  ],
  "fish fry": [
    { variety_name: "Apollo Fish", short_description: "Hyderabadi style spicy stir fried fish" },
    { variety_name: "Tawa Fish Fry", short_description: "Marinated slices grilled on pan" },
    { variety_name: "Rava Fish Fry", short_description: "Semolina coated crispy fry" },
  ],
  "mutton fry": [
    { variety_name: "Mutton Chukka", short_description: "Dry roasted spicy mutton chunks" },
    { variety_name: "Mutton Pepper Fry", short_description: "Spicy dry roast with curry leaves" },
    { variety_name: "Mutton Kola Urundai", short_description: "Spiced minced meat balls" },
  ],
  "egg curry": [
    { variety_name: "Egg Masala", short_description: "Hard boiled eggs in thick spicy gravy" },
    { variety_name: "Egg Roast", short_description: "Kerala style onion tomato masala" },
    { variety_name: "Egg Korma", short_description: "Creamy coconut cashew gravy" },
    { variety_name: "Chettinad Egg Curry", short_description: "Spicy aromatic gravy" },
  ],
  prawns: [
    { variety_name: "Prawn Masala", short_description: "Thick spicy gravy with onions and tomatoes" },
    { variety_name: "Prawn Fry", short_description: "Crispy fried prawns with spices" },
    { variety_name: "Prawn Ghee Roast", short_description: "Mangalorean style tangy and spicy roast" },
    { variety_name: "Chilli Prawns", short_description: "Indo-Chinese spicy starter" },
    { variety_name: "Garlic Butter Prawns", short_description: "Sautéed in rich garlic butter sauce" },
    { variety_name: "Malabar Prawn Curry", short_description: "Coconut rich Kerala curry" },
    { variety_name: "Prawn 65", short_description: "Deep fried spicy marinated prawns" },
  ],
  lobster: [
    { variety_name: "Lobster Thermidor", short_description: "Creamy cheesy French classic" },
    { variety_name: "Butter Garlic Lobster", short_description: "Simple grilled lobster with garlic butter" },
    { variety_name: "Lobster Masala", short_description: "Indian style spicy thick gravy" },
    { variety_name: "Tandoori Lobster", short_description: "Marinated in yogurt spices and grilled" },
    { variety_name: "Lobster Bisque", short_description: "Rich and creamy smooth soup" },
  ],
  pasta: [
    { variety_name: "White Sauce Pasta", short_description: "Creamy Béchamel cheesy sauce" },
    { variety_name: "Red Sauce Pasta", short_description: "Tangy Arrabbiata tomato sauce" },
    { variety_name: "Pink Sauce Pasta", short_description: "Mix of creamy and tangy sauces" },
    { variety_name: "Pesto Pasta", short_description: "Fresh basil and nut based green sauce" },
    { variety_name: "Aglo e Olio", short_description: "Olive oil, garlic and chilli flakes" },
  ],
  "south indian": [
    { variety_name: "Masala Dosa", short_description: "Crispy crepe with potato filling" },
    { variety_name: "Idli Sambar", short_description: "Steamed rice cakes with lentil soup" },
    { variety_name: "Medu Vada", short_description: "Crispy savory lentil donuts" },
    { variety_name: "Uttapam", short_description: "Thick savory pancake with toppings" },
    { variety_name: "Pongal", short_description: "Comforting rice and lentil porridge" },
  ]
};

export function getFallbackVarieties(dishName: string): DishVarietyData[] | null {
  const normalizedName = dishName.toLowerCase().trim();

  // Direct match
  if (fallbackVarieties[normalizedName]) {
    return fallbackVarieties[normalizedName];
  }

  // Clean up search term (remove plural 's', 'recipe', etc)
  const cleanTerm = normalizedName.replace(/s$/, '').replace(/ recipes?$/, '');

  // Partial match - check if any key contains the search term or vice versa
  for (const key of Object.keys(fallbackVarieties)) {
    if (key.includes(cleanTerm) || cleanTerm.includes(key)) {
      return fallbackVarieties[key];
    }
  }

  return null;
}

// Helper for strict text normalization
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ');   // Collapse spaces
}

export function findStrictMatch(query: string): DishVarietyData[] | null {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  // Get all available keys
  const keys = Object.keys(fallbackVarieties);

  // Scoring matches
  let bestMatchKey: string | null = null;
  let maxScore = 0;

  for (const key of keys) {
    const normalizedKey = normalizeText(key);

    // Create regex for full word matching
    const keyRegex = new RegExp(`\\b${normalizedKey}\\b`, 'i');
    const queryRegex = new RegExp(`\\b${normalizedQuery}\\b`, 'i');

    const keyInQuery = keyRegex.test(normalizedQuery);
    const queryInKey = queryRegex.test(normalizedKey);

    let score = 0;

    if (normalizedQuery === normalizedKey) {
      score = 100; // Exact match
    } else if (keyInQuery) {
      // Specificity Match (User: "Prawn Biryani", Key: "Biryani") -> Key is inside Query? No.
      // User: "Fresh Prawn Biryani", Key: "Prawn Biryani" -> Key is inside Query.
      score = 50 + normalizedKey.length;
    } else if (queryInKey) {
      // Generic Match
      score = 10 + normalizedQuery.length;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatchKey = key;
    }
  }

  // Double check singular version if no match found
  if (!bestMatchKey) {
    const singularQuery = normalizedQuery.replace(/s$/, '');
    if (singularQuery !== normalizedQuery) {
      // Simple check for singular key
      if (fallbackVarieties[singularQuery]) {
        bestMatchKey = singularQuery;
      }
    }
  }

  if (bestMatchKey) {
    return fallbackVarieties[bestMatchKey];
  }

  return null;
}
