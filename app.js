import { config } from 'dotenv';
config();

import ExpressApp from './express.js';

const port = parseInt(process.env.PORT ?? '3080');

new ExpressApp().listen(port);
