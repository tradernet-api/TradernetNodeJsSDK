/**
 * WARNING: This places a LIVE trade when uncommented.
 */
import { createClient } from './bootstrap.js';

const tn = await createClient();
const orders = await tn.orders().current(true);
console.log(JSON.stringify(orders, null, 2));

// await tn.orders().buy('AAPL.US', 1, 0);
