const supertest = require("supertest");
const { db, Auth, app } = require("./setup");
const { cleanTable } = require("./test_helper_functions");
const { org, project } = require("./test_data");

// Set up the database and insert some data
beforeAll( async () => {
    app.set('db', db);
    const res = await supertest(app).post('/api/org/create').set(Auth).send(org[1]);
    project.orgId = res.body.org_id;
});

// Destroy the Database and clear all data
afterAll(() => {
  db.destroy();
});

// Set up Each Test with somed data
beforeEach(() => {});

// Clear all the data used for each tests
afterEach(() => {});

describe("Projects", () => {
  it("Lists all Projects --> GET ", async () => {
    const response = await supertest(app).get("/api/project").set(Auth);
    expect(response.statusCode).toBe(200);
  });
  it("Creates New Projects --> POST", async () => {
    const response = await supertest(app)
      .post("/api/project/create")
      .set(Auth)
      .send(project);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
  it("Gets Project by ID", async () => {
    const response = await supertest(app)
      .post("/api/project/create")
      .set(Auth)
      .send(project);
    const projectId = response.body.id;
    const getProjectById = await supertest(app)
      .get(`/api/project/${projectId}`)
      .set(Auth);
    expect(getProjectById.statusCode).toBe(200);
    expect(getProjectById.body).toHaveProperty("id");
    expect(getProjectById.body.id).toBe(projectId);
  });
});
