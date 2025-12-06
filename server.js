
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import handlers
import signinHandler from './api/auth/signin.js';
import verifyHandler from './api/auth/verify.js';
import changePasswordHandler from './api/auth/change-password.js';
import signupHandler from './api/auth/signup.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper to wrap Vercel-style handlers for Express
const wrapHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('Error in handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Routes
app.post('/api/auth/signin', wrapHandler(signinHandler));
app.get('/api/auth/verify', wrapHandler(verifyHandler));
app.post('/api/auth/change-password', wrapHandler(changePasswordHandler));
app.post('/api/auth/signup', wrapHandler(signupHandler));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
