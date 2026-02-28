import axios from 'axios';

async function testAuthApi() {
    try {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        const testData = {
            name: "Test API User",
            email: uniqueEmail,
            password: "Password@123",
            confirmPassword: "Password@123"
        };

        console.log(`[1] Registering: ${uniqueEmail}`);
        const regRes = await axios.post('http://localhost:5000/api/v1/auth/register', testData);
        console.log('Register success:', regRes.data.success);

        console.log(`[2] Logging in...`);
        const loginData = {
            email: testData.email,
            password: testData.password
        };
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', loginData);
        console.log('Login success:', loginRes.data.success);
        console.log('Token received:', !!loginRes.data.data.accessToken);

    } catch (e) {
        if (e.response) {
            console.error('Error status:', e.response.status);
            console.error('Error data:', e.response.data);
        } else {
            console.error(e.message);
        }
    }
}

testAuthApi();
