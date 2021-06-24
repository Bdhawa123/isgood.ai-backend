/* eslint-disable no-undef */
const supertest = require("supertest");
const { db, Auth } = require("./setup");
const { org, updateOrgData } = require("./test_data");
const app = require("../src/app");

const { cleanTable } = require("./test_helper_functions");

let testOrgObject = {};
// Set up the database and insert some data
beforeAll(() => {
  app.set("db", db);
  cleanTable("org");
  cleanTable("org_user");
});

// Destroy the Database and clear all data
afterAll(async () => {
  await db.destroy();
});

// Set up Each Test with somed data
beforeEach(async () => {
  testOrgObject = await supertest(app)
    .post("/api/org/create")
    .set(Auth)
    .send(org[2]);
});

// Clear all the data used for each tests
afterEach(() => {});

describe("Organisations", () => {
  it("Lists all Organisations --> GET - array(json)", async () => {
    const response = await supertest(app).get("/api/org").set(Auth);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it("Creates New Organisations --> POST", async () => {
    const response = await supertest(app)
      .post("/api/org/create")
      .set(Auth)
      .send(org[0]);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Does not grant GET access to Unauthorised user", async () => {
    const response = await supertest(app).get("/api/org");
    expect(response.statusCode).toBe(401);
  });

  it("Does not grant POST access to Unauthorised user", async () => {
    const response = await supertest(app).post("/api/org/create").send(org[0]);
    expect(response.statusCode).toBe(401);
  });

  it("Deletes an Organisation by changing the status", async () => {
    const org_id = testOrgObject.body.id;
    const org_data = await db
      .select("*")
      .from("org")
      .where("id", org_id)
      .first();
    expect(org_data.status).toBeTruthy();
    const delete_org = await supertest(app)
      .delete(`/api/org/${org_id}`)
      .set(Auth);
    expect(delete_org.statusCode).toBe(204);
    const org_data2 = await db
      .select("*")
      .from("org")
      .where("id", org_id)
      .first();
    expect(org_data2.status).not.toBeTruthy();
  });

  it("Updates an Organisation", async () => {
    expect(testOrgObject.body.name).toBe(org[2].name);
    expect(testOrgObject.body.description).toBe(org[2].description);
    expect(testOrgObject.body.sector).toBe(org[2].sector);
    expect(testOrgObject.body.handle).toBe(org[2].handle);
    expect(testOrgObject.body.region).toBe(org[2].region);
    const orgId = testOrgObject.body.id;
    const response = await supertest(app)
      .patch(`/api/org/${orgId}`)
      .set(Auth)
      .send(updateOrgData);
    expect(response.statusCode).toBe(200);
    const org_data = await db
      .select("*")
      .from("org")
      .where("id", orgId)
      .first();
    expect(org_data.id).toBe(orgId);
    expect(org_data.name).toBe(updateOrgData.name);
    expect(org_data.description).toBe(updateOrgData.description);
    expect(org_data.sector).toBe(updateOrgData.sector);
    expect(org_data.handle).toBe(updateOrgData.handle);
    expect(org_data.region).toBe(updateOrgData.region);
  });

  it("Updates selected fields of an Organisation", async () => {
    const orgId = testOrgObject.body.id;
    const response = await supertest(app)
      .patch(`/api/org/${orgId}`)
      .set(Auth)
      .send({ name: "Apple", description: "" });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Apple");
    expect(response.body.description).toBe(org[2].description);
  });
});
