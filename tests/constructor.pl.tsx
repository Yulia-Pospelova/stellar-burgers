import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const harPath = (fileName: string): string =>
  fileURLToPath(new URL(`./hars/${fileName}`, import.meta.url));

const bunName = 'Краторная булка N-200i';
const orderNumber = 12345;

const filling = {
  name: 'Биокотлета из марсианской Магнолии',
  calories: 4242,
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
};

const getIngredientCard = (page: Page, name: string): Locator =>
  page.getByTestId('ingredients-content').locator('li').filter({ hasText: name });

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const getModal = (page: Page): Locator => page.locator('#modals');

test.beforeEach(async ({ context, page }) => {
  await page.routeFromHAR(harPath('ingredients.har'), { url: '**/api/ingredients' });
  await page.routeFromHAR(harPath('user.har'), { url: '**/api/auth/user' });
  await page.routeFromHAR(harPath('order.har'), { url: '**/api/orders' });

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
  test('ингредиенты загружаются из подменённого ответа сервера', async ({ page }) => {
    await expect(page.getByTestId('ingredients-content')).toContainText(bunName);
    await expect(page.getByTestId('ingredients-content')).toContainText(filling.name);
  });

  test('булка добавляется в конструктор сверху и снизу', async ({ page }) => {
    await addIngredient(page, bunName);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(bunName);
    await expect(page.getByTestId('constructor-bun-2')).toContainText(bunName);
  });

  test('начинка добавляется в конструктор', async ({ page }) => {
    await addIngredient(page, filling.name);

    await expect(page.getByTestId('constructor-ingredients')).toContainText(
      filling.name
    );
  });
});

test.describe('модальное окно ингредиента', () => {
  test('открывается по клику на ингредиент', async ({ page }) => {
    await getIngredientCard(page, bunName).getByRole('link').click();

    await expect(getModal(page)).toContainText('Детали ингредиента');
    await expect(getModal(page)).toContainText(bunName);
    await expect(page).toHaveURL(/\/ingredients\//);
  });

  test('показывает данные того ингредиента, по которому был клик', async ({ page }) => {
    await getIngredientCard(page, filling.name).getByRole('link').click();

    const modal = getModal(page);

    await expect(modal).toContainText(filling.name);
    await expect(modal).toContainText(String(filling.calories));
    await expect(modal).toContainText(String(filling.proteins));
    await expect(modal).toContainText(String(filling.fat));
    await expect(modal).toContainText(String(filling.carbohydrates));
    await expect(modal).not.toContainText(bunName);
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
    await addIngredient(page, filling.name);

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
