# PWA Install Test Script

## Browser Console Commands

Open your browser console (F12) and run these commands to test PWA installation:

### 1. Check if PWA is installable:
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? '✅ Registered' : '❌ Not registered');
  if (reg) console.log('Scope:', reg.scope);
});

// Check manifest
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(m => {
    console.log('✅ Manifest:', m);
    console.log('Icons:', m.icons.length, 'icons found');
  })
  .catch(e => console.error('❌ Manifest error:', e));

// Check if installable
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ PWA install prompt available!');
  console.log('Run: deferredPrompt.prompt() to trigger install');
});

// Manual trigger (if prompt available)
window.triggerPWAInstall = async () => {
  if (deferredPrompt) {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('User choice:', outcome);
    deferredPrompt = null;
  } else {
    console.log('❌ Install prompt not available. Try:');
    console.log('1. Wait a few seconds and interact with the page');
    console.log('2. Check Chrome menu → Install Web3News');
    console.log('3. Ensure you\'re on HTTPS (not localhost)');
  }
};
```

### 2. Trigger Install Prompt:
```javascript
// After running the above, trigger install:
triggerPWAInstall();
```

### 3. Check PWA Status:
```javascript
// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ PWA is already installed!');
} else {
  console.log('ℹ️ PWA not installed yet');
}

// Check service worker status
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => {
    console.log('  - Scope:', reg.scope);
    console.log('  - State:', reg.active?.state || 'No active worker');
  });
});
```

## Testing Steps

1. **Open http://localhost:3000** in Chrome/Edge
2. **Open DevTools** (F12) → Console tab
3. **Run the check commands** above
4. **Look for "Install App" button** in the header
5. **Click the button** to trigger install prompt
6. **Or run** `triggerPWAInstall()` in console

## Expected Behavior

### On Localhost (HTTP):
- ✅ Service Worker registers
- ✅ Manifest loads
- ⚠️ Install prompt may not appear automatically
- ✅ Manual install via browser menu works
- ✅ Install button shows with instructions

### On GitHub Pages (HTTPS):
- ✅ Service Worker registers
- ✅ Manifest loads
- ✅ Install prompt appears automatically after user engagement
- ✅ Install button triggers prompt programmatically
- ✅ Full PWA functionality

## Troubleshooting

If install prompt doesn't appear:

1. **Check HTTPS**: Install prompt requires HTTPS (works on GitHub Pages)
2. **User Engagement**: Interact with page for 30+ seconds
3. **Already Installed**: Check if PWA is already installed
4. **Browser Support**: Chrome/Edge have best PWA support
5. **Manifest Errors**: Check DevTools → Application → Manifest for errors

