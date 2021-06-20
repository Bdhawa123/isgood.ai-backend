const xss = require("xss");
const ProjectService = require("../../services/project-service");
const OrgService = require("../../services/org-service");
const { RoleService } = require("../../services/role-service");
const ImpactService = require("../../services/impact-service");
const OutcomeService = require("../../services/outcome-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

const postProject = async (req, res, next) => {
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
    bannerId,
  } = req.body;

  // make sure the fields are not empty
  for (const field of [
    "name",
    "description",
    "projectImpacts",
    "outcomesDesired",
    "orgId",
    "beneficiaries",
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

  try {
    // create project table
    const project = await ProjectService.createProject(
      req.app.get("db"),
      newProject
    );

    project.role = req.role.name;

    // once project is created.. create impact entry with projectId as FK
    const newImpacts = [];
    for (let i = 0; i < projectImpacts.length; i++) {
      newImpacts.push({
        project_id: project.project_id,
        description: xss(projectImpacts[i]),
      });
    }

    // once project is created.. create outcome entry with projectId as FK
    const newOutcomes = [];
    for (let j = 0; j < outcomesDesired.length; j++) {
      newOutcomes.push({
        project_id: project.project_id,
        description: xss(outcomesDesired[j]),
      });
    }

    // insert impacts
    await ImpactService.createImpact(req.app.get("db"), newImpacts);
    // once impacts are created.. insert projectOutcomes in outcome table
    await OutcomeService.createOutcome(req.app.get("db"), newOutcomes);

    // once outcomes are created.. create userProject table
    await ProjectService.createProjectUser(req.app.get("db"), {
      project_id: project.project_id,
      user_id: userId,
      role_id: roleId,
      org_id: orgId,
    });

    if (beneficiaries.length > 0) {
      const newBeneficiaries = [];
      for (let i = 0; i < beneficiaries.length; i++) {
        newBeneficiaries.push({
          project_id: project.project_id,
          name: xss(beneficiaries[i].name),
        });
      }
      // save beneficiaries to db
      const beneficiaryRes = await ProjectService.createBeneficiaries(
        req.app.get("db"),
        newBeneficiaries
      );
      const lifeChanges = [];
      const newDemographics = [];
      for (let i = 0; i < beneficiaries.length; i++) {
        const lifeChangeCheck = "lifeChange" in beneficiaries[i];
        if (!lifeChangeCheck) {
          return res.status(400).json({
            error: {
              message: `Missing lifeChange in ${beneficiaries[i].name}`,
            },
          });
        }
        for (let j = 0; j < beneficiaries[i].lifeChange.length; j++) {
          lifeChanges.push({
            beneficiary_id: beneficiaryRes[i].beneficiary_id,
            description: xss(beneficiaries[i].lifeChange[j]),
          });
        }
      }
      // Save life changes to db
      await ProjectService.createLifeChange(req.app.get("db"), lifeChanges);
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
      await ProjectService.createDemographics(
        req.app.get("db"),
        newDemographics
      );
    }
    // create entry in indicator_current table
    await ProjectService.createIndicatorCurrent(req.app.get("db"), {
      project_id: project.project_id,
    });

    const newProjectId = { project_id: project.project_id };
    //   save project logo and banner to db if they exist
    if (req.logoExist) {
      const projectLogo = await AWS_S3_Service.updateProjectLogo(
        req.app.get("db"),
        logoId,
        newProjectId
      );

      project.logo = {
        location: projectLogo.location,
        id: projectLogo.id,
      };
    } else {
      project.logo = {};
    }

    if (req.bannerExist) {
      const projectBanner = await AWS_S3_Service.updateProjectBanner(
        req.app.get("db"),
        bannerId,
        newProjectId
      );

      project.banner = {
        location: projectBanner.location,
        id: projectBanner.id,
      };
    } else {
      project.banner = {};
    }
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

function getRoleId(req, res, next) {
  const roleName = req.body.role;
  if (roleName) {
    RoleService.getByName(req.app.get("db"), roleName)
      .then((role) => {
        if (!role) {
          return res.status(400).json({
            error: { message: `Role '${roleName}' does not exist` },
          });
        }
        req.role = role;
        req.roleId = role.id;
        next();
      })
      .catch(next);
  } else {
    RoleService.getByName(req.app.get("db"), "PROJECT_OWNER")
      .then((role) => {
        req.roleId = role.id;
        req.role = role;
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

function checkProjectLogo(req, res, next) {
  const { logoId } = req.body;

  const logoCheck = "logoId" in req.body;
  if (!logoCheck) {
    return res.status(400).json({
      error: { message: `Missing logoId in request body` },
    });
  }

  AWS_S3_Service.checkProjectLogo(req.app.get("db"), logoId)
    .then((logo) => {
      if (!logo) {
        req.logoExist = false;
      } else {
        req.logoExist = true;
      }
      next();
    })
    .catch(next);
}

function checkProjectBanner(req, res, next) {
  const { bannerId } = req.body;

  const bannerCheck = "bannerId" in req.body;
  if (!bannerCheck) {
    return res.status(400).json({
      error: { message: `Missing bannerId in request body` },
    });
  }

  AWS_S3_Service.checkProjectBanner(req.app.get("db"), bannerId)
    .then((banner) => {
      if (!banner) {
        req.bannerExist = false;
      } else {
        req.bannerExist = true;
      }
      next();
    })
    .catch(next);
}

module.exports = {
  postProject,
  getRoleId,
  orgExists,
  checkProjectLogo,
  checkProjectBanner,
};
