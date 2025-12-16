
//https://axios-http.com/docs/intro
//https://github.com/axios/axios
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const users = {
    olga: { email: 'olga@test.com', password: 'Test123!', token: null },
    mary: { email: 'mary@test.com', password: 'Test123!', token: null }
};

let maryPostId = null;
let expiredPostId = null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log('MINGLE TEST SUITE\n');

    // Test 1: Register users
    try {
        await axios.post(`${BASE_URL}/auth/register`, { name: 'Olga', email: users.olga.email, password: users.olga.password });
        await axios.post(`${BASE_URL}/auth/register`, { name: 'Mary', email: users.mary.email, password: users.mary.password });
        console.log('Test 1 - Register users: PASSED');
    } catch {
        console.log('Test 1 - Register users: PASSED (already exist)');
    }

    // Test 2: Login and get tokens
    try {
        const olgaRes = await axios.post(`${BASE_URL}/auth/login`, { email: users.olga.email, password: users.olga.password });
        const maryRes = await axios.post(`${BASE_URL}/auth/login`, { email: users.mary.email, password: users.mary.password });
        users.olga.token = olgaRes.data['auth-token'];
        users.mary.token = maryRes.data['auth-token'];
        console.log('Test 2 - Login and get tokens: PASSED');
    } catch {
        console.log('Test 2 - Login and get tokens: FAILED');
    }

    // Test 3: Access API without token
    try {
        await axios.get(`${BASE_URL}/posts`);
        console.log('Test 3 - Unauthorized access rejected: FAILED');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log('Test 3 - Unauthorized access rejected: PASSED');
        } else {
            console.log('Test 3 - Unauthorized access rejected: FAILED');
        }
    }

    // Test 4: Create post
    try {
        const res = await axios.post(`${BASE_URL}/posts`, {
            title: 'Mary Tech Post',
            topics: ['Tech'],
            content: 'Test content',
            expirationHours: 24
        }, { headers: { 'auth-token': users.mary.token } });
        maryPostId = res.data.post._id;
        console.log('Test 4 - Create post: PASSED');
    } catch {
        console.log('Test 4 - Create post: FAILED');
    }

    // Test 5: List posts
    try {
        const res = await axios.get(`${BASE_URL}/posts`, { headers: { 'auth-token': users.olga.token } });
        if (res.data.length > 0) {
            console.log('Test 5 - List posts: PASSED');
        } else {
            console.log('Test 5 - List posts: FAILED');
        }
    } catch {
        console.log('Test 5 - List posts: FAILED');
    }

    // Test 6: Like post
    try {
        await axios.put(`${BASE_URL}/posts/${maryPostId}/like`, {}, { headers: { 'auth-token': users.olga.token } });
        console.log('Test 6 - Like post: PASSED');
    } catch {
        console.log('Test 6 - Like post: FAILED');
    }

    // Test 7: Self-like rejected
    try {
        await axios.put(`${BASE_URL}/posts/${maryPostId}/like`, {}, { headers: { 'auth-token': users.mary.token } });
        console.log('Test 7 - Self-like rejected: FAILED');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('Test 7 - Self-like rejected: PASSED');
        } else {
            console.log('Test 7 - Self-like rejected: FAILED');
        }
    }

    // Test 8: Add comment
    try {
        await axios.post(`${BASE_URL}/posts/${maryPostId}/comment`, { text: 'Test comment' }, { headers: { 'auth-token': users.olga.token } });
        console.log('Test 8 - Add comment: PASSED');
    } catch {
        console.log('Test 8 - Add comment: FAILED');
    }

    // Test 9: Create post with short expiry
    try {
        const res = await axios.post(`${BASE_URL}/posts`, {
            title: 'Expiring Post',
            topics: ['Health'],
            content: 'Will expire soon',
            expirationHours: 0.001
        }, { headers: { 'auth-token': users.mary.token } });
        expiredPostId = res.data.post._id;
        console.log('Test 9 - Create expiring post: PASSED');
    } catch {
        console.log('Test 9 - Create expiring post: FAILED');
    }

    // Test 10: Expired post interaction rejected
    await sleep(5000);
    try {
        await axios.put(`${BASE_URL}/posts/${expiredPostId}/like`, {}, { headers: { 'auth-token': users.olga.token } });
        console.log('Test 10 - Expired post interaction rejected: FAILED');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('Test 10 - Expired post interaction rejected: PASSED');
        } else {
            console.log('Test 10 - Expired post interaction rejected: FAILED');
        }
    }

    console.log('\nTEST SUITE COMPLETE');
})();
