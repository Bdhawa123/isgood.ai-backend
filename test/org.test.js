const supertest = require('supertest');
const { db, Auth } = require('./setup')
const { org } = require('./test_data')
const app = require('../src/app')

const { cleanTable } = require('./test_helper_functions')


// Set up the database and insert some data
beforeAll(() => {
    app.set('db', db);
    cleanTable("org");
    cleanTable("org_user")
});

// Destroy the Database and clear all data
afterAll( async () => {
    await db.destroy();
});

// Set up Each Test with somed data
beforeEach(() => {
 
});

// Clear all the data used for each tests
afterEach(() => {

});

describe('Organisations', () => {
    
    it('Lists all Organisations --> GET - array(json)', async () => {
        const response = await supertest(app).get('/api/org').set(Auth);
        expect(response.headers["content-type"]).toContain('application/json')
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('Creates New Organisations --> POST', async () => {
        const response = await supertest(app).post('/api/org/create').set(Auth).send(org[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id")
    });

    it("Does not grant GET access to Unauthorised user", async () => {
        const response = await supertest(app).get("/api/org");
        expect(response.statusCode).toBe(401)
    });

    it("Does not grant POST access to Unauthorised user", async () => {
        const response = await supertest(app).post('/api/org/create').send(org[0]);
        expect(response.statusCode).toBe(401)
    });
    it("Deletes an Organisation by changing the status", async () => {
        const create_org = await supertest(app).post("/api/org/create").set(Auth).send(org[3]);
        const org_id = create_org.body.id;
        const org_data = await db.select("*").from("org").where("id", org_id).first();
        expect(org_data.status).toBeTruthy();
        const delete_org = await supertest(app).delete(`/api/org/${org_id}`).set(Auth);
        expect(delete_org.statusCode).toBe(204);
        const org_data2 = await db.select("*").from("org").where("id", org_id).first();
        expect(org_data2.status).not.toBeTruthy();

    });
});

