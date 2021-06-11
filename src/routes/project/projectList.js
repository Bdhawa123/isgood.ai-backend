const ProjectService = require("../../services/project-service");
const OrgService = require("../../services/org-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

function listAllProjects(req, res, next) {
  const userId = req.user.sub;

  ProjectService.getProjectIdBasedOnUser(req.app.get("db"), userId)
    .then((projectUser) => {
      if (!projectUser) {
        return res.status(400).json({
          error: { message: `No Projects` },
        });
      }
      const projectIds = projectUser.map((item) => item.project_id);
      ProjectService.getProjects(req.app.get("db"), projectIds).then(
        (projects) => {
          for (let i = 0; i < projects.length; i++) {
            for (let j = 0; j < projectUser.length; j++) {
              if (projects[i].project_id === projectUser[j].project_id) {
                projects[i].role = projectUser[j].name;
              }
            }
          }
          AWS_S3_Service.getProjectLogos(req.app.get("db"), projectIds).then(
            (projectLogos) => {
              for (let i = 0; i < projects.length; i++) {
                for (let j = 0; j < projectLogos.length; j++) {
                  if (projects[i].project_id === projectLogos[j].project_id) {
                    projects[i].logo = {
                      location: projectLogos[j].location,
                      id: projectLogos[j].id,
                    };
                  } else {
                    projects[i].logo = {};
                  }
                }
              }

              AWS_S3_Service.getProjectBanners(
                req.app.get("db"),
                projectIds
              ).then((projectBanners) => {
                for (let i = 0; i < projects.length; i++) {
                  for (let j = 0; j < projectBanners.length; j++) {
                    if (
                      projects[i].project_id === projectBanners[j].project_id
                    ) {
                      projects[i].banner = {
                        location: projectBanners[j].location,
                        id: projectBanners[j].id,
                      };
                    } else {
                      projects[i].banner = {};
                    }
                  }
                }
                res.status(200).json(projects);
              });
            }
          );
        }
      );
    })
    .catch(next);
}

const listProjects = async (req, res, next) => {
  const userId = req.user.sub;

  try {
    const orgUser = await OrgService.getOrgIdBasedOnUser(
      req.app.get("db"),
      userId
    );

    if (!orgUser) {
      return res.status(200).json({
        message: `No Organizations`,
      });
    }

    const orgUserIds = [];
    const projectUserOrgIds = [];
    for (let i = 0; i < orgUser.length; i++) {
      if (
        orgUser[i].name === "ORGANIZATION_OWNER" ||
        orgUser[i].name === "ORGANIZATION_MANAGER"
      ) {
        orgUserIds.push(orgUser[i].org_id);
      } else {
        projectUserOrgIds.push(orgUser[i].org_id);
      }
    }
    let projects;
    if (orgUserIds.length > 0) {
      projects = await ProjectService.getProjectsByOrgId(
        req.app.get("db"),
        orgUserIds
      );
    }

    for (let i = 0; i < projects.length; i++) {
      for (let j = 0; j < orgUser.length; j++) {
        if (projects[i].org_id === orgUser[j].org_id) {
          projects[i].role = orgUser[j].name;
        }
      }
    }

    const ProjectUserProjectids = [];
    for (let j = 0; j < projectUserOrgIds.length; j++) {
      ProjectUserProjectids.push(
        ProjectService.getProjectIdFromProjectUser(
          req.app.get("db"),
          userId,
          projectUserOrgIds[j]
        )
      );
    }

    const projectUser = await Promise.all(ProjectUserProjectids);

    const projectIds = projectUser.map((item) => item.project_id);

    const newProjects = await ProjectService.getProjects(
      req.app.get("db"),
      projectIds
    );

    for (let i = 0; i < newProjects.length; i++) {
      for (let j = 0; j < projectUser.length; j++) {
        if (newProjects[i].project_id === projectUser[j].project_id) {
          newProjects[i].role = projectUser[j].name;
        }
      }
    }

    const mergedProjects = projects.concat(newProjects);

    const mergedProjectIds = mergedProjects.map((item) => item.project_id);

    const projectLogos = await AWS_S3_Service.getProjectLogos(
      req.app.get("db"),
      mergedProjectIds
    );

    for (let i = 0; i < mergedProjects.length; i++) {
      if (projectLogos.length === 0) {
        mergedProjects[i].org_logo = {};
      }
      for (let j = 0; j < projectLogos.length; j++) {
        if (mergedProjects[i].project_id === projectLogos[j].project_id) {
          mergedProjects[i].logo = {
            location: projectLogos[j].location,
            id: projectLogos[j].id,
          };
          i++;
        } else {
          mergedProjects[i].logo = {};
        }
      }
    }

    const projectBanners = await AWS_S3_Service.getProjectBanners(
      req.app.get("db"),
      mergedProjectIds
    );

    for (let i = 0; i < mergedProjects.length; i++) {
      if (projectBanners.length === 0) {
        mergedProjects[i].org_banner = {};
      }
      for (let j = 0; j < projectBanners.length; j++) {
        if (mergedProjects[i].project_id === projectBanners[j].project_id) {
          mergedProjects[i].banner = {
            location: projectBanners[j].location,
            id: projectBanners[j].id,
          };
        } else {
          mergedProjects[i].banner = {};
        }
      }
    }

    res.status(200).json(mergedProjects);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProjects,
};
