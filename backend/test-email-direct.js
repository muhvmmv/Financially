require('dotenv').config({ path: __dirname + '/.env' });

const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('NODE_ENV:', process.env.NODE_ENV);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  try {
    console.log('Testing email transport...');
    
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'lawalnasirlawal@gmail.com', // Your email
      subject: 'TEST EMAIL - Financially',
      text: 'This is a test email from your Financially application. If you receive this, email is working!',
      html: '<h1>Test Email</h1><p>This is a test email from your Financially application.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ EMAIL TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'EAUTH') {
      console.log('🔑 Authentication failed - check your email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('🌐 Connection failed - check your internet connection');
    }
  }
}

testEmail();