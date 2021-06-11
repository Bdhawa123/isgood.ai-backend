require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
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

  // org logo methods
  createOrgLogo(db, newLogo) {
    return db
      .insert(newLogo)
      .into("org_logo")
      .returning("id")
      .then(([logoId]) => logoId);
  },

  checkOrgLogo(knex, id) {
    return knex("org_logo")
      .select("*")
      .where({
        id: id,
      })
      .first();
  },

  updateOrgLogo(knex, id, newOrgLogo) {
    return knex("org_logo")
      .where({
        id: id,
      })
      .update(newOrgLogo)
      .returning("*")
      .then((rows) => rows[0]);
  },

  getOrgLogos(db, orgId) {
    return db.select("*").from("org_logo").whereIn("org_id", orgId);
  },

  // orgBanner methods
  createOrgBanner(db, newBanner) {
    return db
      .insert(newBanner)
      .into("org_banner")
      .returning("id")
      .then(([bannerId]) => bannerId);
  },

  checkOrgBanner(knex, id) {
    return knex("org_banner")
      .select("*")
      .where({
        id: id,
      })
      .first();
  },

  updateOrgBanner(knex, id, newOrgBanner) {
    return knex("org_banner")
      .where({
        id: id,
      })
      .update(newOrgBanner)
      .returning("*")
      .then((rows) => rows[0]);
  },

  getOrgBanners(db, orgId) {
    return db.select("*").from("org_banner").whereIn("org_id", orgId);
  },

  // Project Logo methods
  createProjectLogo(db, newLogo) {
    return db
      .insert(newLogo)
      .into("project_logo")
      .returning("id")
      .then(([logoId]) => logoId);
  },

  checkProjectLogo(knex, id) {
    return knex("project_logo")
      .select("*")
      .where({
        id: id,
      })
      .first();
  },

  updateProjectLogo(knex, id, newProjectLogo) {
    return knex("project_logo")
      .where({
        id: id,
      })
      .update(newProjectLogo)
      .returning("*")
      .then((rows) => rows[0]);
  },

  getProjectLogos(db, projectId) {
    return db.select("*").from("project_logo").whereIn("project_id", projectId);
  },

  getLogoByProjectId(knex, project_id) {
    return knex("project_logo")
      .select("*")
      .where({
        project_id: project_id,
      })
      .first();
  },

  // Project banner methods
  createProjectBanner(db, newBanner) {
    return db
      .insert(newBanner)
      .into("project_banner")
      .returning("id")
      .then(([bannerId]) => bannerId);
  },

  checkProjectBanner(knex, id) {
    return knex("project_banner")
      .select("*")
      .where({
        id: id,
      })
      .first();
  },

  updateProjectBanner(knex, id, newProjectBanner) {
    return knex("project_banner")
      .where({
        id: id,
      })
      .update(newProjectBanner)
      .returning("*")
      .then((rows) => rows[0]);
  },

  getProjectBanners(db, projectId) {
    return db
      .select("*")
      .from("project_banner")
      .whereIn("project_id", projectId);
  },

  getBannerByProjectId(knex, project_id) {
    return knex("project_banner")
      .select("*")
      .where({
        project_id: project_id,
      })
      .first();
  },
};

module.exports = AWS_S3_Service;
