import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://hiqa2.pooraa.net/');
    await page.getByRole('textbox', { name: 'Email ID' }).click();
    await page.getByRole('textbox', { name: 'Email ID' }).fill(process.env.BUSY_TEAM_EMAIL || '');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.BUSY_TEAM_PASSWORD || '');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'menu' }).click();
    await page.getByText('bar_chartReport').click();
    await page.getByRole('link', { name: 'Busy Online Report' }).click();
    await page.getByRole('combobox').first().selectOption('Subscription Count Report');
    await page.getByRole('combobox').first().selectOption('Dealer Count Report');
    await page.getByRole('combobox').first().selectOption('Statewise Count Report');
    await page.getByRole('combobox').first().selectOption('Disabled and Cancelled Count Report');
    await page.getByRole('combobox').nth(1).selectOption('Paid');
    await page.getByRole('combobox').nth(1).selectOption('FOC');
    await page.getByRole('combobox').nth(1).selectOption('All');
    await page.getByRole('button', { name: 'date_range' }).click();
    await page.getByRole('button', { name: '3' }).nth(2).click();
    await page.getByRole('button', { name: '12' }).first().click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Submit' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Select' }).click();
    await page1.getByRole('button', { name: 'Select' }).click();
    await page1.getByRole('cell', { name: 'Download' }).first().click();
});