// PWA Test Script - Run in Browser Console
// Site: https://clkhoo5211.github.io/scaling-octo-garbanzo/

(async function testPWA() {
  console.log('🔍 PWA Test Starting...\n');
  
  const results = {
    serviceWorker: {},
    manifest: {},
    install: {},
    pwa: {}
  };
  
  // 1. Test Service Worker
  console.log('1️⃣ Testing Service Worker...');
  if ('serviceWorker' in navigator) {
    results.serviceWorker.supported = true;
    const regs = await navigator.serviceWorker.getRegistrations();
    results.serviceWorker.registered = regs.length > 0;
    if (regs.length > 0) {
      results.serviceWorker.scope = regs[0].scope;
      results.serviceWorker.state = regs[0].active?.state || regs[0].installing?.state || 'no active worker';
      console.log('   ✅ Service Worker registered:', regs[0].scope);
      console.log('   📍 State:', results.serviceWorker.state);
    } else {
      console.log('   ⚠️ No Service Worker registered');
    }
  } else {
    results.serviceWorker.supported = false;
    console.log('   ❌ Service Worker not supported');
  }
  
  // 2. Test Manifest
  console.log('\n2️⃣ Testing Manifest...');
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    const manifestUrl = manifestLink.getAttribute('href');
    results.manifest.link = manifestUrl;
    console.log('   ✅ Manifest link found:', manifestUrl);
    
    try {
      const response = await fetch(manifestUrl);
      const manifest = await response.json();
      results.manifest.valid = true;
      results.manifest.name = manifest.name;
      results.manifest.short_name = manifest.short_name;
      results.manifest.icons = manifest.icons?.length || 0;
      console.log('   ✅ Manifest valid');
      console.log('   📱 Name:', manifest.name);
      console.log('   🎯 Short Name:', manifest.short_name);
      console.log('   🖼️ Icons:', manifest.icons?.length || 0);
    } catch (e) {
      results.manifest.error = e.message;
      console.log('   ❌ Manifest error:', e.message);
    }
  } else {
    console.log('   ❌ Manifest link not found');
  }
  
  // 3. Test Install Prompt
  console.log('\n3️⃣ Testing Install Prompt...');
  if (typeof window.triggerPWAInstall === 'function') {
    results.install.handlerAvailable = true;
    console.log('   ✅ Install handler available: window.triggerPWAInstall()');
  } else {
    results.install.handlerAvailable = false;
    console.log('   ⚠️ Install handler not found');
  }
  
  // Check for deferred prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    results.install.promptAvailable = true;
    console.log('   ✅ Install prompt event received');
  });
  
  // Check if already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  if (isStandalone || isFullscreen || isMinimalUI || (window.navigator as any).standalone === true) {
    results.install.installed = true;
    console.log('   ✅ PWA is installed (standalone mode)');
  } else {
    results.install.installed = false;
    console.log('   ℹ️ PWA not installed (browser mode)');
  }
  
  // 4. Test PWA Features
  console.log('\n4️⃣ Testing PWA Features...');
  results.pwa.standalone = isStandalone;
  results.pwa.fullscreen = isFullscreen;
  results.pwa.minimalUI = isMinimalUI;
  
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
  results.pwa.appleIcon = appleIcon ? appleIcon.getAttribute('href') : null;
  
  console.log('   📱 Standalone mode:', isStandalone);
  console.log('   🖥️ Fullscreen mode:', isFullscreen);
  console.log('   🍎 Apple icon:', results.pwa.appleIcon || 'not found');
  
  // 5. Summary
  console.log('\n📊 PWA Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Service Worker:', results.serviceWorker.registered ? '✅ Registered' : '⚠️ Not registered');
  console.log('Manifest:', results.manifest.valid ? '✅ Valid' : '❌ Invalid');
  console.log('Install Handler:', results.install.handlerAvailable ? '✅ Available' : '❌ Not available');
  console.log('PWA Installed:', results.install.installed ? '✅ Yes' : '❌ No');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n💡 To trigger install, run:');
  console.log('   window.triggerPWAInstall()');
  
  return results;
})();

