// Stub for Clerk server-actions during static export
// ClerkProvider tries to import invalidateCacheAction which has "use server" directive
// This stub prevents the build error while maintaining functionality
// CRITICAL: Must match the exact export signature from server-actions.js

async function invalidateCacheAction() {
  // No-op for static export - cache invalidation not needed
  // This function is called by ClerkProvider but doesn't break anything if it's a no-op
  return Promise.resolve();
}

export {
  invalidateCacheAction
};
