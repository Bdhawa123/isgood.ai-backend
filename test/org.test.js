const supertest = require('supertest');
const { db, Auth, app } = require('./setup')
const { org } = require('./test_data')
const { cleanTable } = require('./test_helper_functions')


// Set up the database and insert some data
beforeAll(() => {
    app.set('db', db);
    request = supertest(app);
    cleanTable("org");
    cleanTable("org_user")
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

describe('Organisations', () => {
    
    it('Lists all Organisations --> GET - array(json)', async () => {
        const response = await request.get('/api/org').set(Auth);
        expect(response.headers["content-type"]).toContain('application/json')
        expect(response.statusCode).toBe(200);
    });

    it('Creates New Organisations --> POST', async () => {
        const response = await request.post('/api/org/create').set(Auth).send(org[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("org_id")
    });

    it("Does not grant GET access to Unauthorised user", async () => {
        const response = await request.get("/api/org");
        expect(response.statusCode).toBe(401)
    });

    it("Does not grant POST access to Unauthorised user", async () => {
        const response = await request.post('/api/org/create').send(org[0]);
        expect(response.statusCode).toBe(401)
    });
});

