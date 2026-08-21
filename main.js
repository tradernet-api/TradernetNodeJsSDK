import { Tradernet } from './dist/index.js';

const tn = await Tradernet.fromEnv().init();
const quotes = await tn.quotes().get(['AAPL.US']);
console.log(JSON.stringify(quotes, null, 2));
