const AWS_S3_Service = require("../../services/aws-s3-service");

const orgLogoCreate = (req, res, next) => {
  const { files } = req;

  const logo = {
    location: files[0].key,
  };

  AWS_S3_Service.createOrgLogo(req.app.get("db"), logo)
    .then((logoId) => {
      res.status(201).json(logoId);
    })
    .catch(next);
};

module.exports = {
  orgLogoCreate,
};
