const xss = require("xss");
const ProjectService = require("../../services/project-service");
const OrgService = require("../../services/org-service");
const { RoleService } = require("../../services/role-service");
const ImpactService = require("../../services/impact-service");
const OutcomeService = require("../../services/outcome-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

function postProject(req, res, next) {
  const userId = req.user.sub;
  const { roleId } = req;

  // deconstruct req.body
  const {
    name,
    description,
    projectImpacts,
    outcomesDesired,
    beneficiaries,
    orgId,
    startDate,
    endDate,
    coordinates,
    logoId,
  } = req.body;

  // make sure the fields are not empty
  for (const field of [
    "name",
    "description",
    "projectImpacts",
    "outcomesDesired",
    "orgId",
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: { message: `Missing '${field}' in request body` },
      });

  // construct newProject
  const newProject = {
    name: xss(name),
    description: xss(description),
    org_id: orgId,
  };

  // check if startDate and endDate are valid before saving to db
  // eslint-disable-next-line no-extend-native
  Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    // eslint-disable-next-line no-self-compare
    return this.getTime() === this.getTime();
  };

  if (startDate) {
    const sd = new Date(startDate);
    const checkStartDate = sd.isValid();
    if (startDate.length !== 0 && !checkStartDate) {
      return res.status(400).json({
        error: { message: `${startDate} is an invalid timestamp` },
      });
    }
    if (startDate.length !== 0) {
      newProject.start_date = startDate;
    }
  }
  if (endDate) {
    const ed = new Date(endDate);
    const checkEndDate = ed.isValid();

    if (endDate.length !== 0 && !checkEndDate) {
      return res.status(400).json({
        error: { message: `${endDate} is an invalid timestamp` },
      });
    }
    if (endDate.length !== 0) {
      newProject.end_date = endDate;
    }
  }

  // save geoLocation if exists
  if (coordinates && coordinates.length !== 0) {
    newProject.geolocation = [xss(coordinates[0]), xss(coordinates[1])];
  }

  // create project table
  ProjectService.createProject(req.app.get("db"), newProject)
    .then((project) => {
      // once project is created.. create impact entry with projectId as FK
      const newImpacts = [];
      for (let i = 0; i < projectImpacts.length; i++) {
        newImpacts.push({
          project_id: project.project_id,
          description: xss(projectImpacts[i]),
        });
      }

      ImpactService.createImpact(req.app.get("db"), newImpacts)
        // once impacts are created.. insert projectOutcomes in outcome table
        .then((impacts) => {
          const newOutcomes = [];
          for (let j = 0; j < outcomesDesired.length; j++) {
            newOutcomes.push({
              project_id: project.project_id,
              description: xss(outcomesDesired[j]),
            });
          }

          OutcomeService.createOutcome(req.app.get("db"), newOutcomes)
            // once outcomes are created.. create userProject table
            .then((outcomes) => {
              ProjectService.createProjectUser(req.app.get("db"), {
                project_id: project.project_id,
                user_id: userId,
                role_id: roleId,
              }).then((projectUser) => {
                if (beneficiaries && beneficiaries.length > 0) {
                  // eslint-disable-next-line no-use-before-define
                  setBeneficiaries(project.project_id, beneficiaries);
                }

                if (!logoId) {
                  return res.status(201).json(project);
                }

                AWS_S3_Service.checkProjectLogo(req.app.get("db"), logoId).then(
                  (projectLogo) => {
                    if (!projectLogo) {
                      return res.status(201).json({
                        project,
                        error: { message: `No logo with id: ${logoId}` },
                      });
                    }
                    const newProjectLogo = {
                      project_id: project.project_id,
                    };
                    AWS_S3_Service.updateProjectLogo(
                      req.app.get("db"),
                      logoId,
                      newProjectLogo
                    ).then((updatedProjectLogo) => {
                      res.status(201).json({ project, updatedProjectLogo });
                    });
                  }
                );
              });
            });
        });
    })
    .catch(next);

  // eslint-disable-next-line no-shadow
  function setBeneficiaries(projectId, beneficiaries) {
    const newBeneficiaries = [];
    for (let i = 0; i < beneficiaries.length; i++) {
      newBeneficiaries.push({
        project_id: projectId,
        name: xss(beneficiaries[i].name),
      });
    }
    ProjectService.createBeneficiaries(req.app.get("db"), newBeneficiaries)
      // insert demographics into demographic table
      .then((beneficiaryRes) => {
        const lifeChanges = [];
        for (let i = 0; i < beneficiaries.length; i++) {
          for (let j = 0; j < beneficiaries[i].lifeChange.length; j++) {
            lifeChanges.push({
              beneficiary_id: beneficiaryRes[i].beneficiary_id,
              description: xss(beneficiaries[i].lifeChange[j]),
            });
          }
        }
        ProjectService.createLifeChange(req.app.get("db"), lifeChanges).then(
          (lifeChangesRes) => {
            const newDemographics = [];
            for (let i = 0; i < beneficiaries.length; i++) {
              if (beneficiaries[i].demographics) {
                for (let j = 0; j < beneficiaries[i].demographics.length; j++) {
                  if (
                    !beneficiaries[i].demographics[j].name ||
                    !beneficiaries[i].demographics[j].operator ||
                    !beneficiaries[i].demographics[j].value
                  ) {
                    return res.status(400).json({
                      error: {
                        message: `Name, operator, and value required in demographics request body`,
                      },
                    });
                  }
                  newDemographics.push({
                    beneficiary_id: beneficiaryRes[i].beneficiary_id,
                    name: xss(beneficiaries[i].demographics[j].name),
                    operator: xss(beneficiaries[i].demographics[j].operator),
                    value: xss(beneficiaries[i].demographics[j].value),
                  });
                }
              }
            }
            ProjectService.createDemographics(
              req.app.get("db"),
              newDemographics
            ).then((demographics) => {
              next();
            });
          }
        );
      })
      .catch(next);
  }
}

function getRoleId(req, res, next) {
  const roleName = req.body.role;
  if (roleName) {
    RoleService.getByName(req.app.get("db"), roleName)
      .then((roleId) => {
        if (!roleId) {
          return res.status(400).json({
            error: { message: `Role '${roleName}' does not exist` },
          });
        }
        req.roleId = roleId.id;
        next();
      })
      .catch(next);
  } else {
    RoleService.getByName(req.app.get("db"), "PROJECT_OWNER")
      .then((roleRes) => {
        req.roleId = roleRes.id;
        next();
      })
      .catch(next);
  }
}

function orgExists(req, res, next) {
  const { orgId } = req.body;
  if (orgId) {
    OrgService.getByOrgId(req.app.get("db"), orgId)
      .then((org) => {
        if (!org) {
          return res.status(400).json({
            error: { message: `Organisation does not exist` },
          });
        }
        next();
      })
      .catch(next);
  } else {
    return res.status(400).json({
      error: { message: `Missing orgId in request body` },
    });
  }
}

module.exports = {
  postProject,
  getRoleId,
  orgExists,
};
