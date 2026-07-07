require("dotenv").config({
    path: ".env.test"
});

console.log(process.env.DATABASE_URL);