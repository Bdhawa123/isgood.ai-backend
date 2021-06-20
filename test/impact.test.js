const supertest = require('supertest');
const { db, Auth, app } = require('./setup')
const { cleanTable } = require('./test_helper_functions')


// Set up the database and insert some data
beforeAll(() => {
    app.set('db', db);
    request = supertest(app);
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
    it("List all", () => {

    });
});
