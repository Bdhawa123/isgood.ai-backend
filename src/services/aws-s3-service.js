require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const accessKey = process.env.S3_KEY;
const secretKey = process.env.S3_SECRET;
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;

const s3 = new S3({
  region,
  accessKey,
  secretKey,
});

// upload a file from s3
const AWS_S3_Service = {
  uploadImage(fileName) {
    const fileStream = fs.createReadStream(`uploads/${fileName}`);

    const params = {
      Bucket: bucketName,
      Body: fileStream,
      Key: fileName,
    };

    return s3.upload(params).promise();
  },

  // get a file from s3

  getImage(fileName) {
    const params = {
      Key: fileName,
      Bucket: bucketName,
    };

    return s3.getObject(params).createReadStream();
  },

  createOrgLogo(db, newLogo) {
    return db
    .insert(newLogo)
    .into('org_logo')
    .returning('id')
    .then(([logoId]) => logoId)
},

checkOrgLogo(knex, id) {
  return knex('org_logo')
      .select('*')
      .where({
          'id': id
      }).first()
},

updateOrgLogo(knex, id, newOrgLogo) {
  return knex('org_logo')
      .where({
          'id': id
      })
      .update(newOrgLogo)
      .returning('*')
      .then(rows => {
          return rows[0]
      })
},

getOrgLogos(db, orgId) {
  return db
  .select('*')
  .from('org_logo')
  .whereIn('org_id', orgId)
  
},
};

module.exports = AWS_S3_Service;
