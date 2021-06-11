const supertest = require('supertest');
const { db, Auth, app } = require('./setup')
const { cleanTable } = require('./test_helper_functions')
const { org, } = require('./test_data')

app.set('db', db);
request = supertest(app);
// Set up the database and insert some data
beforeAll( async () => {
    
});

// Destroy the Database and clear all data
afterAll(() => {
    db.destroy()
});

// Set up Each Test with somed data
beforeEach(() => {
    
});

// Clear all the data used for each tests
afterEach(() => {
});

describe('Projects', () => {
    it("Lists all Projects --> GET ", async () => {
        const response = await request.get('/api/project').set(Auth);
        expect(response.statusCode).toBe(200)
    });
});