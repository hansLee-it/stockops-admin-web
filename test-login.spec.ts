import { test, expect } from '@playwright/test';

test('login scenario test', async ({ page }) => {
  // Enable console and network logging
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('request', request => console.log('REQUEST:', request.method(), request.url()));
  page.on('response', response => console.log('RESPONSE:', response.status(), response.url()));

  console.log('=== Starting login test ===');
  
  // Navigate to login page
  await page.goto('http://192.168.0.11/login');
  console.log('Navigated to login page');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of initial state
  await page.screenshot({ path: '/tmp/login-initial.png' });
  console.log('Screenshot saved: /tmp/login-initial.png');
  
  // Fill in login form
  await page.fill('input#email', 'admin@stockops.com');
  await page.fill('input#password', 'admin123');
  console.log('Filled login form');
  
  // Click login button
  await page.click('button[type="submit"]');
  console.log('Clicked login button');
  
  // Wait for navigation or error
  try {
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log('SUCCESS: Navigated to dashboard');
  } catch (e) {
    console.log('Did not navigate to dashboard, checking current URL...');
  }
  
  // Check current URL
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  // Take screenshot after login attempt
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/login-after.png' });
  console.log('Screenshot saved: /tmp/login-after.png');
  
  // Check localStorage for auth token
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  });
  console.log('localStorage contents:', localStorage);
  
  // Check if auth-storage exists
  if (localStorage['auth-storage']) {
    const authData = JSON.parse(localStorage['auth-storage']);
    console.log('Auth state:', {
      hasToken: !!authData.state?.token,
      hasUser: !!authData.state?.user,
      userEmail: authData.state?.user?.email
    });
  } else {
    console.log('ERROR: auth-storage not found in localStorage');
  }
  
  console.log('=== Test completed ===');
});