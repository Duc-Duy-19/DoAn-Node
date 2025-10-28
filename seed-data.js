/**
 * Script để tạo dữ liệu mẫu ban đầu vào database
 * Chạy: node seed-data.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/NNPTUD-S5')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import các schema
const Role = require('./schemas/roles');
const User = require('./schemas/users');
const Category = require('./schemas/categories');
const Product = require('./schemas/products');

async function seedData() {
  try {
    console.log('🌱 Starting seed data...\n');

    // 1. Xóa dữ liệu hiện có (tùy chọn - comment dòng này nếu muốn giữ dữ liệu cũ)
    console.log('🗑️  Clearing existing data...');
    await Role.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared\n');

    // 2. Tạo các Role
    console.log('📝 Creating roles...');
    const adminRole = await Role.create({
      name: 'ADMIN',
      description: 'Administrator with full access'
    });

    const modRole = await Role.create({
      name: 'MOD',
      description: 'Moderator with limited admin access'
    });

    const userRole = await Role.create({
      name: 'USER',
      description: 'Regular user'
    });

    console.log('✅ Roles created:', {
      ADMIN: adminRole._id,
      MOD: modRole._id,
      USER: userRole._id
    });
    console.log('');

    // 3. Tạo các User
    console.log('👥 Creating users...');
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: adminRole._id,
      fullName: 'Administrator'
    });

    const modUser = await User.create({
      username: 'moderator',
      email: 'mod@example.com',
      password: 'Moderator@123',
      role: modRole._id,
      fullName: 'Moderator User'
    });

    const normalUser = await User.create({
      username: 'testuser',
      email: 'user@example.com',
      password: 'User@123',
      role: userRole._id,
      fullName: 'Test User'
    });

    console.log('✅ Users created:');
    console.log('  - admin / Admin@123 (ADMIN)');
    console.log('  - moderator / Moderator@123 (MOD)');
    console.log('  - testuser / User@123 (USER)');
    console.log('');

    // 4. Tạo các danh mục
    console.log('📦 Creating categories...');
    
    const electronicsCategory = await Category.create({
      name: 'Điện tử',
      description: 'Thiết bị điện tử',
      imageURL: ''
    });

    const phoneCategory = await Category.create({
      name: 'Điện thoại',
      description: 'Điện thoại di động, smartphone',
      imageURL: '',
      parentCategory: electronicsCategory._id
    });

    const laptopCategory = await Category.create({
      name: 'Laptop',
      description: 'Máy tính xách tay',
      imageURL: '',
      parentCategory: electronicsCategory._id
    });

    const fashionCategory = await Category.create({
      name: 'Thời trang',
      description: 'Quần áo, phụ kiện',
      imageURL: ''
    });

    const booksCategory = await Category.create({
      name: 'Sách',
      description: 'Sách, tạp chí',
      imageURL: ''
    });

    console.log('✅ Categories created:', {
      electronics: electronicsCategory._id,
      phones: phoneCategory._id,
      laptops: laptopCategory._id,
      fashion: fashionCategory._id,
      books: booksCategory._id
    });
    console.log('');

    // 5. Tạo các sản phẩm
    console.log('🛍️  Creating products...');

    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Apple iPhone 15 Pro Max 256GB - Titan Tự Nhiên',
        price: 34990000,
        stock: 50,
        imageURLs: [],
        category: phoneCategory._id
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung Galaxy S24 Ultra 12GB 256GB',
        price: 29990000,
        stock: 30,
        imageURLs: [],
        category: phoneCategory._id
      },
      {
        name: 'MacBook Pro 14 M3',
        description: 'MacBook Pro 14 inch M3 8GB 512GB',
        price: 45990000,
        stock: 20,
        imageURLs: [],
        category: laptopCategory._id
      },
      {
        name: 'Dell XPS 13',
        description: 'Dell XPS 13 Plus Intel Core i7 16GB 512GB',
        price: 35990000,
        stock: 15,
        imageURLs: [],
        category: laptopCategory._id
      },
      {
        name: 'Áo thun Nam Basic',
        description: 'Áo thun nam cotton cao cấp',
        price: 199000,
        stock: 100,
        imageURLs: [],
        category: fashionCategory._id
      },
      {
        name: 'Quần Jean Nam Slim Fit',
        description: 'Quần jean nam form slim fit co giãn',
        price: 450000,
        stock: 80,
        imageURLs: [],
        category: fashionCategory._id
      },
      {
        name: 'Sách: Đắc Nhân Tâm',
        description: 'How to Win Friends and Influence People - Dale Carnegie',
        price: 89000,
        stock: 200,
        imageURLs: [],
        category: booksCategory._id
      },
      {
        name: 'Sách: Sapiens',
        description: 'Lược Sử Loài Người - Yuval Noah Harari',
        price: 120000,
        stock: 150,
        imageURLs: [],
        category: booksCategory._id
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created`);
    console.log('');

    console.log('🎉 Seed data completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - Roles: 3');
    console.log('  - Users: 3');
    console.log('  - Categories: 5');
    console.log('  - Products: 8');
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('  ADMIN:     username: admin       password: Admin@123');
    console.log('  MOD:       username: moderator   password: Moderator@123');
    console.log('  USER:      username: testuser    password: User@123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Chạy seed
seedData();

