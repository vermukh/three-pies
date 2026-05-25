import { useEffect, useState } from "react";
import { Input, Textarea, Select } from "@three-pies/ui-kit";
import type { FormEvent } from "react";
import {
  CART_KEY,
  categories,
  fillings,
  getCartSummary,
  money,
  products,
  readCart,
} from "./data";
import type { Category, Filling, Product } from "./data";
import { Icon, Logo, Modal, ProductImage, Quantity } from "./components";

type Overlay =
  "cart" | "checkout" | "bundle" | "success" | "reviews" | "navigation" | null;
const reviews = [
  {
    name: "Наталья",
    date: "21 июня 2023",
    letter: "Н",
    text: "Здоровья Вашим рукам!!! Пироги обалденные, вкусные, сочные, много начинки, одним словом «Пальчики оближешь». Доставка вовремя. Однозначно, буду заказывать ещё. Рекомендую всем",
  },
  {
    name: "Александра",
    date: "23 февраля 2023",
    letter: "А",
    text: "Пироги очень вкусные, тесто тоненькое, начинки много. Привезли с пылу с жару. Спасибо, как дома)",
  },
  {
    name: "Карина",
    date: "9 августа 2022",
    letter: "К",
    text: "Это, пожалуй, одни из самых вкусных пирогов, что есть в Томске в доставках. Брала на день рождения в офис, угостить коллег, всем все пироги понравились. Доставка вовремя, всё горячее, сочное, много начинки",
  },
];

