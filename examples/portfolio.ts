import { createClient } from './bootstrap.js';

const tn = await createClient();
const portfolio = await tn.portfolio().get();
console.log(portfolio);
