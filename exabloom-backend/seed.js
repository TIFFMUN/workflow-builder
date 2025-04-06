const fs = require('fs');  // File system module for reading files
const csv = require('csv-parser');  // CSV parser module to read CSV files
const { faker } = require('@faker-js/faker');  // Faker library for generating fake data
const db = require('./db');  // Database connection (assumed to be set up in db.js)

const TOTAL_CONTACTS = 100000;  // Total number of contacts to seed
const TOTAL_MESSAGES = 5000000;  // Total number of messages to seed
const BATCH_SIZE = 1000;  // Batch size for seeding messages

let messageTemplates = [];  // Array to store message content from CSV

// Read messages from CSV and store them in the messageTemplates array
async function loadMessagesFromCSV() {
  return new Promise((resolve, reject) => {
    const rows = [];  // Temporary array to hold rows from CSV
    fs.createReadStream('./message_content.csv')  // Ensure correct path to your CSV
      .pipe(csv())  // Pipe CSV data to csv-parser
      .on('data', (row) => {
        console.log('Row read:', row);  // Log each row
        if (row.content) {
          messageTemplates.push(row.content);  // Add message content to array
        } else {
          console.log('No "content" field in row:', row);  // Log missing content field
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${messageTemplates.length} messages from CSV`);
        console.log('Message templates:', messageTemplates);  
        resolve();
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);  
        reject(err);
      });
  });
}

// Track unique phone numbers to avoid duplicates
const uniquePhoneNumbers = new Set();

function generateUniquePhoneNumber() {
  let phone;
  do {
    phone = faker.phone.number();  // Generate a random phone number
  } while (uniquePhoneNumbers.has(phone));  // Ensure it is unique
  uniquePhoneNumbers.add(phone);  // Store the phone number to the set
  return phone;
}

// Seed contacts table with fake data (name, phone number, created_at, updated_at)
async function seedContactsData() {
  console.log('🌱 Seeding contacts...');
  for (let i = 0; i < TOTAL_CONTACTS; i++) {
    const fullName = faker.person.fullName().replace(/'/g, "''");
    const phoneNumber = generateUniquePhoneNumber().replace(/'/g, "''");  
    const createdAtTimestamp = new Date(Date.now() - Math.floor(Math.random() * 31536000000));
    
    // Insert contact into the contacts table, setting both created_at and updated_at
    await db.query(
      `INSERT INTO contacts (name, phone_number, created_at, updated_at) 
      VALUES ('${fullName}', '${phoneNumber}', '${createdAtTimestamp.toISOString()}', '${createdAtTimestamp.toISOString()}')`
    );
    console.log(`✅ Inserted ${i + 1}/${TOTAL_CONTACTS} contacts`);
  }
}

// Seed messages table with fake data for each contact
async function seedMessagesData() {
  console.log('💬 Seeding messages...');
  const { rows } = await db.query('SELECT id FROM contacts');  
  const contactIds = rows.map(row => row.id);  
  for (let i = 0; i < TOTAL_MESSAGES; i += BATCH_SIZE) {
    const values = [];
    const params = [];

    for (let j = 0; j < BATCH_SIZE; j++) {
      const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];  // Randomly pick a contact
      const messageContent = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];  // Randomly pick a message
      const escapedMessageContent = messageContent.replace("'", "''");  // Escape single quotes in message content

      const messageTimestamp = new Date(Date.now() - Math.floor(Math.random() * 31536000000));  // Random timestamp
      values.push(`($${params.length + 1}, $${params.length + 2}, $${params.length + 3})`);
      params.push(contactId, escapedMessageContent, messageTimestamp.toISOString());  // Prepare parameters for the query
    }

    //  SQL query to insert the batch of messages
    const query = `
      INSERT INTO messages (contact_id, content, created_at) 
      VALUES ${values.join(',')}
    `;

    await db.query(query, params);  // Execute the query
    console.log(`✅ Inserted ${i + BATCH_SIZE}/${TOTAL_MESSAGES} messages`);
  }
}

// Main function 
async function main() {
  try {
    await loadMessagesFromCSV();  
    await seedContactsData(); 
    await seedMessagesData();
    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
  process.exit();  
}

main();  
