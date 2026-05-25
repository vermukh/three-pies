export type Category = "pies" | "baklava" | "drinks";
export type Filling = "all" | "meat" | "cheese" | "lean" | "sweet";

export interface Product {
  id: string;
  name: string;
  nativeName: string;
  description: string;
  ingredients: string;
  allergens: string;
  category: Category;
  // Dessert classification is independent of catalog categories and filters.
  isDessert: boolean;
  filters: Filling[];
  price: number;
  weight: string;
  image: number;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "cheese",
    isDessert: false,
    name: "С осетинским сыром",
    nativeName: "Уалибах",
    description: "Нежный осетинский сыр в тонком румяном тесте",
    ingredients:
      "Осетинский сыр, пшеничная мука, вода, молоко, сливочное масло, дрожжи, соль",
    allergens: "Глютен, молоко",
    category: "pies",
    filters: ["cheese"],
    price: 900,
    weight: "900 г",
    image: 0,
    badge: "Любимая классика",
  },
  {
    id: "beef",
    isDessert: false,
    name: "С говядиной",
    nativeName: "Фыдджын",
    description: "Сочная говядина, ароматные специи и ничего лишнего",
    ingredients:
      "Говядина, репчатый лук, чеснок, пшеничная мука, вода, сливочное масло, соль, специи",
    allergens: "Глютен, молоко",
    category: "pies",
    filters: ["meat"],
    price: 900,
    weight: "900 г",
    image: 1,
    badge: "Выбор покупателей",
  },
  {
    id: "herbs",
    isDessert: false,
    name: "С сыром и зеленью",
    nativeName: "Вкус свежести",
    description: "Осетинский сыр, укроп, петрушка и зелёный лук",
    ingredients:
      "Осетинский сыр, укроп, петрушка, зелёный лук, пшеничная мука, молоко, сливочное масло, дрожжи, соль",
    allergens: "Глютен, молоко",
    category: "pies",
    filters: ["cheese"],
    price: 900,
    weight: "900 г",
    image: 2,
  },
  {
    id: "potato",
    isDessert: false,
    name: "С картофелем и сыром",
    nativeName: "Картофджын",
    description: "Мягкий картофель и осетинский сыр в тонком тесте",
    ingredients:
      "Картофель, осетинский сыр, пшеничная мука, молоко, сливочное масло, дрожжи, соль",
    allergens: "Глютен, молоко",
    category: "pies",
    filters: ["cheese"],
    price: 900,
    weight: "900 г",
    image: 3,
  },
  {
    id: "cabbage",
    isDessert: false,
    name: "С капустой",
    nativeName: "Кабускаджын",
    description: "Томлёная капуста со специями в тонком золотистом тесте",
    ingredients:
      "Белокочанная капуста, репчатый лук, пшеничная мука, вода, растительное масло, дрожжи, соль, специи",
    allergens: "Глютен",
    category: "pies",
    filters: ["lean"],
    price: 900,
    weight: "900 г",
    image: 4,
    badge: "Постный",
  },
  {
    id: "apple",
    isDessert: true,
    name: "С яблоком и корицей",
    nativeName: "Фаткъуыджын",
    description: "Сочные яблоки с корицей в тонком тесте",
    ingredients:
      "Яблоки, корица, сахар, пшеничная мука, вода, сливочное масло, дрожжи, соль",
    allergens: "Глютен, молоко",
    category: "pies",
    filters: ["sweet"],
    price: 900,
    weight: "900 г",
    image: 5,
  },
  {
    id: "baklava",
    isDessert: true,
    name: "Пахлава с грецким орехом",
    nativeName: "Ореховая пахлава",
    description:
      "Тонкие слои теста, грецкий орех и нежный аромат лимонной цедры",
    ingredients:
      "Пшеничная мука, грецкие орехи, сливочное масло, сахар, мёд, яйца, цедра лимона",
    allergens: "Глютен, молоко, яйца, орехи, мёд",
    category: "baklava",
    filters: [],
    price: 1200,
    weight: "1 350 г",
    image: 6,
    badge: "Для всей семьи",
  },
  {
    id: "baklava-mini",
    isDessert: true,
    name: "Пахлава мини",
    nativeName: "В небольшой коробке",
    description: "Та самая ореховая пахлава в небольшой коробке",
    ingredients:
      "Пшеничная мука, грецкие орехи, сливочное масло, сахар, мёд, яйца, цедра лимона",
    allergens: "Глютен, молоко, яйца, орехи, мёд",
    category: "baklava",
    filters: [],
    price: 900,
    weight: "850 г",
    image: 6,
  },
  {
    id: "mors",
    isDessert: false,
    name: "Клюквенный морс",
    nativeName: "Ягодный и освежающий",
    description: "Насыщенный вкус клюквы с приятной кислинкой",
    ingredients: "Вода, клюква, сахар",
    allergens: "Нет в составе",
    category: "drinks",
    filters: [],
    price: 250,
    weight: "1 л",
    image: 7,
  },
  {
    id: "water",
    isDessert: false,
    name: "Вода без газа",
    nativeName: "Чистая и прохладная",
    description: "Питьевая негазированная вода к вашему заказу",
    ingredients: "Питьевая вода",
    allergens: "Нет в составе",
    category: "drinks",
    filters: [],
    price: 100,
    weight: "500 мл",
    image: 8,
  },
];

export const categories: { id: Category; label: string }[] = [
  { id: "pies", label: "Осетинские пироги" },
  { id: "baklava", label: "Пахлава" },
  { id: "drinks", label: "Напитки" },
];

export const fillings: { id: Filling; label: string }[] = [
  { id: "all", label: "Все пироги" },
  { id: "meat", label: "Мясные" },
  { id: "cheese", label: "Сырные" },
  { id: "lean", label: "Постные" },
  { id: "sweet", label: "Сладкие" },
];

export const money = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";
export const CART_KEY = "three-pies:cart:v1";
export type Cart = Record<string, number>;

export function getCartSummary(cart: Cart) {
  const items = products.filter((product) => cart[product.id] > 0);
  const total = items.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );
  const count = items.reduce((sum, product) => sum + cart[product.id], 0);
  const pieCount = items.reduce(
    (sum, product) =>
      sum + (product.category === "pies" ? cart[product.id] : 0),
    0,
  );
  const hasFreeDelivery = pieCount >= 3;
  return {
    items,
    total,
    count,
    hasDessert: items.some((product) => product.isDessert),
    hasFreeDelivery,
    deliveryPrice: hasFreeDelivery ? 0 : 250,
  };
}

export function readCart(): Cart {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored))
      return {};
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([id, quantity]) =>
          products.some((product) => product.id === id) &&
          Number.isInteger(quantity) &&
          quantity > 0 &&
          quantity <= 99,
      ),
    );
  } catch {
    return {};
  }
}
