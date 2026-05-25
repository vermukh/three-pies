import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  Icon,
  IconButton,
  Input,
  QuantityControl,
  Select,
  Table,
  Textarea,
  TextField,
} from "@three-pies/ui-kit";
import "./ui-kit-page.css";

const palette = [
  ["Молочный", "--ui-color-canvas", "#FFFCF7"],
  ["Бордовый", "--ui-color-primary", "#852C32"],
  ["Золотистый", "--ui-color-gold", "#B48C50"],
  ["Текст", "--ui-color-text", "#322E29"],
  ["Поверхность", "--ui-color-surface", "#F4EDE2"],
  ["Граница", "--ui-color-border", "#E9E1D5"],
];

export default function UIKitPage() {
  const [dialog, setDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  return (
    <main className="ui-kit-page">
      <header className="ui-kit-heading">
        <div>
          <p className="eyebrow">ТРИ ПИРОГА · ДИЗАЙН-СИСТЕМА</p>
          <h1>Тепло в каждой детали</h1>
          <p>
            Общие компоненты для клиентского сайта и административной панели.
          </p>
        </div>
        <a href="/">← К сайту</a>
      </header>
      <nav className="ui-kit-nav" aria-label="Разделы UI-kit">
        <a href="#kit-colors">Цвета</a>
        <a href="#kit-type">Типографика</a>
        <a href="#kit-buttons">Кнопки</a>
        <a href="#kit-fields">Формы</a>
        <a href="#kit-data">Данные и статусы</a>
        <a href="#kit-dialog">Диалоги</a>
      </nav>
      <section id="kit-colors">
        <h2>01 / Цвета</h2>
        <p>
          Брендовые цвета и семантические токены. Золотистый используется для
          декора, основной текст — тёмный.
        </p>
        <div className="ui-kit-palette">
          {palette.map(([name, token, hex]) => (
            <Card key={token}>
              <div
                className="ui-kit-swatch"
                style={{ background: `var(${token})` }}
              />
              <strong>{name}</strong>
              <code>{hex}</code>
              <small>{token}</small>
            </Card>
          ))}
        </div>
      </section>
      <section id="kit-type">
        <h2>02 / Типографика и ритм</h2>
        <div className="ui-kit-two">
          <Card>
            <span className="eyebrow">ВИТРИНА · GEORGIA</span>
            <h3 className="ui-kit-display">
              Традиции, которые
              <br />
              собирают за столом
            </h3>
            <p>Выразительные заголовки для эмоциональной подачи бренда.</p>
          </Card>
          <Card>
            <span className="eyebrow">ИНТЕРФЕЙС · GOLOS TEXT</span>
            <h3>Заказы, товары, покупатели</h3>
            <p>
              Основной текст — 14–16 px. Поля на мобильных — 16 px. Кнопки и
              значимые действия — не менее 44 px.
            </p>
            <div className="ui-kit-spacing">
              {[4, 8, 12, 16, 24, 32, 48].map((size) => (
                <span key={size}>
                  <i style={{ width: size, height: size }} />
                  {size}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>
      <section id="kit-buttons">
        <h2>03 / Кнопки и действия</h2>
        <Card>
          <div className="ui-kit-row">
            <Button onClick={() => setSaved(true)}>
              Сохранить <Icon name="check" size={18} />
            </Button>
            <Button variant="secondary" onClick={() => setSaved(false)}>
              Отменить
            </Button>
            <Button variant="ghost" onClick={() => setDialog(true)}>
              Подробнее <Icon name="arrow" size={18} />
            </Button>
            <Button variant="danger" onClick={() => setDialog(true)}>
              Удалить
            </Button>
          </div>
          <div className="ui-kit-row">
            <Button disabled>Недоступно</Button>
            <Button busy>Сохраняем</Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setDialog(true)}
            >
              Компактная
            </Button>
            <IconButton
              aria-label="Открыть пример диалога"
              onClick={() => setDialog(true)}
            >
              <Icon name="bag" />
            </IconButton>
            <QuantityControl
              value={quantity}
              onChange={setQuantity}
              name="Пример товара"
            />
          </div>
          {saved && (
            <Alert tone="success">
              Пример сохранён. Данные остаются в памяти страницы.
            </Alert>
          )}
        </Card>
      </section>
      <section id="kit-fields">
        <h2>04 / Поля и формы</h2>
        <div className="ui-kit-two">
          <Card>
            <TextField
              label="Название товара"
              value={name}
              onChange={(event) => setName(event.target.value)}
              hint="Укажите понятное покупателю название"
              placeholder="С осетинским сыром"
            />
            <TextField
              label="Телефон"
              type="tel"
              inputMode="tel"
              defaultValue="12345"
              error="Введите номер в формате +7 999 123-45-67"
            />
            <TextField label="Номер заказа" value="ТП-001" disabled />
          </Card>
          <Card>
            <label className="ui-kit-label" htmlFor="kit-category">
              Категория
            </label>
            <Select id="kit-category" defaultValue="pies">
              <option value="pies">Осетинские пироги</option>
              <option value="baklava">Пахлава</option>
              <option value="drinks">Напитки</option>
            </Select>
            <label className="ui-kit-label" htmlFor="kit-price">
              Цена, ₽
            </label>
            <Input id="kit-price" type="number" min={0} defaultValue={900} />
            <label className="ui-kit-label" htmlFor="kit-comment">
              Комментарий
            </label>
            <Textarea id="kit-comment" placeholder="Пожелания к заказу" />
          </Card>
        </div>
      </section>
      <section id="kit-data">
        <h2>05 / Статусы и таблицы</h2>
        <div className="ui-kit-row">
          <Badge>Новый</Badge>
          <Badge tone="warning">Готовится</Badge>
          <Badge tone="success">Завершён</Badge>
          <Badge tone="danger">Отменён</Badge>
        </div>
        <div className="ui-kit-alerts">
          <Alert>
            Информационное сообщение с пояснением следующего действия.
          </Alert>
          <Alert tone="warning">
            Проверьте наличие товара перед подтверждением.
          </Alert>
          <Alert tone="danger">
            Не удалось сохранить изменения. Попробуйте ещё раз.
          </Alert>
        </div>
        <Table label="Пример таблицы заказов">
          <thead>
            <tr>
              <th scope="col">Заказ</th>
              <th scope="col">Получение</th>
              <th scope="col">Сумма</th>
              <th scope="col">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ТП-001</td>
              <td>Доставка</td>
              <td>2 950 ₽</td>
              <td>
                <Badge tone="warning">Готовится</Badge>
              </td>
            </tr>
            <tr>
              <td>ТП-002</td>
              <td>Самовывоз</td>
              <td>1 800 ₽</td>
              <td>
                <Badge tone="success">Завершён</Badge>
              </td>
            </tr>
          </tbody>
        </Table>
      </section>
      <section id="kit-dialog">
        <h2>06 / Диалог и иконки</h2>
        <Card>
          <p>
            Диалог удерживает фокус, закрывается по Escape и возвращает фокус на
            исходную кнопку. На телефоне занимает доступную высоту экрана.
          </p>
          <div className="ui-kit-row">
            <Button onClick={() => setDialog(true)}>Открыть диалог</Button>
            {[
              "bag",
              "truck",
              "pin",
              "phone",
              "clock",
              "heart",
              "leaf",
              "wheat",
              "grid",
              "menu",
            ].map((name) => (
              <span className="ui-kit-icon" key={name} title={name}>
                <Icon name={name} size={24} />
              </span>
            ))}
          </div>
        </Card>
      </section>
      <footer className="ui-kit-footer">
        <code>@three-pies/ui-kit</code>
        <p>
          Исходники: packages/ui-kit · Все данные на этой странице
          демонстрационные.
        </p>
      </footer>
      {dialog && (
        <Dialog title="Пример диалога" onClose={() => setDialog(false)}>
          <p className="ui-kit-dialog-copy">
            Общий компонент для карточки товара, подтверждения действия или
            формы в административной панели.
          </p>
          <div className="ui-kit-row">
            <Button onClick={() => setDialog(false)}>Понятно</Button>
            <Button variant="secondary" onClick={() => setDialog(false)}>
              Закрыть
            </Button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
