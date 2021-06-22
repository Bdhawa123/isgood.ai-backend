const ProjectService = require("../../services/project-service");
const OutcomeService = require("../../services/outcome-service");
const ImpactService = require("../../services/impact-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

function findProject(req, res, next) {
  const { projectId } = req.params;

  ImpactService.getImpacts(req.app.get("db"), projectId)
    .then((impacts) => {
      OutcomeService.getOutcomes(req.app.get("db"), projectId).then(
        (outcomes) => {
          ProjectService.getById(req.app.get("db"), projectId).then(
            (project) => {
              project.role = req.role.name;
              project.impacts = impacts;
              project.outcomes = outcomes;
              project.beneficiaries = req.beneficiaries;
              project.logo = req.logo;
              project.banner = req.banner;
              project.indicator_status = req.status;
              res.status(200).json(project);
            }
          );
        }
      );
    })
    .catch(next);
}

function getBeneficiaries(req, res, next) {
  const { projectId } = req.params;
  ProjectService.getBeneficiaries(req.app.get("db"), projectId)
    .then((beneficiaries) => {
      const beneficiaryIds = beneficiaries.map((beneficiary) => beneficiary.id);
      ProjectService.getLifeChange(req.app.get("db"), beneficiaryIds).then(
        (lifeChanges) => {
          const newBeneficiary = beneficiaries;
          for (let i = 0; i < beneficiaries.length; i++) {
            newBeneficiary[i].lifeChange = [];
            for (let j = 0; j < lifeChanges.length; j++) {
              if (beneficiaries[i].id == lifeChanges[j].beneficiary_id) {
                newBeneficiary[i].lifeChange.push({
                  id: lifeChanges[j].id,
                  description: lifeChanges[j].description,
                });
              }
            }
          }
          ProjectService.getDemographics(
            req.app.get("db"),
            beneficiaryIds
          ).then((demographics) => {
            for (let i = 0; i < beneficiaries.length; i++) {
              newBeneficiary[i].demographics = [];
              for (let j = 0; j < demographics.length; j++) {
                if (beneficiaries[i].id == demographics[j].beneficiary_id) {
                  newBeneficiary[i].demographics.push({
                    id: demographics[j].id,
                    name: demographics[j].name,
                    operator: demographics[j].operator,
                    value: demographics[j].value,
                  });
                }
              }
            }
            req.beneficiaries = newBeneficiary;
            next();
          });
        }
      );
    })
    .catch(next);
}

function checkProjectExists(req, res, next) {
  const { projectId } = req.params;

  ProjectService.getById(req.app.get("db"), projectId)
    .then((project) => {
      if (!project) {
        return res.status(400).json({
          error: { message: `Project does not exist` },
        });
      }
      next();
    })
    .catch(next);
}

function getProjectLogo(req, res, next) {
  const { projectId } = req.params;

  AWS_S3_Service.getLogoByProjectId(req.app.get("db"), projectId)
    .then((projectLogo) => {
      if (!projectLogo) {
        req.logo = {};
      } else {
        req.logo = {
          location: projectLogo.location,
          id: projectLogo.id,
        };
      }
      next();
    })
    .catch(next);
}

function getProjectBanner(req, res, next) {
  const { projectId } = req.params;

  AWS_S3_Service.getBannerByProjectId(req.app.get("db"), projectId)
    .then((projectBanner) => {
      if (!projectBanner) {
        req.banner = {};
      } else {
        req.banner = {
          location: projectBanner.location,
          id: projectBanner.id,
        };
      }
      next();
    })
    .catch(next);
}

function getIndicatorStatus(req, res, next) {
  const { projectId } = req.params;

  ProjectService.getIndicatorStatus(req.app.get("db"), projectId)
    .then((status) => {
      req.status = status.up_to_date;
      next();
    })
    .catch(next);
}

module.exports = {
  findProject,
  getBeneficiaries,
  checkProjectExists,
  getProjectLogo,
  getIndicatorStatus,
  getProjectBanner,
};
