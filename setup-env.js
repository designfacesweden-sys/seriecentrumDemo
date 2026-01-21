import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🔐 MongoDB Atlas Setup\n');
  console.log('Du behöver ditt MongoDB Atlas kluster-URL.');
  console.log('Hitta det i MongoDB Atlas: Connect -> Connect your application\n');
  
  const clusterUrl = await question('Ange ditt kluster-URL (t.ex. cluster0.xxxxx.mongodb.net): ');
  
  if (!clusterUrl || clusterUrl.trim() === '') {
    console.log('❌ Kluster-URL krävs!');
    rl.close();
    process.exit(1);
  }

  const envContent = `# MongoDB Atlas Connection String
# Auto-generated - DO NOT commit to git
MONGODB_URI=mongodb+srv://designfacesweden_db_user:SIsAb7vrekjNAk3g@${clusterUrl.trim()}/seriecentrum?retryWrites=true&w=majority

# Server Port
PORT=3001

# Environment
NODE_ENV=development
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env-fil skapad!');
    console.log('⚠️  VIKTIGT: .env är redan i .gitignore och kommer INTE att committas.\n');
    console.log('Du kan nu starta servern med: npm run server\n');
  } catch (error) {
    console.error('❌ Kunde inte skapa .env-fil:', error.message);
  }
  
  rl.close();
}

setup();
