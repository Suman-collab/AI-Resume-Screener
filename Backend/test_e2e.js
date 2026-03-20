const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testBackend() {
  // Start server
  const server = spawn('node', ['server.js'], { cwd: __dirname });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // 1. Create a guest token
    const authRes = await axios.post('http://localhost:5000/api/auth/guest');
    const token = authRes.data.token;
    console.log('Got guest token:', token);
    
    // 2. Upload resume
    const tempFilePath = path.join(__dirname, '../Resume/Suman_Panda_Resume_OnePage.pdf');
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(tempFilePath), {
      filename: 'Suman_Panda_Resume_OnePage.pdf',
      contentType: 'application/pdf',
    });
    formData.append('jd_data', 'Looking for a React developer with Node.js experience');

    console.log('Sending request to local backend proxy...');
    const response = await axios.post(
      'http://localhost:5000/api/user/analyze-direct',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        },
        timeout: 60000 
      }
    );
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Backend API Error:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error('Request Error:', error.message);
    }
  } finally {
    server.kill();
  }
}

testBackend();
