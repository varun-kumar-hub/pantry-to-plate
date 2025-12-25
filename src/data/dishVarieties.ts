export interface DishVarietyData {
  variety_name: string;
  short_description: string;
  tags?: string[];
  image_url?: string;
  diet?: 'veg' | 'non-veg';
}

export const fallbackVarieties: Record<string, DishVarietyData[]> = {
  biryani: [
    { variety_name: "Hyderabadi Chicken Biryani", short_description: "World-famous dum cooked spicy biryani", diet: 'non-veg' },
    { variety_name: "Lucknowi Chicken Biryani", short_description: "Aromatic Awadhi style with mild spices", diet: 'non-veg' },
    { variety_name: "Kolkata Chicken Biryani", short_description: "Bengali style with potato and egg", diet: 'non-veg' },
    { variety_name: "Ambur Chicken Biryani", short_description: "Tangy and spicy Tamil Nadu style", diet: 'non-veg' },
    { variety_name: "Thalassery Chicken Biryani", short_description: "Kerala Malabar style with Jeerakasala rice", diet: 'non-veg' },
    { variety_name: "Dindigul Chicken Biryani", short_description: "Flavorful Seeraga Samba rice biryani", diet: 'non-veg' },
    { variety_name: "Donne Chicken Biryani", short_description: "Classic Karnataka green masala biryani", diet: 'non-veg' },
    { variety_name: "Andhra Spicy Chicken Biryani", short_description: "Fiery hot coastal Andhra style", diet: 'non-veg' },
  ],
  "mutton biryani": [
    { variety_name: "Hyderabadi Mutton Biryani", short_description: "The King of Biryanis - slow cooked dum style", diet: 'non-veg' },
    { variety_name: "Lucknowi Mutton Biryani", short_description: "Royal Awadhi flavor with saffron and rose water", diet: 'non-veg' },
    { variety_name: "Thalassery Mutton Biryani", short_description: "Rich Malabar flavors with ghee", diet: 'non-veg' },
    { variety_name: "Ambur Mutton Biryani", short_description: "Arcot style spicy mutton biryani", diet: 'non-veg' },
    { variety_name: "Kashmiri Yakhni Biryani", short_description: "Mild yogurt-based saffron biryani", diet: 'non-veg' },
    { variety_name: "Andhra Mutton Biryani", short_description: "Spicy gongura or fry piece biryani", diet: 'non-veg' },
  ],
  "prawn biryani": [
    { variety_name: "Malabar Prawn Biryani", short_description: "Coastal Kerala style with aromatic spices", diet: 'non-veg' },
    { variety_name: "Andhra Prawn Biryani", short_description: "Spicy masala rich prawn biryani", diet: 'non-veg' },
    { variety_name: "Prawn Dum Biryani", short_description: "Layered rice and prawn masala cooked on dum", diet: 'non-veg' },
    { variety_name: "Goan Prawn Biryani", short_description: "Tangy and spicy Goan fusion style", diet: 'non-veg' },
    { variety_name: "Chettinad Prawn Biryani", short_description: "Peppery and aromatic Tamil style", diet: 'non-veg' },
  ],
  "veg biryani": [
    { variety_name: "Hyderabadi Veg Biryani", short_description: "Spicy mixed vegetable dum biryani", diet: 'veg' },
    { variety_name: "Paneer Biryani", short_description: "Basmati rice layered with marinated paneer", diet: 'veg' },
    { variety_name: "Mushroom Biryani", short_description: "Simply delicious earthy flavors", diet: 'veg' },
    { variety_name: "Soya Chunk Biryani", short_description: "Protein-rich meal maker biryani", diet: 'veg' },
    { variety_name: "Chettinad Veg Biryani", short_description: "Spicy roasted spice flavor", diet: 'veg' },
    { variety_name: "Kashmiri Veg Biryani", short_description: "Sweet and savory with dry fruits", diet: 'veg' },
  ],
  "egg biryani": [
    { variety_name: "Hyderabadi Egg Biryani", short_description: "Spicy masala coated eggs in aromatic rice", diet: 'non-veg' },
    { variety_name: "Kolkata Egg Biryani", short_description: "Classic potato and egg combination", diet: 'non-veg' },
    { variety_name: "Andhra Egg Biryani", short_description: "Spicy roasted egg masala biryani", diet: 'non-veg' },
    { variety_name: "Street-style Egg Biryani", short_description: "Quick tawa fried spicy rice", diet: 'non-veg' },
  ],
  pizza: [
    { variety_name: "Margherita Pizza", short_description: "Classic tomato, mozzarella and basil", diet: 'veg' },
    { variety_name: "Farmhouse Pizza", short_description: "Loaded with onion, capsicum, tomato and mushroom", diet: 'veg' },
    { variety_name: "Paneer Tikka Pizza", short_description: "Indian fusion with marinated paneer", diet: 'veg' },
    { variety_name: "Chicken Pepperoni Pizza", short_description: "Spicy chicken sausage slices", diet: 'non-veg' },
    { variety_name: "BBQ Chicken Pizza", short_description: "Smoky barbecue sauce with grilled chicken", diet: 'non-veg' },
    { variety_name: "Peri Peri Chicken Pizza", short_description: "Spicy African bird's eye chili flavor", diet: 'non-veg' },
    { variety_name: "Tandoori Veg Pizza", short_description: "Desi style roasted vegetable toppings", diet: 'veg' },
  ],
  burger: [
    { variety_name: "Classic Veg Burger", short_description: "Crispy vegetable patty with mayo", diet: 'veg' },
    { variety_name: "McAloo Tikki Style", short_description: "Potato and pea spiced patty", diet: 'veg' },
    { variety_name: "Crispy Chicken Burger", short_description: "Fried chicken fillet with lettuce", diet: 'non-veg' },
    { variety_name: "Grilled Chicken Burger", short_description: "Healthy grilled breast with veggies", diet: 'non-veg' },
    { variety_name: "Mutton Burger", short_description: "Juicy minced lamb patty", diet: 'non-veg' },
    { variety_name: "Paneer Burger", short_description: "Crispy pani patty with spicy sauce", diet: 'veg' },
  ],
  curry: [
    { variety_name: "Butter Chicken", short_description: "Creamy tomato buttery gravy (Makhani)", diet: 'non-veg' },
    { variety_name: "Chicken Chettinad", short_description: "Spicy roasted coconut and spice gravy", diet: 'non-veg' },
    { variety_name: "North Indian Chicken Curry", short_description: "Classic onion tomato gravy", diet: 'non-veg' },
    { variety_name: "Rogan Josh", short_description: "Aromatic Kashmiri mutton curry", diet: 'non-veg' },
    { variety_name: "Mutton Korma", short_description: "Rich Mughlai creamy mutton gravy", diet: 'non-veg' },
    { variety_name: "Palak Paneer", short_description: "Healthy spinach gravy with paneer cubes", diet: 'veg' },
    { variety_name: "Andhra Chicken Curry", short_description: "Spicy red chili based gravy (Kodi Kura)", diet: 'non-veg' },
    { variety_name: "Dal Makhani", short_description: "Slow cooked black lentils with cream", diet: 'veg' },
    { variety_name: "Chole Masala", short_description: "Spicy chickpea curry North Indian style", diet: 'veg' },
  ],
  "fish curry": [
    { variety_name: "Kerala Fish Curry", short_description: "Tangy coconut and kokum curry", diet: 'non-veg' },
    { variety_name: "Goan Fish Curry", short_description: "Coconut milk based sour curry", diet: 'non-veg' },
    { variety_name: "Bengali Fish Curry", short_description: "Mustard oil based Macher Jhol", diet: 'non-veg' },
    { variety_name: "Fish Molee", short_description: "Mild coconut milk stew from Kerala", diet: 'non-veg' },
    { variety_name: "Chettinad Fish Curry", short_description: "Spicy roasted masala fish gravy", diet: 'non-veg' },
    { variety_name: "Andhra Fish Pulusu", short_description: "Tangy tamarind based spicy fish stew", diet: 'non-veg' },
  ],
  "chicken curry": [
    { variety_name: "Butter Chicken", short_description: "Creamy tomato buttery gravy (Makhani)", diet: 'non-veg' },
    { variety_name: "Chicken Tikka Masala", short_description: "Grilled chicken in spiced tomato gravy", diet: 'non-veg' },
    { variety_name: "Chicken Kolhapuri", short_description: "Fiery Maharashtrian style spicy curry", diet: 'non-veg' },
    { variety_name: "Gongura Chicken", short_description: "Tangy sorrel leaf chicken curry", diet: 'non-veg' },
  ],
  "fry": [
    { variety_name: "Chicken 65", short_description: "Spicy deep fried chicken chunks", diet: 'non-veg' },
    { variety_name: "Prawn Fry", short_description: "Crispy coated fried prawns", diet: 'non-veg' },
    { variety_name: "Fish Fry", short_description: "Tawa grilled marinated fish slices", diet: 'non-veg' },
    { variety_name: "Mutton Chukka", short_description: "Dry roasted spicy mutton chunks", diet: 'non-veg' },
    { variety_name: "Apollo Fish", short_description: "Hyderabadi style spicy stir fried fish", diet: 'non-veg' },
    { variety_name: "Prawn Ghee Roast", short_description: "Mangalorean tangy spicy roast", diet: 'non-veg' },
  ],
  "semi gravy": [
    { variety_name: "Chilli Chicken", short_description: "Indo-Chinese spicy semi-dry chicken", diet: 'non-veg' },
    { variety_name: "Chicken Manchurian", short_description: "Fried chicken in tangy soy sauce", diet: 'non-veg' },
    { variety_name: "Pepper Chicken", short_description: "Dry chicken roast with black pepper", diet: 'non-veg' },
  ],
  "veg curry": [
    { variety_name: "Paneer Butter Masala", short_description: "Rich cashew tomato gravy with cottage cheese", diet: 'veg' },
    { variety_name: "Kadai Vegetable", short_description: "Mixed veggies in spicy tomato gravy", diet: 'veg' },
    { variety_name: "Aloo Gobi", short_description: "Potato and cauliflower dry curry", diet: 'veg' },
    { variety_name: "Malai Kofta", short_description: "Fried dumplings in rich white gravy", diet: 'veg' },
    { variety_name: "Palak Paneer", short_description: "Spinach smooth gravy with paneer", diet: 'veg' },
    { variety_name: "Veg Kolhapuri", short_description: "Spicy Maharashtrian mixed veg curry", diet: 'veg' },
    { variety_name: "Mushroom Masala", short_description: "Spicy onion tomato gravy with mushrooms", diet: 'veg' },
  ],
  "brinjal": [
    { variety_name: "Gutti Vankaya Curry", short_description: "Andhra special stuffed brinjal curry", image_url: "/gutti-vankaya.png", diet: 'veg' },
    { variety_name: "Baingan Bharta", short_description: "Smoky roasted mashed eggplant curry", diet: 'veg' },
    { variety_name: "Brinjal Fry", short_description: "Crispy sliced eggplant fry", diet: 'veg' },
    { variety_name: "Vankaya Pulusu", short_description: "Tangy tamarind stew with brinjal", diet: 'veg' },
    { variety_name: "Aloo Baingan", short_description: "Potato and brinjal dry stir fry", diet: 'veg' },
    { variety_name: "Ennai Kathirikkai", short_description: "Tamil style oily stuffed brinjal gravy", diet: 'veg' },
  ],
  "potato": [
    { variety_name: "Aloo Fry", short_description: "Simple crispy potato fry", diet: 'veg' },
    { variety_name: "Dum Aloo", short_description: "Baby potatoes in spicy yogurt gravy", diet: 'veg' },
    { variety_name: "Jeera Aloo", short_description: "Cumin tempered dry potato dish", diet: 'veg' },
    { variety_name: "Aloo Matar", short_description: "Potato and peas in tomato gravy", diet: 'veg' },
    { variety_name: "Honey Chilli Potato", short_description: "Crispy fried potatoes in sweet spicy sauce", diet: 'veg' },
  ],
  "veg fry": [
    { variety_name: "Aloo Fry", short_description: "Crispy potato fry", diet: 'veg' },
    { variety_name: "Gobi 65", short_description: "Spicy fried cauliflower florets", diet: 'veg' },
    { variety_name: "Paneer 65", short_description: "Spicy deep fried paneer cubes", diet: 'veg' },
    { variety_name: "Mushroom Fry", short_description: "Pepper roasted mushrooms", diet: 'veg' },
    { variety_name: "Crispy Corn", short_description: "Fried sweet corn with spices", diet: 'veg' },
    { variety_name: "Baby Corn Manchurian", short_description: "Batter fried baby corn in sauce", diet: 'veg' },
  ],
  "prawn curry": [
    { variety_name: "Prawn Masala", short_description: "Thick spicy gravy with onions and tomatoes", diet: 'non-veg' },
    { variety_name: "Malabar Prawn Curry", short_description: "Coconut rich Kerala curry with raw mango", diet: 'non-veg' },
    { variety_name: "Goan Prawn Curry", short_description: "Tangy coconut and spice blend", diet: 'non-veg' },
    { variety_name: "Andhra Prawn Curry", short_description: "Spicy red chili prawn masala", diet: 'non-veg' },
    { variety_name: "Chingri Malai Curry", short_description: "Bengali creamy coconut prawn curry", diet: 'non-veg' },
    { variety_name: "Chettinad Prawn Curry", short_description: "Aromatic peppery prawn gravy", diet: 'non-veg' },
  ],
  "chicken fry": [
    { variety_name: "Chicken 65", short_description: "Spicy deep fried chicken chunks", diet: 'non-veg' },
    { variety_name: "Pepper Chicken", short_description: "Dry chicken roast with black pepper", diet: 'non-veg' },
    { variety_name: "Chicken Ghee Roast", short_description: "Mangalorean tangy spicy roast", diet: 'non-veg' },
    { variety_name: "Chicken Sukka", short_description: "Dry coconut based chicken dish", diet: 'non-veg' },
  ],
  "fish fry": [
    { variety_name: "Apollo Fish", short_description: "Hyderabadi style spicy stir fried fish", diet: 'non-veg' },
    { variety_name: "Tawa Fish Fry", short_description: "Marinated slices grilled on pan", diet: 'non-veg' },
    { variety_name: "Rava Fish Fry", short_description: "Semolina coated crispy fry", diet: 'non-veg' },
  ],
  "mutton fry": [
    { variety_name: "Mutton Chukka", short_description: "Dry roasted spicy mutton chunks", diet: 'non-veg' },
    { variety_name: "Mutton Pepper Fry", short_description: "Spicy dry roast with curry leaves", diet: 'non-veg' },
    { variety_name: "Mutton Kola Urundai", short_description: "Spiced minced meat balls", diet: 'non-veg' },
  ],
  "egg curry": [
    { variety_name: "Egg Masala", short_description: "Hard boiled eggs in thick spicy gravy", diet: 'non-veg' },
    { variety_name: "Egg Roast", short_description: "Kerala style onion tomato masala", diet: 'non-veg' },
    { variety_name: "Egg Korma", short_description: "Creamy coconut cashew gravy", diet: 'non-veg' },
    { variety_name: "Chettinad Egg Curry", short_description: "Spicy aromatic gravy", diet: 'non-veg' },
  ],
  prawns: [
    { variety_name: "Prawn Masala", short_description: "Thick spicy gravy with onions and tomatoes", diet: 'non-veg' },
    { variety_name: "Prawn Fry", short_description: "Crispy fried prawns with spices", diet: 'non-veg' },
    { variety_name: "Prawn Ghee Roast", short_description: "Mangalorean style tangy and spicy roast", diet: 'non-veg' },
    { variety_name: "Chilli Prawns", short_description: "Indo-Chinese spicy starter", diet: 'non-veg' },
    { variety_name: "Garlic Butter Prawns", short_description: "Sautéed in rich garlic butter sauce", diet: 'non-veg' },
    { variety_name: "Malabar Prawn Curry", short_description: "Coconut rich Kerala curry", diet: 'non-veg' },
    { variety_name: "Prawn 65", short_description: "Deep fried spicy marinated prawns", diet: 'non-veg' },
  ],
  lobster: [
    { variety_name: "Lobster Thermidor", short_description: "Creamy cheesy French classic", diet: 'non-veg' },
    { variety_name: "Butter Garlic Lobster", short_description: "Simple grilled lobster with garlic butter", diet: 'non-veg' },
    { variety_name: "Lobster Masala", short_description: "Indian style spicy thick gravy", diet: 'non-veg' },
    { variety_name: "Tandoori Lobster", short_description: "Marinated in yogurt spices and grilled", diet: 'non-veg' },
    { variety_name: "Lobster Bisque", short_description: "Rich and creamy smooth soup", diet: 'non-veg' },
  ],
  pasta: [
    { variety_name: "White Sauce Pasta", short_description: "Creamy Béchamel cheesy sauce", diet: 'veg' },
    { variety_name: "Red Sauce Pasta", short_description: "Tangy Arrabbiata tomato sauce", diet: 'veg' },
    { variety_name: "Pink Sauce Pasta", short_description: "Mix of creamy and tangy sauces", diet: 'veg' },
    { variety_name: "Pesto Pasta", short_description: "Fresh basil and nut based green sauce", diet: 'veg' },
    { variety_name: "Aglo e Olio", short_description: "Olive oil, garlic and chilli flakes", diet: 'veg' },
  ],
  "south indian": [
    { variety_name: "Masala Dosa", short_description: "Crispy crepe with potato filling", diet: 'veg' },
    { variety_name: "Idli Sambar", short_description: "Steamed rice cakes with lentil soup", diet: 'veg' },
    { variety_name: "Medu Vada", short_description: "Crispy savory lentil donuts", diet: 'veg' },
    { variety_name: "Uttapam", short_description: "Thick savory pancake with toppings", diet: 'veg' },
    { variety_name: "Pongal", short_description: "Comforting rice and lentil porridge", diet: 'veg' },
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
