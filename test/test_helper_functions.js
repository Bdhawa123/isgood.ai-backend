const { db } = require('./setup')

const cleanTable = (tablename) => {
    db.raw(`TRUNCATE ${tablename} CASCADE`).then( () => {
        // reset the id
        Promise.all([db.raw(`ALTER SEQUENCE ${tablename}_id_seq minvalue 0 START WITH 1`),
        db.raw(`SELECT setval('${tablename}_id_seq', 0)`),
        ]);
    })
}

module.exports = {
    cleanTable,
}