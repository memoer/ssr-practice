import express from 'express';

const app = express();

const handleListening = () => {
  console.log('listening server -> 4000');
};

app.listen(4000, handleListening);
