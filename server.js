const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('./dist'));

app.listen(PORT,()=>{
    console.log(`Server started listening on port ${PORT}...`);
})

app.get('/',(req,res)=>{
    res.sendFile('./dist/index.html');
})