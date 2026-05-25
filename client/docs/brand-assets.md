# Логотип

За основу взят `Three-pies-light.png` из исходного комплекта пекарни
`Three-pies-logo`. Контуры перенесены из соответствующего векторного
`ai/Three-pies-light.ai` (PDF-совместимый Adobe Illustrator), без растровой
трассировки или замены шрифтов. Сохранены надписи, горы и круговая композиция.

Цвета из `packages/ui-kit/src/tokens.css`:

- Основной: бордовый `#852C32`, золотистый `#B48C50`
- Для тёмного фона: молочный `#FFFCF7`, золотистый `#B48C50`

В `client/public/images/brand/` находятся `logo` и `logo-light` в форматах
SVG, PNG и WebP. В интерфейсе используется SVG; PNG и WebP имеют прозрачный
фон и размер 1024 × 1040. Иконки сайта находятся в `client/public/`:
`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`.

Вкладка браузера использует только векторный `favicon.svg` с `sizes="any"`.
PNG 32 × 32 оставлен как экспортируемый ресурс, но не подключается через
`rel="icon"`. Для Apple Touch Icon используется PNG 180 × 180.

Для повторного экспорта растровых форматов из SVG:

```sh
node client/scripts/export-brand-assets.mjs
```

Требуется Chromium для Playwright. Можно указать установленный браузер через
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
