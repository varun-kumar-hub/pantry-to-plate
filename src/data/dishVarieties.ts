export interface DishVarietyData {
  variety_name: string;
  short_description: string;
}

export const fallbackVarieties: Record<string, DishVarietyData[]> = {
  biryani: [
    { variety_name: "Hyderabadi Dum Biryani", short_description: "Slow-cooked layered rice with aromatic spices and tender meat" },
    { variety_name: "Lucknowi Biryani", short_description: "Awadhi-style biryani with subtle flavors and saffron" },
    { variety_name: "Kolkata Biryani", short_description: "Bengali biryani with potatoes and eggs" },
    { variety_name: "Malabar Biryani", short_description: "Kerala-style biryani with coconut and curry leaves" },
    { variety_name: "Ambur Biryani", short_description: "Tamil Nadu's famous tangy and spicy biryani" },
    { variety_name: "Dindigul Biryani", short_description: "Thalappakatti-style with short grain rice" },
  ],
  "mutton biryani": [
    { variety_name: "Hyderabadi Mutton Biryani", short_description: "Classic dum-style with tender goat meat and basmati" },
    { variety_name: "Lucknowi Mutton Biryani", short_description: "Awadhi pakki biryani with aromatic spices" },
    { variety_name: "Kolkata Mutton Biryani", short_description: "Bengali-style with potatoes and light spices" },
    { variety_name: "Ambur Mutton Biryani", short_description: "South Indian tangy mutton biryani" },
    { variety_name: "Bhatkali Mutton Biryani", short_description: "Coastal Karnataka style with green chilies" },
    { variety_name: "Memoni Mutton Biryani", short_description: "Sindhi-style extremely spicy biryani" },
  ],
  "chicken biryani": [
    { variety_name: "Hyderabadi Chicken Biryani", short_description: "Dum-cooked layered chicken and rice" },
    { variety_name: "Lucknowi Chicken Biryani", short_description: "Fragrant Awadhi-style chicken biryani" },
    { variety_name: "Thalassery Chicken Biryani", short_description: "Kerala Malabar biryani with khyma rice" },
    { variety_name: "Chettinad Chicken Biryani", short_description: "Spicy Tamil Nadu style with whole spices" },
    { variety_name: "Mughlai Chicken Biryani", short_description: "Rich and creamy North Indian style" },
    { variety_name: "Calcutta Chicken Biryani", short_description: "Bengali biryani with boiled eggs" },
  ],
  pizza: [
    { variety_name: "Margherita Pizza", short_description: "Classic Italian with tomato, mozzarella and basil" },
    { variety_name: "Pepperoni Pizza", short_description: "American favorite with spicy pepperoni slices" },
    { variety_name: "Neapolitan Pizza", short_description: "Authentic Naples-style wood-fired pizza" },
    { variety_name: "Sicilian Pizza", short_description: "Thick crust rectangular pizza" },
    { variety_name: "Chicago Deep Dish", short_description: "Deep pan pizza with chunky tomato sauce" },
    { variety_name: "New York Style Pizza", short_description: "Large thin slices perfect for folding" },
  ],
  pasta: [
    { variety_name: "Spaghetti Carbonara", short_description: "Creamy egg-based sauce with pancetta" },
    { variety_name: "Fettuccine Alfredo", short_description: "Rich butter and parmesan cream sauce" },
    { variety_name: "Penne Arrabbiata", short_description: "Spicy tomato sauce with red chilies" },
    { variety_name: "Lasagna Bolognese", short_description: "Layered pasta with meat sauce and béchamel" },
    { variety_name: "Pesto Pasta", short_description: "Fresh basil, pine nuts and parmesan sauce" },
    { variety_name: "Aglio e Olio", short_description: "Simple garlic and olive oil with chili flakes" },
  ],
  curry: [
    { variety_name: "Butter Chicken", short_description: "Creamy tomato-based North Indian curry" },
    { variety_name: "Chicken Tikka Masala", short_description: "Grilled chicken in spiced tomato gravy" },
    { variety_name: "Palak Paneer", short_description: "Cottage cheese in creamy spinach sauce" },
    { variety_name: "Rogan Josh", short_description: "Kashmiri-style aromatic lamb curry" },
    { variety_name: "Thai Green Curry", short_description: "Coconut milk curry with lemongrass" },
    { variety_name: "Gongura Chicken", short_description: "Telugu-style sorrel leaf curry" },
  ],
  burger: [
    { variety_name: "Classic Cheeseburger", short_description: "Beef patty with American cheese" },
    { variety_name: "Bacon Burger", short_description: "Loaded with crispy bacon strips" },
    { variety_name: "Mushroom Swiss Burger", short_description: "Sautéed mushrooms and Swiss cheese" },
    { variety_name: "BBQ Burger", short_description: "Smoky barbecue sauce with onion rings" },
    { variety_name: "Veggie Burger", short_description: "Plant-based patty with fresh toppings" },
    { variety_name: "Double Smash Burger", short_description: "Two thin crispy-edged patties" },
  ],
  tacos: [
    { variety_name: "Carnitas Tacos", short_description: "Slow-cooked pulled pork" },
    { variety_name: "Al Pastor Tacos", short_description: "Marinated pork with pineapple" },
    { variety_name: "Fish Tacos", short_description: "Baja-style with cabbage slaw" },
    { variety_name: "Birria Tacos", short_description: "Braised beef with consommé for dipping" },
    { variety_name: "Chicken Tinga Tacos", short_description: "Shredded chicken in chipotle sauce" },
    { variety_name: "Carne Asada Tacos", short_description: "Grilled steak with fresh cilantro" },
  ],
  dosa: [
    { variety_name: "Masala Dosa", short_description: "Crispy crepe with spiced potato filling" },
    { variety_name: "Mysore Masala Dosa", short_description: "With red chutney spread and potato" },
    { variety_name: "Rava Dosa", short_description: "Crispy semolina dosa with onions" },
    { variety_name: "Paper Dosa", short_description: "Extra thin and crispy plain dosa" },
    { variety_name: "Ghee Roast Dosa", short_description: "Golden crispy dosa roasted in ghee" },
    { variety_name: "Pesarattu", short_description: "Telugu green gram dosa" },
  ],
  idli: [
    { variety_name: "Plain Idli", short_description: "Soft steamed rice cakes" },
    { variety_name: "Rava Idli", short_description: "Semolina-based fluffy idlis" },
    { variety_name: "Kanchipuram Idli", short_description: "Spiced with pepper and cumin" },
    { variety_name: "Thatte Idli", short_description: "Large plate-shaped Karnataka idli" },
    { variety_name: "Button Idli", short_description: "Mini idlis perfect for sambar" },
    { variety_name: "Stuffed Idli", short_description: "Filled with spiced vegetables" },
  ],
  pulao: [
    { variety_name: "Vegetable Pulao", short_description: "Fragrant rice with mixed vegetables" },
    { variety_name: "Tomato Rice", short_description: "Tangy South Indian tomato pulao" },
    { variety_name: "Coconut Rice", short_description: "Rice tempered with coconut and curry leaves" },
    { variety_name: "Lemon Rice", short_description: "Tangy rice with peanuts and lemon" },
    { variety_name: "Tamarind Rice", short_description: "Pulihora - Telugu tangy rice" },
    { variety_name: "Curd Rice", short_description: "Cool yogurt rice with tempering" },
  ],
};

export function getFallbackVarieties(dishName: string): DishVarietyData[] | null {
  const normalizedName = dishName.toLowerCase().trim();
  
  // Direct match
  if (fallbackVarieties[normalizedName]) {
    return fallbackVarieties[normalizedName];
  }
  
  // Partial match - check if any key contains the search term or vice versa
  for (const key of Object.keys(fallbackVarieties)) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return fallbackVarieties[key];
    }
  }
  
  return null;
}
