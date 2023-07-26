import mongoose from 'mongoose';

import {dbConfig  as config } from '../../Config/config.js';

console.log(config);

mongoose.connect(config.url, { user: config.user, pass: config.password });

export default mongoose.connection;