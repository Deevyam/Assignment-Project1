const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ruleRoutes = require('./routes/rulePath');

require('dotenv').config(); 

const app = express();

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect( process.env.DATABASE_URI, {});
    console.log(`Connected to MongoDB: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); 
  }
};
connectToDatabase();

app.use(cors());
app.use(express.json());

app.use('/api/rules', ruleRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
