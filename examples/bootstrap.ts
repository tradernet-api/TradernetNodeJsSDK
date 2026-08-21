import { Tradernet } from '../dist/index.js';

export async function createClient(): Promise<Tradernet> {
  return Tradernet.fromEnv().init();
}
