const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to the app
  await page.goto('http://localhost:5177', { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Wait for login form
  await page.waitForSelector('input[type="text"]', { timeout: 5000 });
  
  // Fill in login credentials (assuming default test user)
  const usernameInputs = await page.locator('input[type="text"]').all();
  const passwordInputs = await page.locator('input[type="password"]').all();
  
  if (usernameInputs.length > 0 && passwordInputs.length > 0) {
    await usernameInputs[0].fill('testuser');
    await passwordInputs[0].fill('password123');
    
    // Click login button
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Login')) {
        await btn.click();
        await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
        break;
      }
    }
  }
  
  // Wait a moment for page to load
  await page.waitForTimeout(2000);
  
  // Take screenshot before modal
  await page.screenshot({ path: 'before-modal.png' });
  
  // Look for the 'Add User' button
  const addUserBtn = await page.locator('button:has-text("+ Add User")').first();
  if (await addUserBtn.isVisible()) {
    await addUserBtn.click();
    
    // Wait for modal to appear
    await page.waitForSelector('.fixed.inset-0', { timeout: 3000 });
    
    // Take screenshot of modal
    await page.screenshot({ path: 'modal-open.png' });
    
    // Fill in the form
    const inputs = await page.locator('input').all();
    if (inputs.length >= 3) {
      await inputs[0].fill('newuser');
      await inputs[1].fill('newuser@test.com');
      await inputs[2].fill('password456');
    }
    
    // Take screenshot with filled form
    await page.screenshot({ path: 'modal-filled.png' });
    
    // Click the Create button
    const createBtn = await page.locator('button:has-text("Create")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      // Wait for modal to close
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'after-submit.png' });
    }
  }
  
  await browser.close();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
