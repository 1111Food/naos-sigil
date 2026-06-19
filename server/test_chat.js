const http = require('http');

const data = JSON.stringify({ message: "Hola Sigil", userId: "099a52de-0d2d-4d37-bbb7-573e047bb0a0" }); // Needs a valid user ID or it will fail? Wait, the API relies on auth headers!
