export const getProducts = () => [
  {
    id: "OLJCESPC7Z",
    name: "Vintage Typewriter",
    description: "This typewriter looks good in your living room.",
    picture: "/static/img/products/typewriter.jpg",
    price_usd: {
      currency_code: "USD",
      units: 67,
      nanos: 990000000,
    },
    categories: ["Vintage"],
  },
  {
    id: "66VCHSJNUP",
    name: "Vintage Camera Lens",
    description:
      "You won't have a camera to use it and it probably doesn't work anyway.",
    picture: "/static/img/products/camera-lens.jpg",
    price_usd: {
      currency_code: "USD",
      units: 12,
      nanos: 490000000,
    },
    categories: ["Photography", "Vintage"],
  },
  {
    id: "1YMWWN1N4O",
    name: "Home Barista Kit",
    description:
      "Always wanted to brew coffee with Chemex and Aeropress at home?",
    picture: "/static/img/products/barista-kit.jpg",
    price_usd: {
      currency_code: "USD",
      units: 124,
    },
    categories: ["Cookware"],
  },
  {
    id: "L9ECAV7KIM",
    name: "Terrarium",
    description:
      "This terrarium will looks great in your white painted living room.",
    picture: "/static/img/products/terrarium.jpg",
    price_usd: {
      currency_code: "USD",
      units: 36,
      nanos: 450000000,
    },
    categories: ["Gardening"],
  },
  {
    id: "2ZYFJ3GM2N",
    name: "Film Camera",
    description:
      "This camera looks like it's a film camera, but it's actually digital.",
    picture: "/static/img/products/film-camera.jpg",
    price_usd: {
      currency_code: "USD",
      units: 2245,
    },
    categories: ["Photography", "Vintage"],
  },
  {
    id: "0PUK6V6EV0",
    name: "Vintage Record Player",
    description: "It still works.",
    picture: "/static/img/products/record-player.jpg",
    price_usd: {
      currency_code: "USD",
      units: 65,
      nanos: 500000000,
    },
    categories: ["Music", "Vintage"],
  },
  {
    id: "LS4PSXUNUM",
    name: "Metal Camping Mug",
    description:
      "You probably don't go camping that often but this is better than plastic cups.",
    picture: "/static/img/products/camp-mug.jpg",
    price_usd: {
      currency_code: "USD",
      units: 24,
      nanos: 330000000,
    },
    categories: ["Cookware"],
  },
  {
    id: "9SIQT8TOJO",
    name: "City Bike",
    description:
      "This single gear bike probably cannot climb the hills of San Francisco.",
    picture: "/static/img/products/city-bike.jpg",
    price_usd: {
      currency_code: "USD",
      units: 789,
      nanos: 500000000,
    },
    categories: ["Cycling"],
  },
  {
    id: "6E92ZMYYFZ",
    name: "Air Plant",
    description:
      "Have you ever wondered whether air plants need water? Buy one and figure out.",
    picture: "/static/img/products/air-plant.jpg",
    price_usd: {
      currency_code: "USD",
      units: 12,
      nanos: 300000000,
    },
    categories: ["Gardening"],
  },
];

export const getProduct = (productId) => {
  const products = getProducts();
  return products.find((product) => product.id === productId);
};

export const getRecommendedProducts = (productId) => {
  const products = getProducts();
  const recommendedProducts = products.filter(
    (product) => product.id !== productId
  );
  return recommendedProducts.sort(() => Math.random() - Math.random());
};
