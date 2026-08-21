import { Tradernet } from '../dist/index.js';

export async function createClient() {
  return Tradernet.fromEnv().init();
}
