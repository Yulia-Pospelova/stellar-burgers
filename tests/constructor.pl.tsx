import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const ingredientsHar = fileURLToPath(
  new URL('./mocks/ingredients.har', import.meta.url)
);

const bunName = 'Краторная булка N-200i';
const fillingName = 'Биокотлета из марсианской Магнолии';
const orderNumber = 12345;

const userResponse = {
  success: true,
  user: {
    email: 'test@example.com',
    name: 'Тестовый пользователь',
  },
};

const orderResponse = {
  success: true,
  name: 'Краторный бургер',
  order: {
    _id: '000000000000000000000001',
    status: 'done',
    name: 'Краторный бургер',
    createdAt: '2026-10-14T00:00:00.000Z',
    updatedAt: '2026-10-14T00:00:01.000Z',
    number: orderNumber,
    ingredients: [],
  },
};

const getIngredientCard = (page: Page, name: string): Locator =>
  page.getByTestId('ingredients-content').locator('li').filter({ hasText: name });

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const getModal = (page: Page): Locator => page.locator('#modals');

test.beforeEach(async ({ context, page }) => {
  await page.routeFromHAR(ingredientsHar, { url: '**/api/ingredients' });
  await page.route('**/api/auth/user', (route) => route.fulfill({ json: userResponse }));
  await page.route('**/api/orders', (route) => route.fulfill({ json: orderResponse }));

  await context.addCookies([
    {
      name: 'accessToken',
      value: 'Bearer test-access-token',
      url: 'http://localhost:4000',
    },
  ]);
  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'test-refresh-token');
  });

  await page.goto('/');
});

test.describe('страница конструктора бургера', () => {
  test('ингредиенты загружаются с подменённого эндпоинта', async ({ page }) => {
    await expect(page.getByTestId('ingredients-content')).toContainText(bunName);
    await expect(page.getByTestId('ingredients-content')).toContainText(fillingName);
  });

  test('булка добавляется в конструктор сверху и снизу', async ({ page }) => {
    await addIngredient(page, bunName);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(bunName);
    await expect(page.getByTestId('constructor-bun-2')).toContainText(bunName);
  });

  test('начинка добавляется в конструктор', async ({ page }) => {
    await addIngredient(page, fillingName);

    await expect(page.getByTestId('constructor-ingredients')).toContainText(fillingName);
  });
});

test.describe('модальное окно ингредиента', () => {
  test('открывается по клику на ингредиент', async ({ page }) => {
    await getIngredientCard(page, bunName).getByRole('link').click();

    await expect(getModal(page)).toContainText('Детали ингредиента');
    await expect(getModal(page)).toContainText(bunName);
    await expect(page).toHaveURL(/\/ingredients\//);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await getIngredientCard(page, bunName).getByRole('link').click();
    await getModal(page).getByRole('button', { name: 'Закрыть' }).click();

    await expect(getModal(page)).toBeEmpty();
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await getIngredientCard(page, bunName).getByRole('link').click();
    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });

    await expect(getModal(page)).toBeEmpty();
  });
});

test.describe('оформление заказа', () => {
  test('заказ создаётся, конструктор очищается, окно закрывается', async ({ page }) => {
    await addIngredient(page, bunName);
    await addIngredient(page, fillingName);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(getModal(page).getByTestId('order-number')).toHaveText(
      String(orderNumber)
    );

    await expect(page.getByTestId('constructor')).toContainText('Выберите булки');
    await expect(page.getByTestId('constructor')).toContainText('Выберите начинку');

    await getModal(page).getByRole('button', { name: 'Закрыть' }).click();

    await expect(getModal(page)).toBeEmpty();
  });
});
