process.on('uncaughtException', (error) => {
    console.log(error.name);
    console.log(error.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
});
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const app = require('./app');
const mongoose = require('mongoose');

// connect database
const DATABASE = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
    .connect(DATABASE, {
        autoIndex: true,
    })
    .then((conn) => {
        console.log('database connection established succsesful !');
    });

// start webserver
const port = process.env.SERVER_PORT || 8000;
const server = app.listen(port, () => {
    console.log(`server is running and listening on port ${port}`);
});

process.on('unhandledRejection', (error) => {
    console.log(error.name);
    console.log(error.message);
    console.error('Unhandled Rejection! Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated!');
    });
});