export default function App() {
  const [category, setCategory] = useState<Category>("pies");
  const [filling, setFilling] = useState<Filling>("all");
  const [cart, setCart] = useState(readCart);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [bundle, setBundle] = useState(["cheese", "beef", "herbs"]);
  const [delivery, setDelivery] = useState<"delivery" | "pickup">("delivery");
  const [orderTotal, setOrderTotal] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [checkoutDraft, setCheckoutDraft] = useState({
    name: "",
    phone: "",
    address: "",
    comment: "",
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const closeDesktopNavigation = () => {
      if (!media.matches && overlay === "navigation") setOverlay(null);
    };
    media.addEventListener("change", closeDesktopNavigation);
    return () => media.removeEventListener("change", closeDesktopNavigation);
  }, [overlay]);

  function navigateToSection(id: string) {
    setOverlay(null);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* Cart remains available in memory. */
    }
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const {
    items: cartItems,
    total,
    count,
    hasDessert,
    hasFreeDelivery,
    deliveryPrice: shippingPrice,
  } = getCartSummary(cart);
  const visibleProducts = products.filter(
    (product) =>
      product.category === category &&
      (category !== "pies" ||
        filling === "all" ||
        product.filters.includes(filling)),
  );
  const deliveryPrice = delivery === "delivery" ? shippingPrice : 0;
  const bundleFits = bundle.every(
    (id) => (cart[id] || 0) + bundle.filter((item) => item === id).length <= 99,
  );

  function updateQuantity(id: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(99, quantity);
      return next;
    });
  }

  function addProduct(product: Product) {
    if ((cart[product.id] || 0) >= 99) {
      setToast("В корзине уже 99 единиц этого товара");
      return;
    }
    setCart((current) => ({
      ...current,
      [product.id]: Math.min(99, (current[product.id] || 0) + 1),
    }));
    setToast(`${product.name} — в корзине`);
  }

  function selectCategory(next: Category) {
    setCategory(next);
    setFilling("all");
  }

  function addBundle() {
    if (!bundleFits) return;
    setCart((current) => {
      const next = { ...current };
      bundle.forEach((id) => {
        next[id] = Math.min(99, (next[id] || 0) + 1);
      });
      return next;
    });
    setOverlay("cart");
    setToast("Ваши три пирога добавлены в корзину");
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const digits = String(values.get("phone")).replace(/\D/g, "");
    if (!/^(?:7|8)\d{10}$/.test(digits)) {
      setPhoneError("Введите номер в формате +7 999 123-45-67");
      (
        event.currentTarget.elements.namedItem("phone") as HTMLInputElement
      )?.focus();
      return;
    }
    if (!cartItems.length) return;
    setPhoneError("");
    setOrderTotal(total + deliveryPrice);
    setCart({});
    setCheckoutDraft({ name: "", phone: "", address: "", comment: "" });
    setOverlay("success");
  }

  return (
    <>
      <div id="home" className="topbar">
        <div className="container topbar-inner">
          <span>
            <Icon name="pin" size={14} /> Томск{" "}
            <span className="topbar-separator">/</span> Осетинская пекарня
          </span>
          <span>
            Печём на заказ <span className="topbar-separator">·</span>{" "}
            9:00–20:00
          </span>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Logo caption="Томск · 9:00–20:00" />
          <nav aria-label="Главная навигация">
            <a className="nav-menu" href="#menu">
              Меню <Icon name="down" size={14} />
            </a>
            <a href="#about">О пекарне</a>
            <a href="#delivery">Доставка</a>
            <a href="#reviews">Отзывы</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <div className="header-actions">
            <a
              className="mobile-phone icon-button"
              href="tel:+79138208007"
              aria-label="Позвонить: 8 913 820-80-07"
            >
              <Icon name="phone" size={21} />
            </a>
            <button
              className="mobile-menu-button icon-button"
              aria-label="Открыть меню разделов"
              aria-haspopup="dialog"
              aria-expanded={overlay === "navigation"}
              onClick={() => setOverlay("navigation")}
            >
              <Icon name="menu" size={24} />
            </button>
            <a className="header-phone" href="tel:+79138208007">
              8 913 820-80-07<small>Заказы по телефону</small>
            </a>
            <button
              className="cart-button"
              onClick={() => setOverlay("cart")}
              aria-label={`Открыть корзину, товаров: ${count}, сумма: ${money(total)}`}
            >
              <Icon name="bag" size={19} />
              <span>{count ? money(total) : "Корзина"}</span>
              <span className="cart-count">{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-photo">
            <img
              src="/images/hero-pies.png"
              alt="Три румяных осетинских пирога с сыром и зеленью на деревянной доске"
              fetchPriority="high"
            />
          </div>
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">
                <span /> ОСЕТИНСКИЕ ТРАДИЦИИ В ТОМСКЕ
              </p>
              <h1 id="hero-title">
                Три пирога
                <br />
                <em>Много тепла</em>
              </h1>
              <p className="hero-description">
                Тонкое тесто и много начинки
                <br /> Печём осетинские пироги на заказ
                <br /> Доставляем по Томску и готовим к самовывозу
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#menu">
                  Выбрать пироги <Icon name="arrow" size={19} />
                </a>
                <button
                  className="text-button"
                  onClick={() => setOverlay("bundle")}
                >
                  Собрать три пирога <Icon name="arrow" size={18} />
                </button>
              </div>
            </div>
            <div className="hero-seal">
              <span>РУЧНАЯ РАБОТА</span>
              <Icon name="wheat" size={27} />
              <strong>
                Печём
                <br />
                после заказа
              </strong>
              <span>ПЕКАРНЯ «ТРИ ПИРОГА»</span>
            </div>
          </div>
        </section>
        <div className="ornament" aria-hidden="true" />
        <section className="benefits container" aria-label="О наших пирогах">
          <div>
            <Icon name="wheat" size={31} />
            <span>
              <strong>Тонкое тесто</strong>
              <small>И много-много начинки</small>
            </span>
          </div>
          <div>
            <Icon name="leaf" size={30} />
            <span>
              <strong>Простые ингредиенты</strong>
              <small>Сыр, мясо, овощи и фрукты</small>
            </span>
          </div>
          <div>
            <Icon name="flame" size={29} />
            <span>
              <strong>Из печи к вашему столу</strong>
              <small>Готовим после заказа</small>
            </span>
          </div>
          <div>
            <Icon name="heart" size={28} />
            <span>
              <strong>По осетинским традициям</strong>
              <small>Пироги ручной работы</small>
            </span>
          </div>
        </section>

        <section
          id="menu"
          className="menu-section container"
          aria-labelledby="menu-title"
        >
          <div className="section-heading">
            <div>
              <h2 id="menu-title">Что сегодня к столу?</h2>
            </div>
          </div>
          <div className="catalog-controls">
            <div className="category-row">
              <div className="categories" aria-label="Категории меню">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    onClick={(event) => {
                      selectCategory(item.id);
                      event.currentTarget.scrollIntoView({
                        block: "nearest",
                        inline: "nearest",
                      });
                    }}
                    className={category === item.id ? "active" : ""}
                    aria-pressed={category === item.id}
                  >
                    {item.id === "pies" ? (
                      <span className="category-pie" aria-hidden="true">
                        ◎
                      </span>
                    ) : item.id === "baklava" ? (
                      <span className="category-baklava" aria-hidden="true">
                        ◇
                      </span>
                    ) : (
                      <span aria-hidden="true">♧</span>
                    )}
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="menu-weight">
                {category === "pies"
                  ? "Большие пироги · 900 г"
                  : category === "baklava"
                    ? "Сладкое продолжение обеда"
                    : "Идеальная пара к пирогам"}
              </span>
            </div>
            <div className="filter-row">
              {category === "pies" ? (
                <div className="filters" aria-label="Начинка">
                  {fillings.map((item) => (
                    <button
                      key={item.id}
                      className={filling === item.id ? "active" : ""}
                      aria-pressed={filling === item.id}
                      onClick={(event) => {
                        setFilling(item.id);
                        event.currentTarget.scrollIntoView({
                          block: "nearest",
                          inline: "nearest",
                        });
                      }}
                    >
                      {item.id === "lean" && <Icon name="leaf" size={14} />}
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="category-description">
                  {category === "baklava"
                    ? "Пахлава с грецким орехом и мёдом"
                    : "Освежающие напитки для всей компании"}
                </span>
              )}
              <span className="product-count" aria-live="polite">
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1
                  ? "вариант"
                  : visibleProducts.length < 5
                    ? "варианта"
                    : "вариантов"}
              </span>
            </div>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="product-photo-button"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`Подробнее: ${product.name}`}
                >
                  <ProductImage product={product} />
                  {product.badge && (
                    <span
                      className={`product-badge ${product.filters.includes("lean") ? "badge-green" : ""}`}
                    >
                      {product.filters.includes("lean") && (
                        <Icon name="leaf" size={12} />
                      )}
                      {product.badge}
                    </span>
                  )}
                  <span className="photo-detail">
                    Подробнее <Icon name="arrow" size={15} />
                  </span>
                </button>
                <div className="product-info">
                  <span className="product-native">{product.nativeName}</span>
                  <button
                    className="product-title"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <h3>{product.name}</h3>
                  </button>
                  <p>{product.description}</p>
                  <span className="product-weight">
                    {product.weight}
                    {product.category === "pies" && " · 30 см"}
                  </span>
                  <div className="product-bottom">
                    <strong>{money(product.price)}</strong>
                    {cart[product.id] ? (
                      <Quantity
                        value={cart[product.id]}
                        name={product.name}
                        onChange={(value) => updateQuantity(product.id, value)}
                      />
                    ) : (
                      <button
                        className="add-button"
                        onClick={() => addProduct(product)}
                      >
                        В корзину <Icon name="plus" size={17} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="bundle-banner container"
          aria-labelledby="bundle-title"
        >
          <div className="bundle-art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="bundle-copy">
            <p className="eyebrow">АКЦИЯ «ТРИ ПИРОГА»</p>
            <h2 id="bundle-title">От трёх пирогов — доставка бесплатно</h2>
            <p>Выберите любые три пирога — начинки можно повторять</p>
          </div>
          <button
            className="button button-cream"
            onClick={() => setOverlay("bundle")}
          >
            Собрать свой набор <Icon name="arrow" size={18} />
          </button>
        </section>

        <section
          id="about"
          className="about-section container"
          aria-labelledby="about-title"
        >
          <div className="about-picture">
            <img
              src="/images/hero-pies.png"
              alt="Тонкое тесто и щедрая сырная начинка осетинского пирога"
              loading="lazy"
            />
            <span className="picture-caption">
              Тонкое тесто и много начинки
            </span>
          </div>
          <div className="about-copy">
            <p className="eyebrow">О ПЕКАРНЕ</p>
            <h2 id="about-title">
              Осетинские пироги
              <br />в Томске
            </h2>
            <p>
              Готовим осетинские пироги с сыром, мясом, овощами и сладкими
              начинками — каждый заказ отправляем в печь после оформления
            </p>
            <p>
              В «Трёх пирогах» следуем осетинским рецептам: тонко раскатываем
              тесто, кладём много начинки и каждый пирог лепим руками
            </p>
          </div>
        </section>

        <section id="delivery" className="delivery-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ДОСТАВКА И САМОВЫВОЗ</p>
                <h2>Как получить заказ</h2>
              </div>
              <a className="text-button" href="tel:+79138208007">
                Уточнить детали <Icon name="arrow" size={18} />
              </a>
            </div>
            <div className="delivery-grid">
              <article>
                <span className="delivery-icon">
                  <Icon name="truck" size={28} />
                </span>
                <h3>Доставим по Томску</h3>
                <p>
                  От трёх пирогов — бесплатно, для остальных заказов — 250 ₽
                  <br />
                  Можно выбрать разные начинки или несколько одинаковых пирогов
                </p>
              </article>
              <article>
                <span className="delivery-icon">
                  <Icon name="pin" size={28} />
                </span>
                <h3>Самовывоз готового заказа</h3>
                <p>
                  Заберите заказ по адресу:
                  <br />
                  Томск, ул. Озёрная, 3а
                </p>
              </article>
              <article>
                <span className="delivery-icon">
                  <Icon name="clock" size={28} />
                </span>
                <h3>Каждый день, 9:00–20:00</h3>
                <p>
                  Большой заказ или особый повод?
                  <br />
                  Позвоните, чтобы уточнить детали
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="reviews"
          className="reviews-section container"
          aria-labelledby="reviews-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">ОТЗЫВЫ</p>
              <h2 id="reviews-title">Что говорят покупатели</h2>
            </div>
            <button
              className="text-button"
              onClick={() => setOverlay("reviews")}
            >
              Читать отзывы <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <span className="quote-mark" aria-hidden="true">
                  “
                </span>
                <p>{review.text}</p>
                <div className="review-author">
                  <span className="avatar">{review.letter}</span>
                  <span>
                    <strong>{review.name}</strong>
                    <small>{review.date}</small>
                  </span>
                  <Icon name="heart" size={19} />
                </div>
              </article>
            ))}
          </div>
          <p className="reviews-source">
            Отзывы покупателей с действующего сайта пекарни
          </p>
        </section>
      </main>

      <footer id="contacts" className="footer">
        <div className="ornament" aria-hidden="true" />
        <div className="container footer-main">
          <div className="footer-brand">
            <Logo light />
            <p>
              Осетинские пироги
              <br />с доставкой по Томску
            </p>
          </div>
          <div className="footer-contact">
            <span className="footer-label">ЗАКАЗЫ ПО ТЕЛЕФОНУ</span>
            <a href="tel:+79138208007">
              8 913 820-80-07
              <Icon name="phone" size={20} className="footer-phone-icon" />
            </a>
            <a href="tel:+73822508007">8 (3822) 508-007</a>
          </div>
          <div className="footer-links footer-pickup">
            <span className="footer-label">САМОВЫВОЗ ЗАКАЗОВ</span>
            <span>Томск, ул. Озёрная, 3а</span>
            <span>Ежедневно, 9:00–20:00</span>
            <a
              className="footer-map"
              href="https://2gis.ru/tomsk/search/Озёрная%203а"
              target="_blank"
              rel="noopener noreferrer"
            >
              Показать на карте <Icon name="arrow" size={16} />
            </a>
          </div>
          <nav className="footer-links footer-menu" aria-label="Меню в подвале">
            <span className="footer-label">МЕНЮ ПЕКАРНИ</span>
            {categories.map((item) => (
              <a
                key={item.id}
                href="#menu"
                onClick={() => selectCategory(item.id)}
              >
                {item.label}
                <Icon name="chevron" size={16} className="footer-menu-icon" />
              </a>
            ))}
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Пекарня «Три пирога»</span>
          <span>Демонстрационная версия · Заказы не отправляются</span>
        </div>
      </footer>

      {!overlay && !selectedProduct && (
        <nav className="mobile-dock" aria-label="Быстрые действия">
          <a href="#menu">
            <Icon name="grid" size={22} />
            <span>Меню</span>
          </a>
          <a href="#delivery">
            <Icon name="truck" size={23} />
            <span>Доставка</span>
          </a>
          <button
            className="mobile-dock-cart"
            onClick={() => setOverlay("cart")}
            aria-label={`Открыть корзину, товаров: ${count}, сумма: ${money(total)}`}
          >
            <Icon name="bag" size={21} />
            <span>Корзина{count > 0 && <small>{money(total)}</small>}</span>
            <span className="mobile-dock-count">{count}</span>
          </button>
        </nav>
      )}

      {overlay === "navigation" && (
        <Modal
          title="Три пирога"
          onClose={() => setOverlay(null)}
          className="navigation-sheet"
        >
          <p className="navigation-intro">Меню, доставка и контакты пекарни</p>
          <nav className="mobile-navigation" aria-label="Разделы сайта">
            {[
              ["menu", "Наше меню", "grid"],
              ["about", "О пекарне", "heart"],
              ["delivery", "Доставка и самовывоз", "truck"],
              ["reviews", "Отзывы покупателей", "star"],
              ["contacts", "Контакты", "phone"],
            ].map(([id, label, icon]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToSection(id);
                }}
              >
                <Icon name={icon} size={21} />
                <span>{label}</span>
                <Icon name="chevron" size={18} />
              </a>
            ))}
          </nav>
          <div className="mobile-navigation-contact">
            <span className="eyebrow">ПЕЧЁМ НА ЗАКАЗ</span>
            <a href="tel:+79138208007">8 913 820-80-07</a>
            <p>Ежедневно, 9:00–20:00</p>
            <div>
              <Icon name="pin" size={19} />
              <p>
                Самовывоз готовых заказов
                <br />
                <strong>Томск, ул. Озёрная, 3а</strong>
              </p>
            </div>
          </div>
        </Modal>
      )}

      {selectedProduct && (
        <Modal
          title={selectedProduct.name}
          onClose={() => setSelectedProduct(null)}
          wide
        >
          <div className="product-detail">
            <ProductImage product={selectedProduct} />
            <div>
              <p className="eyebrow">{selectedProduct.nativeName}</p>
              <p className="detail-description">
                {selectedProduct.description}
              </p>
              <span className="detail-weight">
                {selectedProduct.weight}
                {selectedProduct.category === "pies" ? " · Диаметр 30 см" : ""}
              </span>
              <h3>Что внутри</h3>
              <p>{selectedProduct.ingredients}</p>
              <h3>Аллергены</h3>
              <p>{selectedProduct.allergens}</p>
              <div className="detail-bottom">
                <strong>{money(selectedProduct.price)}</strong>
                {cart[selectedProduct.id] ? (
                  <Quantity
                    value={cart[selectedProduct.id]}
                    name={selectedProduct.name}
                    onChange={(value) =>
                      updateQuantity(selectedProduct.id, value)
                    }
                  />
                ) : (
                  <button
                    className="button button-primary"
                    onClick={() => addProduct(selectedProduct)}
                  >
                    В корзину <Icon name="plus" size={18} />
                  </button>
                )}
              </div>
              <p className="detail-note">
                Состав и фотографии приведены для демонстрации
              </p>
            </div>
          </div>
        </Modal>
      )}

      {overlay === "cart" && (
        <Modal title="Ваша корзина" onClose={() => setOverlay(null)} drawer>
          {cartItems.length ? (
            <>
              <div className="cart-content">
                <div className="cart-items">
                  {cartItems.map((product) => (
                    <article className="cart-item" key={product.id}>
                      <ProductImage product={product} />
                      <div className="cart-item-info">
                        <h3>{product.name}</h3>
                        <span>
                          {product.weight} · {money(product.price)}
                        </span>
                        <Quantity
                          value={cart[product.id]}
                          name={product.name}
                          onChange={(value) =>
                            updateQuantity(product.id, value)
                          }
                        />
                      </div>
                      <div className="cart-item-end">
                        <button
                          className="icon-button"
                          onClick={() => updateQuantity(product.id, 0)}
                          aria-label={`Удалить: ${product.name}`}
                        >
                          <Icon name="trash" size={17} />
                        </button>
                        <strong>
                          {money(product.price * cart[product.id])}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
                {!hasDessert && (
                  <div className="cart-addition">
                    <Icon name="heart" size={21} />
                    <div>
                      <strong>А что-нибудь к чаю?</strong>
                      <span>Ореховая пахлава — сладкое завершение</span>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Добавить пахлаву мини"
                      onClick={() =>
                        addProduct(
                          products.find(
                            (product) => product.id === "baklava-mini",
                          )!,
                        )
                      }
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                )}
              </div>
              <div className="cart-summary">
                <div>
                  <span>Ваш заказ</span>
                  <strong>{money(total)}</strong>
                </div>
                <p>
                  {hasFreeDelivery
                    ? "Доставка бесплатно — в заказе от трёх пирогов"
                    : "Доставка бесплатно от трёх пирогов, иначе — 250 ₽"}
                </p>
                <button
                  className="button button-primary full-width"
                  onClick={() => setOverlay("checkout")}
                >
                  К оформлению <Icon name="arrow" size={19} />
                </button>
                <button
                  className="text-button continue-button"
                  onClick={() => setOverlay(null)}
                >
                  Продолжить покупки
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <span>
                <Icon name="bag" size={42} />
              </span>
              <h3>Здесь скоро будет вкусно</h3>
              <p>
                Выберите пироги в меню
                <br />
                От трёх пирогов — доставка бесплатно
              </p>
              <button
                className="button button-primary"
                onClick={() => {
                  navigateToSection("menu");
                }}
              >
                К нашему меню <Icon name="arrow" size={18} />
              </button>
            </div>
          )}
        </Modal>
      )}

      {overlay === "bundle" && (
        <Modal title="Ваши три пирога" onClose={() => setOverlay(null)} wide>
          <p className="modal-intro">
            Выберите любые три пирога — доставка по Томску бесплатно
          </p>
          <div className="bundle-picker">
            {bundle.map((id, index) => (
              <div className="bundle-option" key={index}>
                <span className="bundle-number">0{index + 1}</span>
                <ProductImage
                  product={products.find((product) => product.id === id)!}
                />
                <label htmlFor={`pie-${index}`}>
                  {index === 0
                    ? "Первый пирог"
                    : index === 1
                      ? "Второй пирог"
                      : "Третий пирог"}
                </label>
                <Select
                  id={`pie-${index}`}
                  value={id}
                  onChange={(event) =>
                    setBundle((current) =>
                      current.map((value, itemIndex) =>
                        itemIndex === index ? event.target.value : value,
                      ),
                    )
                  }
                >
                  {products
                    .filter((product) => product.category === "pies")
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </Select>
              </div>
            ))}
          </div>
          <div className="bundle-total">
            <span>
              3 пирога · 2 700 г
              <strong>
                {money(
                  bundle.reduce(
                    (sum, id) =>
                      sum +
                      products.find((product) => product.id === id)!.price,
                    0,
                  ),
                )}
              </strong>
            </span>
            <button
              className="button button-primary"
              onClick={addBundle}
              disabled={!bundleFits}
              aria-describedby={!bundleFits ? "bundle-limit" : undefined}
            >
              Добавить набор <Icon name="bag" size={19} />
            </button>
          </div>
          {!bundleFits && (
            <p className="field-error" id="bundle-limit" role="alert">
              В корзине может быть до 99 единиц одного товара
              <br />
              Выберите другую начинку или уменьшите количество в корзине
            </p>
          )}
        </Modal>
      )}

      {overlay === "checkout" && (
        <Modal
          title="Оформление заказа"
          onClose={() => setOverlay(null)}
          wide
          className="checkout-modal"
          pageOnMobile
        >
          <button className="back-button" onClick={() => setOverlay("cart")}>
            ← Вернуться к корзине
          </button>
          <form
            onSubmit={submitOrder}
            className="checkout"
            onKeyDown={(event) => {
              // "Next" must advance the form, not submit a partial order.
              // Keep Enter in the comment textarea available for new lines.
              if (
                event.key !== "Enter" ||
                event.nativeEvent.isComposing ||
                !(event.target instanceof HTMLInputElement)
              )
                return;
              const fields = Array.from(
                event.currentTarget.querySelectorAll<
                  HTMLInputElement | HTMLTextAreaElement
                >("input:not(:disabled), textarea:not(:disabled)"),
              );
              const next = fields[fields.indexOf(event.target) + 1];
              if (next) {
                event.preventDefault();
                next.focus();
              }
            }}
          >
            <div className="checkout-fields">
              <h3>Как получить заказ?</h3>
              <div className="delivery-toggle">
                <button
                  type="button"
                  className={delivery === "delivery" ? "active" : ""}
                  aria-pressed={delivery === "delivery"}
                  onClick={() => setDelivery("delivery")}
                >
                  <Icon name="truck" size={18} />
                  Доставка
                </button>
                <button
                  type="button"
                  className={delivery === "pickup" ? "active" : ""}
                  aria-pressed={delivery === "pickup"}
                  onClick={() => setDelivery("pickup")}
                >
                  <Icon name="pin" size={18} />
                  Самовывоз
                </button>
              </div>
              <label>
                Ваше имя
                <Input
                  name="name"
                  enterKeyHint="next"
                  pattern=".*\S.*"
                  value={checkoutDraft.name}
                  onChange={(event) =>
                    setCheckoutDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="given-name"
                  placeholder="Как к вам обращаться?"
                />
              </label>
              <label>
                Телефон
                <Input
                  name="phone"
                  enterKeyHint="next"
                  aria-label="Телефон"
                  type="tel"
                  inputMode="tel"
                  value={checkoutDraft.phone}
                  required
                  autoComplete="tel"
                  placeholder="+7 999 123-45-67"
                  maxLength={22}
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "phone-error" : undefined}
                  onChange={(event) => {
                    setPhoneError("");
                    setCheckoutDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }));
                  }}
                />
                {phoneError && (
                  <span className="field-error" id="phone-error" role="alert">
                    {phoneError}
                  </span>
                )}
              </label>
              {delivery === "delivery" ? (
                <label>
                  Адрес в Томске
                  <Input
                    name="address"
                    enterKeyHint="next"
                    pattern=".*\S.*"
                    value={checkoutDraft.address}
                    onChange={(event) =>
                      setCheckoutDraft((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    required
                    minLength={5}
                    maxLength={180}
                    autoComplete="street-address"
                    placeholder="Улица, дом, квартира"
                  />
                </label>
              ) : (
                <div className="pickup-address">
                  <Icon name="pin" size={20} />
                  <p>
                    <strong>Точка самовывоза</strong>Томск, ул. Озёрная, 3а
                    <br />
                    Ежедневно, 9:00–20:00
                  </p>
                </div>
              )}
              <label>
                Комментарий <span className="optional">необязательно</span>
                <Textarea
                  name="comment"
                  value={checkoutDraft.comment}
                  onChange={(event) =>
                    setCheckoutDraft((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  rows={2}
                  maxLength={500}
                  placeholder="Что нам стоит знать?"
                />
              </label>
            </div>
            <aside className="checkout-summary">
              <h3>Ваш заказ</h3>
              {cartItems.map((product) => (
                <div className="checkout-line" key={product.id}>
                  <span>
                    {product.name}
                    <small>{cart[product.id]} шт.</small>
                  </span>
                  <strong>{money(product.price * cart[product.id])}</strong>
                </div>
              ))}
              <div className="checkout-line shipping">
                <span>
                  {delivery === "delivery" ? "Доставка" : "Самовывоз"}
                </span>
                <strong>
                  {deliveryPrice ? money(deliveryPrice) : "Бесплатно"}
                </strong>
              </div>
              <div className="checkout-total">
                <span>Итого</span>
                <strong>{money(total + deliveryPrice)}</strong>
              </div>
              <button
                type="submit"
                className="button button-primary full-width"
              >
                Оформить демозаказ <Icon name="arrow" size={18} />
              </button>
              <p className="demo-note">
                Это демонстрация: данные никуда не отправляются
                <br />
                От трёх пирогов — доставка бесплатно, иначе — 250 ₽
              </p>
            </aside>
          </form>
        </Modal>
      )}

      {overlay === "success" && (
        <Modal title="Ваш заказ собран" onClose={() => setOverlay(null)}>
          <div className="success-state">
            <span>
              <Icon name="check" size={35} />
            </span>
            <h3>Демозаказ оформлен</h3>
            <p>
              Вы собрали заказ на <strong>{money(orderTotal)}</strong>
            </p>
            <p>
              Это демонстрация — пекарня не получила заказ, оплата не требуется
            </p>
            <button
              className="button button-primary"
              onClick={() => setOverlay(null)}
            >
              Вернуться к меню <Icon name="arrow" size={18} />
            </button>
          </div>
        </Modal>
      )}

      {overlay === "reviews" && (
        <Modal
          title="Слова наших покупателей"
          onClose={() => setOverlay(null)}
          wide
        >
          <div className="all-reviews">
            {reviews.map((review) => (
              <article key={review.name}>
                <div className="review-author">
                  <span className="avatar">{review.letter}</span>
                  <span>
                    <strong>{review.name}</strong>
                    <small>{review.date}</small>
                  </span>
                </div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
          <a
            className="text-button"
            href="https://xn----8sbisb0bffeo.xn--p1acf/otzyvy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Все отзывы на действующем сайте <Icon name="arrow" size={18} />
          </a>
        </Modal>
      )}

      <div className={`toast ${toast ? "toast-visible" : ""}`} role="status">
        <Icon name="check" size={18} />
        {toast}
      </div>
    </>
  );
}
