const supertest = require('supertest');
const { db, Auth, app } = require('./setup')
const { cleanTable } = require('./test_helper_functions')
const { org, project, } = require('./test_data');

app.set('db', db);
request = supertest(app);
// Set up the database and insert some data
beforeAll( async () => {
    const res = await request.post('/api/org/create').set(Auth).send(org[1]);
    project.orgId = res.body.org_id;
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
    it("Creates New Projects --> POST", async () => {
        const response = await request.post('/api/project/create').set(Auth).send(project)
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("project_id");
    });
    it("Gets Project by ID", async () => {
        const response = await request.post('/api/project/create').set(Auth).send(project);
        const project_id = response.body.project_id;
        const getProjectById = await request.get(`/api/project/${project_id}`).set(Auth);
        expect(getProjectById.statusCode).toBe(200)
        expect(getProjectById.body).toHaveProperty("project_id");
        expect(getProjectById.body.project_id).toBe(project_id)
    });
});