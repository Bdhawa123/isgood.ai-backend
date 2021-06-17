const ProjectService = require("../../services/project-service");
const OrgService = require("../../services/org-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

const listProjects = async (req, res, next) => {
  const userId = req.user.sub;

  try {
    const orgUser = await OrgService.getOrgIdBasedOnUser(
      req.app.get("db"),
      userId
    );

    // check is not working and you need to return empty array.
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
    console.log(orgUserIds);
    if (orgUserIds.length > 0) {
      projects = await ProjectService.getProjectsByOrgId(
        req.app.get("db"),
        orgUserIds
      );
    }
    console.log(projects);

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
    console.log(projectUser);

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
        mergedProjects[i].project_logo = {};
      }
      for (let j = 0; j < projectLogos.length; j++) {
        if (mergedProjects[i].project_id === projectLogos[j].project_id) {
          mergedProjects[i].project_logo = {
            location: projectLogos[j].location,
            id: projectLogos[j].id,
          };
          i++;
        } else {
          mergedProjects[i].project_logo = {};
        }
      }
    }

    const projectBanners = await AWS_S3_Service.getProjectBanners(
      req.app.get("db"),
      mergedProjectIds
    );

    for (let i = 0; i < mergedProjects.length; i++) {
      if (projectBanners.length === 0) {
        mergedProjects[i].project_banner = {};
      }
      for (let j = 0; j < projectBanners.length; j++) {
        if (mergedProjects[i].project_id === projectBanners[j].project_id) {
          mergedProjects[i].project_banner = {
            location: projectBanners[j].location,
            id: projectBanners[j].id,
          };
          i++;
        } else {
          mergedProjects[i].project_banner = {};
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
