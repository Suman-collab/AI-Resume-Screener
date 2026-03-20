const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function test() {
  const resumeText = "John Doe, Software Engineer, React, Node.js, MongoDB, 3 years experience";
  const jobDesc = "Looking for a React developer with Node.js experience";

  const tempFilePath = path.join(os.tmpdir(), `resume_test_${Date.now()}.txt`);
  fs.writeFileSync(tempFilePath, resumeText, 'utf8');

  const formData = new FormData();
  formData.append('resume', fs.createReadStream(tempFilePath), {
    filename: 'resume.txt',
    contentType: 'text/plain',
  });
  formData.append('jd_data', jobDesc);

  try {
    console.log('Sending request to RAG API...');
    const response = await axios.post(
      'http://127.0.0.1:8000/analyze_resume',
      formData,
      { headers: { ...formData.getHeaders() }, timeout: 60000 }
    );
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('RAG API Error:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error('Request Error:', error.message);
    }
  } finally {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
}

test();
