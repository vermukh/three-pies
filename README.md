# Три пирога

Клиентский прототип на React и TypeScript с адаптивной витриной и общим UI-kit. Все заказы демонстрационные. Пекарня готовит на доставку и самовывоз; зала для посещения нет.

## Запуск

Требуется Node.js 22.12+ и npm с поддержкой workspaces. Команды выполняются **из корня репозитория**:

```bash
npm ci
npm run dev
```

- Витрина: http://127.0.0.1:5173
- Интерактивный UI-kit: http://127.0.0.1:5173/?view=ui-kit

Сервер разработки по умолчанию доступен только локально. Для просмотра с телефона в своей сети: `npm run dev --workspace=three-pies-client -- --host 0.0.0.0`, затем открыть IP компьютера с портом 5173.

## Проверки

```bash
npm run lint
npm run format:check
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
npx playwright install --with-deps webkit
npm run test:e2e:webkit
npm audit
```

На Linux могут понадобиться системные библиотеки браузера: `npx playwright install-deps chromium`. E2E-тесты запускают локальный просмотр **предварительно собранного** `client/dist` на порту 4173. После изменения приложения сначала повторите сборку. Для установленного отдельно Chromium можно задать `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

`test:e2e` запускает проект Chromium, `test:e2e:webkit` — те же сценарии в WebKit. Путь `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` применяется только к Chromium. Проверка WebKit на Linux не эмулирует системную клавиатуру и панель перехода между полями iOS.

HTML-отчёт — `playwright-report/index.html`, скриншоты и трассировки падений — `test-results/`. Тесты `visual previews` также сохраняют изображения главной, каталога, корзины, оформления и UI-kit. Папки результатов не включаются в Git.

## Линтинг и форматирование

Конфигурация ESLint находится в `eslint.config.mjs`: рекомендованные проверки JavaScript, TypeScript и React Hooks применяются к клиенту, UI-kit, тестам и скриптам. Команда `npm run lint` завершается ошибкой и при предупреждениях. Для автоматических исправлений — `npm run lint:fix`.

Общий конфиг Prettier — `.prettierrc.json`: два пробела, двойные кавычки, точки с запятой, trailing comma, ширина строки 80 символов и окончания строк LF. `npm run format` форматирует исходники, конфиги, документацию и SVG; `npm run format:check` проверяет форматирование без записи. Зависимости, сборки, отчёты и локальные настройки исключены через `.prettierignore`. `eslint-config-prettier` предотвращает конфликт правил форматирования с ESLint.

## Структура

```text
client/             — витрина и интерактивная галерея UI-kit
packages/ui-kit/    — общие токены, стили и React-компоненты
tests/              — браузерные сценарии, адаптивность и проверки данных
```

Зависимости устанавливаются из корня; используется один `package-lock.json`. Сервер и административная панель пока не реализованы. Для будущего `admin` нужно добавить npm workspace и зависимость `@three-pies/ui-kit`.

[Описание клиента](client/README.md) · [Документация UI-kit](packages/ui-kit/README.md) · [Проверки и ограничения](client/docs/verification.md)
