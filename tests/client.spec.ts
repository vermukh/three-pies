import { test, expect, type Page } from "@playwright/test";

type TrackedWindow = Window & { listenerCount: () => number };

const cartKey = "three-pies:cart:v1";
const sizes = [
  [320, 568],
  [360, 640],
  [375, 667],
  [390, 844],
  [430, 932],
  [600, 900],
  [768, 1024],
  [800, 600],
  [844, 390],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];
async function openCart(page: Page) {
  await page
    .getByRole("button", { name: /^Открыть корзину/ })
    .filter({ visible: true })
    .click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  for (const dialog of await page.getByRole("dialog").all()) {
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
  }
}
async function ready(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [390, 1440]) {
  for (const [id, name] of [
    ["apple", "С яблоком и корицей"],
    ["baklava", "Пахлава с грецким орехом"],
    ["baklava-mini", "Пахлава мини"],
  ]) {
    test(`dessert suggestion follows ${id} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await ready(page);
      await page.evaluate(
        ({ key, id }) => {
          localStorage.setItem(key, JSON.stringify({ beef: 1, [id]: 1 }));
        },
        { key: cartKey, id },
      );
      await page.reload();
      await openCart(page);
      await expect(page.getByText("А что-нибудь к чаю?")).toHaveCount(0);
      await page
        .getByRole("button", { name: `Удалить: ${name}`, exact: true })
        .click();
      await expect(page.getByText("А что-нибудь к чаю?")).toBeVisible();
      await page.getByRole("button", { name: "Добавить пахлаву мини" }).click();
      await expect(page.getByText("А что-нибудь к чаю?")).toHaveCount(0);
      await page.reload();
      await openCart(page);
      await expect(page.getByText("А что-нибудь к чаю?")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Удалить: Пахлава мини", exact: true })
        .click();
      await expect(page.getByText("А что-нибудь к чаю?")).toBeVisible();
      await noOverflow(page);
    });
  }

  test(`delivery counts pies and recalculates at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ beef: 2, mors: 1, water: 1 }));
    }, cartKey);
    await page.reload();
    await openCart(page);
    await expect(page.getByText("А что-нибудь к чаю?")).toBeVisible();
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.locator(".shipping strong")).toHaveText("250 ₽");
    await expect(page.locator(".checkout-total strong")).toHaveText("2 400 ₽");
    await page.getByRole("button", { name: "Самовывоз", exact: true }).click();
    await expect(page.locator(".shipping strong")).toHaveText("Бесплатно");
    await page.getByRole("button", { name: "Доставка", exact: true }).click();
    await page.getByRole("button", { name: "← Вернуться к корзине" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Добавить один: С говядиной", exact: true })
      .click();
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.locator(".shipping strong")).toHaveText("Бесплатно");
    await expect(page.locator(".checkout-total strong")).toHaveText("3 050 ₽");
    await page.getByRole("button", { name: "← Вернуться к корзине" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Добавить один: С говядиной", exact: true })
      .click();
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.locator(".shipping strong")).toHaveText("Бесплатно");
    await page.getByRole("button", { name: "← Вернуться к корзине" }).click();
    for (let i = 0; i < 2; i++) {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Убрать один: С говядиной", exact: true })
        .click();
    }
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.locator(".shipping strong")).toHaveText("250 ₽");
    await expect(page.locator(".checkout-total strong")).toHaveText("2 400 ₽");
  });

  test(`sweet bundle gets free delivery without dessert suggestion at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    await page
      .getByRole("button", { name: /Собрать/ })
      .first()
      .click();
    await page.getByLabel("Третий пирог").selectOption("apple");
    await page.getByRole("button", { name: "Добавить набор" }).click();
    await expect(page.getByText("А что-нибудь к чаю?")).toHaveCount(0);
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.locator(".shipping strong")).toHaveText("Бесплатно");
    await expect(page.locator(".checkout-total strong")).toHaveText("2 700 ₽");
    await page.getByLabel("Ваше имя").fill("Покупатель");
    await page.getByLabel("Телефон", { exact: true }).fill("+7 999 123-45-67");
    await page.getByLabel("Адрес в Томске").fill("Тестовая улица, 10");
    await page.getByRole("button", { name: "Оформить демозаказ" }).click();
    await expect(page.getByRole("dialog")).toContainText("2 700 ₽");
  });
}

for (const [width, height] of sizes) {
  test(`layout ${width}x${height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.setViewportSize({ width, height });
    await ready(page);
    await noOverflow(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Быстрые действия" }),
    ).toBeVisible({ visible: width <= 800 });
    await expect(
      page.getByRole("button", { name: "Открыть меню разделов" }),
    ).toBeVisible({ visible: width <= 800 });
    for (const label of [
      "Сладкие",
      "Все пироги",
      "Напитки",
      "Пахлава",
      "Осетинские пироги",
    ]) {
      await page
        .locator(".catalog-controls")
        .getByRole("button", { name: label, exact: true })
        .click();
      const counts: Record<string, number> = {
        Сладкие: 1,
        "Все пироги": 6,
        Напитки: 2,
        Пахлава: 2,
        "Осетинские пироги": 6,
      };
      await expect(page.locator(".product-card")).toHaveCount(counts[label]);
      await noOverflow(page);
    }
    await page
      .getByRole("button", { name: "Подробнее: С осетинским сыром" })
      .click();
    if (width <= 800) {
      const close = await page
        .getByRole("button", { name: "Закрыть окно" })
        .boundingBox();
      expect(close!.width).toBeGreaterThanOrEqual(44);
      expect(close!.height).toBeGreaterThanOrEqual(44);
    }
    await noOverflow(page);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "В корзину" })
      .click();
    await page.getByRole("button", { name: "Закрыть окно" }).click();
    await openCart(page);
    await noOverflow(page);
    await page.getByRole("button", { name: "К оформлению" }).click();
    await noOverflow(page);
    await page.getByLabel("Адрес в Томске").fill("ул. Проверочная, 10");
    await page.getByRole("button", { name: "Самовывоз", exact: true }).click();
    await expect(page.getByText("Точка самовывоза")).toBeVisible();
    await noOverflow(page);
    await page.getByRole("button", { name: "Закрыть окно" }).click();
    await page.goto("/?view=ui-kit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Тепло в каждой детали",
    );
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`shopping, validation and privacy at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const unexpected: string[] = [];
    page.on("request", (request) => {
      if (
        new URL(request.url()).origin !== "http://127.0.0.1:4173" ||
        request.method() !== "GET"
      )
        unexpected.push(request.url());
    });
    await ready(page);
    await page
      .getByRole("button", { name: "Подробнее: С осетинским сыром" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "В корзину" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Добавить один:" })
      .click();
    await page.keyboard.press("Escape");
    await page.reload();
    await openCart(page);
    await expect(page.locator(".cart-summary strong")).toHaveText("1 800 ₽");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Убрать один:" })
      .click();
    await expect(page.locator(".cart-summary strong")).toHaveText("900 ₽");
    await page.getByRole("button", { name: "К оформлению" }).click();
    await page.getByLabel("Ваше имя").fill("   ");
    expect(
      await page
        .getByLabel("Ваше имя")
        .evaluate((el: HTMLInputElement) => el.checkValidity()),
    ).toBe(false);
    await page.getByLabel("Ваше имя").fill("Тестовый покупатель");
    await page.getByLabel("Телефон", { exact: true }).fill("12345");
    await page.getByLabel("Адрес в Томске").fill("Тестовая улица, 123");
    await page
      .getByRole("textbox", { name: /Комментарий/ })
      .fill("<img src=x onerror=alert(1)>");
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("alert")).toHaveText(
      "Введите номер в формате +7 999 123-45-67",
    );
    await expect(page.getByLabel("Телефон", { exact: true })).toBeFocused();
    await page.getByLabel("Телефон", { exact: true }).fill("+7 999 123-45-67");
    await expect(page.locator(".checkout-total strong")).toHaveText("1 150 ₽");
    await page.getByRole("button", { name: "Самовывоз", exact: true }).click();
    await expect(page.locator(".checkout-total strong")).toHaveText("900 ₽");
    await expect(page.getByLabel("Адрес в Томске")).toHaveCount(0);
    await page.getByRole("button", { name: "← Вернуться к корзине" }).click();
    await page.getByRole("button", { name: "К оформлению" }).click();
    await expect(page.getByLabel("Ваше имя")).toHaveValue(
      "Тестовый покупатель",
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Доставка", exact: true })
      .click();
    await expect(page.getByLabel("Адрес в Томске")).toHaveValue(
      "Тестовая улица, 123",
    );
    const storage = await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
      cookies: document.cookie,
    }));
    expect(storage).toEqual({
      local: { [cartKey]: '{"cheese":1}' },
      session: {},
      cookies: "",
    });
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("dialog")).toContainText(
      "пекарня не получила заказ",
    );
    await expect(page.getByRole("dialog")).toContainText("1 150 ₽");
    await page.keyboard.press("Escape");
    await openCart(page);
    await expect(page.getByText("Здесь скоро будет вкусно")).toBeVisible();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), cartKey),
    ).toBe("{}");
    expect(unexpected).toEqual([]);
  });
}

test("bundle supports repeated fillings and removal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page
    .getByRole("button", { name: /Собрать/ })
    .first()
    .click();
  for (const label of ["Первый пирог", "Второй пирог", "Третий пирог"])
    await page.getByLabel(label).selectOption("beef");
  await page.getByRole("button", { name: "Добавить набор" }).click();
  await expect(page.locator(".cart-summary strong")).toHaveText("2 700 ₽");
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Удалить: С говядиной" }).click();
  await expect(page.getByText("Здесь скоро будет вкусно")).toBeVisible();
});

test("bundle is not partially added at the quantity limit", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, '{"beef":98}'),
    cartKey,
  );
  await ready(page);
  await page
    .getByRole("button", { name: /Собрать/ })
    .first()
    .click();
  for (const label of ["Первый пирог", "Второй пирог", "Третий пирог"])
    await page.getByLabel(label).selectOption("beef");
  await expect(
    page.getByRole("button", { name: "Добавить набор" }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText("до 99 единиц");
  expect(await page.evaluate((key) => localStorage.getItem(key), cartKey)).toBe(
    '{"beef":98}',
  );
});

test("cart still works when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage disabled", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage disabled", "QuotaExceededError");
    };
  });
  await ready(page);
  await page
    .getByRole("button", { name: "Подробнее: С осетинским сыром" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "В корзину" })
    .click();
  await page.keyboard.press("Escape");
  await openCart(page);
  await expect(page.locator(".cart-summary strong")).toHaveText("900 ₽");
});

for (const stored of [
  "{bad",
  "null",
  "[]",
  '{"cheese":99,"beef":100,"herbs":-2,"apple":1.5,"water":"2","__proto__":{"polluted":true},"<script>":1}',
]) {
  test(`untrusted stored cart ${stored.slice(0, 30)}`, async ({ page }) => {
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: cartKey, value: stored },
    );
    await ready(page);
    await openCart(page);
    if (stored.includes("cheese")) {
      await expect(page.locator(".cart-item")).toHaveCount(1);
      await expect(
        page
          .getByRole("dialog")
          .getByRole("button", { name: "Добавить один:" }),
      ).toBeDisabled();
      expect(
        await page.evaluate(() => (({}) as Record<string, unknown>).polluted),
      ).toBeUndefined();
    } else
      await expect(page.getByText("Здесь скоро будет вкусно")).toBeVisible();
  });
}

test("navigation, dialog focus, cleanup and scroll restoration", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const active = new Map<
      EventTarget,
      Map<string, Set<EventListenerOrEventListenerObject>>
    >();
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const track = (target: EventTarget, type: string) =>
      ["resize", "scroll", "change"].includes(type) &&
      (target === window ||
        target === window.visualViewport ||
        target instanceof MediaQueryList);
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (listener && track(this, type)) {
        if (!active.has(this)) active.set(this, new Map());
        const events = active.get(this)!;
        if (!events.has(type)) events.set(type, new Set());
        events.get(type)!.add(listener);
      }
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      if (listener) active.get(this)?.get(type)?.delete(listener);
      return remove.call(this, type, listener, options);
    };
    (window as TrackedWindow).listenerCount = () =>
      [...active.values()].reduce(
        (sum, events) =>
          sum +
          [...events.values()].reduce((n, listeners) => n + listeners.size, 0),
        0,
      );
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.getByRole("button", { name: "Открыть меню разделов" }).click();
  await page
    .getByRole("navigation", { name: "Разделы сайта" })
    .getByRole("link", { name: "Наше меню" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const y = await page.evaluate(() => scrollY);
  expect(y).toBeGreaterThan(500);
  const baseline = await page.evaluate(() =>
    (window as TrackedWindow).listenerCount(),
  );
  for (let i = 0; i < 20; i++) {
    // Click the visible sticky button directly: locator.click() scrolls it
    // toward the viewport centre before clicking, changing the baseline.
    const box = await page
      .getByRole("button", { name: "Открыть меню разделов" })
      .boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(
    page.getByRole("button", { name: "Открыть меню разделов" }),
  ).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(await page.evaluate(() => document.body.style.position)).toBe("");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  expect(
    await page.evaluate(() => (window as TrackedWindow).listenerCount()),
  ).toBe(baseline);
  await page.getByRole("button", { name: "Открыть меню разделов" }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("UI-kit interactions and accessible field states", async ({ page }) => {
  await page.goto("/?view=ui-kit");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Пример сохранён" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Сохраняем" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Недоступно" })).toBeDisabled();
  await page.getByRole("button", { name: "Убрать один:" }).click();
  await expect(
    page.getByRole("button", { name: "Убрать один:" }),
  ).toBeDisabled();
  await expect(page.getByLabel("Телефон")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Телефон")).toHaveAccessibleDescription(
    "Введите номер в формате +7 999 123-45-67",
  );
  await expect(page.getByLabel("Название товара")).toHaveAccessibleDescription(
    "Укажите понятное покупателю название",
  );
  await page
    .getByRole("button", { name: "Открыть диалог", exact: true })
    .click();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Открыть диалог", exact: true }),
  ).toBeFocused();
});

test("long mobile cart keeps checkout reachable and follows viewport height", async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          cheese: 1,
          beef: 1,
          herbs: 1,
          potato: 1,
          cabbage: 1,
          apple: 1,
          baklava: 1,
          "baklava-mini": 1,
          mors: 1,
          water: 1,
        }),
      ),
    cartKey,
  );
  await page.setViewportSize({ width: 320, height: 568 });
  await ready(page);
  await openCart(page);
  await expect(
    page.getByRole("button", { name: "К оформлению" }),
  ).toBeInViewport();
  expect(
    await page
      .locator(".cart-content")
      .evaluate((el) => el.scrollHeight > el.clientHeight),
  ).toBe(true);
  await noOverflow(page);
  await page.getByRole("button", { name: "К оформлению" }).click();
  await page.setViewportSize({ width: 320, height: 360 });
  // WebKit's select()+focus() used by fill() can focus without scrolling.
  // Reach the address through the form's Next action before entering text.
  await page.getByLabel("Ваше имя").click();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Телефон", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Телефон", { exact: true })).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Адрес в Томске")).toBeFocused();
  await expect(page.getByLabel("Адрес в Томске")).toBeInViewport();
  await page.getByLabel("Адрес в Томске").fill("Проверка уменьшения экрана");
  await expect(page.getByLabel("Адрес в Томске")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Закрыть окно" }),
  ).toBeInViewport();
  await noOverflow(page);
});

test("touch phone navigation and reviews", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    baseURL: "http://127.0.0.1:4173",
  });
  try {
    const page = await context.newPage();
    await ready(page);
    await page.getByRole("button", { name: "Открыть меню разделов" }).tap();
    await page
      .getByRole("navigation", { name: "Разделы сайта" })
      .getByRole("link", { name: "Отзывы покупателей" })
      .tap();
    await page.getByRole("button", { name: "Читать отзывы" }).tap();
    await expect(page.getByRole("dialog")).toContainText("Наталья");
    await expect(page.getByRole("dialog").locator("article")).toHaveCount(3);
    await noOverflow(page);
    await page.getByRole("button", { name: "Закрыть окно" }).tap();
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    const footer = await page.locator(".footer-bottom").boundingBox();
    const dock = await page.locator(".mobile-dock").boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(dock!.y + 1);
    await page.setViewportSize({ width: 844, height: 390 });
    await noOverflow(page);
  } finally {
    await context.close();
  }
});

for (const width of [390, 844, 1440]) {
  test(`visual previews ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 900 });
    await ready(page);
    await page.screenshot({
      path: testInfo.outputPath("home.png"),
      animations: "disabled",
    });
    await page.evaluate(() =>
      document.getElementById("menu")!.scrollIntoView({ behavior: "instant" }),
    );
    await page.screenshot({
      path: testInfo.outputPath("catalog.png"),
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: /Собрать/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Добавить набор" }).click();
    await page.screenshot({
      path: testInfo.outputPath("cart.png"),
      animations: "disabled",
    });
    await page.getByRole("button", { name: "К оформлению" }).click();
    await page.screenshot({
      path: testInfo.outputPath("checkout.png"),
      animations: "disabled",
    });
    await page.goto("/?view=ui-kit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Тепло в каждой детали",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: testInfo.outputPath("ui-kit.png"),
      fullPage: true,
      animations: "disabled",
    });
  });
}

