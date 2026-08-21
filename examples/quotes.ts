import { createClient } from './bootstrap.js';

const tn = await createClient();
const quotes = await tn.quotes().get(['AAPL.US']);
console.log(quotes);
