const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-form').then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  
  await mongoose.connection.db.collection('users').deleteMany({ email: 'admin@gmail.com' });
  
  await mongoose.connection.db.collection('users').insertOne({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: hash,
    role: 'admin',
    createdAt: new Date()
  });
  
  console.log('✅ Admin created in users collection!');
  process.exit();
});