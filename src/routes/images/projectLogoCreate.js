const AWS_S3_Service = require("../../services/aws-s3-service");

    const projectLogoCreate = (req, res, next) => {
      const files = req.files;
  
      const logo = {
        location: files[0].key
      }
      
      AWS_S3_Service.createProjectLogo(
        req.app.get('db'),
        logo
      )
        .then(logoId => {
          res.status(201).json(logoId)
        })
        .catch(next)
    };

module.exports = {
    projectLogoCreate
}