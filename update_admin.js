const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

async function updateAdmin() {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash('@zCardinals16', 10);
    
    // Open database
    const db = new sqlite3.Database('./volleyball_checkin.db');
    
    // Update the admin user
    db.run(
      `UPDATE users SET 
        username = ?, 
        email = ?, 
        password = ?, 
        firstName = ?, 
        lastName = ?, 
        updatedAt = ?
       WHERE username = 'admin'`,
      ['calebhobbs', 'caleb@aznova.org', hashedPassword, 'Caleb', 'Hobbs', new Date().toISOString()],
      function(err) {
        if (err) {
          console.error('Error updating admin:', err);
        } else {
          console.log('Admin account updated successfully!');
          console.log('New credentials:');
          console.log('Username: calebhobbs');
          console.log('Email: caleb@aznova.org');
          console.log('Role: admin');
          console.log('Name: Caleb Hobbs');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdmin();
