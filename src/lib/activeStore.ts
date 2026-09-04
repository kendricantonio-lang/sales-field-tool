export const ACTIVE_STORE_KEY = 'sft.activeStoreId';

/** Pin a store as "active" so the Stores tab opens with it already expanded. */
export function pinStoreActive(id: string): void {
  try {
    localStorage.setItem(ACTIVE_STORE_KEY, id);
  } catch {
    // localStorage unavailable — the pin just won't survive a reload.
  }
}
