import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seriecentrum';

// Extract category from URL or name
function extractCategory(product) {
  // Try to extract from URL path
  if (product.url) {
    const urlMatch = product.url.match(/path=(\d+_\d+_\d+)/);
    if (urlMatch) {
      // Map common paths to categories
      const path = urlMatch[1];
      if (path.includes('70_75')) return 'Serietidningar';
      if (path.includes('70_76')) return 'Seriealbum';
      if (path.includes('70_77')) return 'Magic: The Gathering';
      if (path.includes('70_78')) return 'PVC Figurer';
      if (path.includes('70_79')) return 'Brädspel';
    }
  }
  
  // Try to extract from name
  const name = (product.name || '').toLowerCase();
  if (name.includes('fantomen') || name.includes('donald') || name.includes('kalle')) {
    return 'Serietidningar';
  }
  if (name.includes('album') || name.includes('samling')) {
    return 'Seriealbum';
  }
  if (name.includes('magic') || name.includes('mtg')) {
    return 'Magic: The Gathering';
  }
  
  return 'Serier'; // Default category
}

// Parse price from "10Kr" format
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.toString().match(/(\d+)/);
  return match ? parseFloat(match[1]) : 0;
}

// Group products by name and merge conditions
function processProducts(rawProducts) {
  const productMap = new Map();
  
  for (const product of rawProducts) {
    const name = (product.name || '').trim();
    if (!name) continue;
    
    if (!productMap.has(name)) {
      // Create new product
      const category = extractCategory(product);
      const price = parsePrice(product.price);
      const image = product.images && product.images.length > 0 ? product.images[0] : '';
      
      productMap.set(name, {
        name: name,
        description: product.description || '',
        price: price,
        category: category,
        image: image,
        stock: parseInt(product.availability) || 0,
        originalUrl: product.url || '',
        availableConditions: [],
        rating: product.rating || null,
        reviewsCount: product.reviews_count || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Add condition if it exists
    const existing = productMap.get(name);
    if (product.condition) {
      const conditionPrice = parsePrice(product.price);
      const conditionStock = parseInt(product.availability) || 0;
      
      // Check if condition already exists
      const existingCondition = existing.availableConditions.find(
        c => c.condition === product.condition
      );
      
      if (!existingCondition) {
        existing.availableConditions.push({
          condition: product.condition,
          price: conditionPrice,
          stock: conditionStock,
          url: product.url || ''
        });
      } else {
        // Update stock if higher
        if (conditionStock > existingCondition.stock) {
          existingCondition.stock = conditionStock;
        }
      }
      
      // Update total stock
      existing.stock = existing.availableConditions.reduce(
        (sum, c) => sum + c.stock, 0
      );
      
      // Update price to lowest available
      const minPrice = Math.min(
        ...existing.availableConditions.map(c => c.price).filter(p => p > 0)
      );
      if (minPrice > 0) {
        existing.price = minPrice;
      }
    }
  }
  
  return Array.from(productMap.values());
}

async function importProducts() {
  let client;
  
  try {
    console.log('📦 Läser products.json...');
    const fileContent = fs.readFileSync('products.json', 'utf8');
    const rawProducts = JSON.parse(fileContent);
    console.log(`✅ Läs ${rawProducts.length} produkter från fil`);
    
    console.log('🔄 Bearbetar produkter...');
    const processedProducts = processProducts(rawProducts);
    console.log(`✅ Bearbetade till ${processedProducts.length} unika produkter`);
    
    console.log('🔌 Ansluter till MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    console.log('✅ Ansluten till MongoDB');
    
    // Clear existing products
    console.log('🗑️  Rensar befintliga produkter...');
    await db.collection('products').deleteMany({});
    console.log('✅ Befintliga produkter borttagna');
    
    // Insert products in batches
    const batchSize = 1000;
    let inserted = 0;
    
    console.log('📥 Importerar produkter...');
    for (let i = 0; i < processedProducts.length; i += batchSize) {
      const batch = processedProducts.slice(i, i + batchSize);
      await db.collection('products').insertMany(batch);
      inserted += batch.length;
      console.log(`   Importerat ${inserted} / ${processedProducts.length} produkter...`);
    }
    
    // Create indexes
    console.log('📊 Skapar index...');
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ price: 1 });
    console.log('✅ Index skapade');
    
    // Get category statistics
    const categories = await db.collection('products').distinct('category');
    console.log('\n📊 Kategorier:');
    for (const category of categories.sort()) {
      const count = await db.collection('products').countDocuments({ category });
      console.log(`   ${category}: ${count} produkter`);
    }
    
    console.log(`\n✅ Import klar! ${inserted} produkter importerade till databasen.`);
    
  } catch (error) {
    console.error('❌ Fel vid import:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB-anslutning stängd');
    }
  }
}

importProducts();