for (const width of [390, 844]) {
  test(`mobile checkout uses document scrolling and sequential fields ${width}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 390 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    try {
      await page.addInitScript((key) => {
        localStorage.setItem(key, JSON.stringify({ cheese: 1 }));
      }, cartKey);
      await ready(page);
      await page.evaluate(() =>
        window.scrollTo({ top: 700, behavior: "instant" }),
      );
      await openCart(page);
      const backgroundScroll = await page.evaluate(() =>
        document.body.style.position === "fixed"
          ? -parseFloat(document.body.style.top)
          : window.scrollY,
      );
      await page.getByRole("button", { name: "К оформлению" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toHaveCSS("position", "static");
      await expect(dialog).toHaveCSS("overflow-y", "visible");
      await expect(page.locator("#root")).toBeHidden();
      expect(await page.evaluate(() => document.body.style.position)).toBe("");
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
      await page.getByLabel("Ваше имя").fill("Анна");
      await page.keyboard.press("Enter");
      await expect(page.getByLabel("Телефон", { exact: true })).toBeFocused();
      await page.keyboard.type("+79991234567");
      await page.keyboard.press("Enter");
      await expect(page.getByLabel("Адрес в Томске")).toBeFocused();
      await page.keyboard.type("Томск, Озёрная, 3а");
      await page.keyboard.press("Enter");
      const comment = page.getByLabel("Комментарий");
      await expect(comment).toBeFocused();
      await comment.fill("Домофон");
      await page.keyboard.press("Enter");
      await page.keyboard.type("12");
      await expect(comment).toHaveValue("Домофон\n12");
      await page.keyboard.press("Shift+Tab");
      await expect(page.getByLabel("Адрес в Томске")).toBeFocused();
      // iOS changes visualViewport while keeping the layout viewport intact.
      // These events must not reposition or clip the form around its input.
      const before = await dialog.boundingBox();
      await page.evaluate(() => {
        const viewport = window.visualViewport!;
        Object.defineProperty(viewport, "height", {
          configurable: true,
          value: 300,
        });
        Object.defineProperty(viewport, "offsetTop", {
          configurable: true,
          value: 45,
        });
        viewport.dispatchEvent(new Event("resize"));
        viewport.dispatchEvent(new Event("scroll"));
      });
      expect(await dialog.boundingBox()).toEqual(before);
      expect(
        await dialog.evaluate((el) =>
          el.style.getPropertyValue("--dialog-height"),
        ),
      ).toBe("");
      await page.evaluate(() => {
        Reflect.deleteProperty(window.visualViewport!, "height");
        Reflect.deleteProperty(window.visualViewport!, "offsetTop");
      });
      await dialog
        .getByRole("button", { name: "Самовывоз", exact: true })
        .click();
      await page.getByLabel("Телефон", { exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(comment).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(page.getByLabel("Телефон", { exact: true })).toBeFocused();
      await page.getByRole("button", { name: "Вернуться к корзине" }).click();
      await expect(page.locator("#root")).toBeVisible();
      await page.getByRole("button", { name: "К оформлению" }).click();
      await expect(page.getByLabel("Ваше имя")).toHaveValue("Анна");
      await expect(comment).toHaveValue("Домофон\n12");
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(page.locator("html")).not.toHaveAttribute(
        "data-ui-page-dialog",
      );
      await expect(page.locator("#root")).toBeVisible();
      expect(await page.evaluate(() => document.body.style.position)).toBe("");
      expect(await page.evaluate(() => window.scrollY)).toBe(backgroundScroll);
      await noOverflow(page);
    } finally {
      await context.close();
    }
  });
}

test("checkout switches between desktop dialog and mobile page without losing draft", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ cheese: 1 }));
  }, cartKey);
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await openCart(page);
  await page.getByRole("button", { name: "К оформлению" }).click();
  await page.getByLabel("Ваше имя").fill("Анна");
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate((el) => el.matches(":modal"))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog).toHaveCSS("position", "static");
  await expect(page.getByLabel("Ваше имя")).toHaveValue("Анна");
  await expect(page.getByLabel("Ваше имя")).toBeFocused();
  const close = page.getByRole("button", { name: "Закрыть окно" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Оформить демозаказ" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dialog).toHaveCSS("position", "fixed");
  expect(await dialog.evaluate((el) => el.matches(":modal"))).toBe(true);
  await expect(page.getByLabel("Ваше имя")).toHaveValue("Анна");
  await close.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-ui-page-dialog");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await noOverflow(page);
});
