const axios = require('axios');
const http = require('http');

async function loginAdmin() {
  const payload = {
    email: 'bozorboyevazizjon56@gmail.com',
    password: 'rgqh wpaa xgwg kwna',
  }; // this is the google password, probably not admin password
  // Let me just create a direct request to check server status or print users. Wait, the API is running at localhost:3000
}

async function testApi() {
  try {
    // try to get all teachers just to verify the backend is up
    const res = await axios.get(
      'http://localhost:3000/api/User/GetAllTeachersWithFilters',
    );
    console.log('Backend reachable', res.status);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testApi();
