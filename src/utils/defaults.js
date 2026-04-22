/**
 * Seed default values into localStorage on first launch.
 * Keys are only written if they are not already present,
 * so staff can still override them in Settings.
 */
const DEFAULTS = {
  pexels_api_key:      'iBIIc34O14733GmxRBhXB4Y4OGYckgCrsCiI7tEyafqQeXp2t6OW8lnE',
  unsplash_access_key: '_UeY3RUaQCfABlhNe8cbaLAfSZ-5R1TDFLWXoQtCyjY',
}

export function initAppDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, value)
    }
  }
}
