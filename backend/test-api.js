const http = require('http');

const runTest = () => {
  const postData = JSON.stringify({
    name: 'Test Patient',
    email: `test${Date.now()}@patient.com`,
    phone: '1234567890',
    dob: '1990-01-01',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('RESPONSE:', data);
      try {
        const json = JSON.parse(data);
        if (json.role === 'PATIENT' && json.patient) {
          console.log('✅ Auto-test Passed: Patient registered successfully with profile.');
        } else {
          console.error('❌ Auto-test Failed: Invalid response format.');
        }
      } catch (e) {
        console.error('❌ Auto-test Failed:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

runTest();
