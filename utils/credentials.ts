/**
 * Shared access to the optional login credentials used by the tests.
 *
 * The public Demo Web Shop has no built-in account, so credentials are read
 * from the TEST_EMAIL / TEST_PASSWORD env vars. Tests that need a real login
 * skip themselves when `hasCredentials` is false.
 */
export const TEST_EMAIL = process.env.TEST_EMAIL;
export const TEST_PASSWORD = process.env.TEST_PASSWORD;
export const hasCredentials = !!TEST_EMAIL && !!TEST_PASSWORD;