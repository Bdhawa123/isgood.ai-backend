const ProjectService = require("../../services/project-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

function listProjects(req, res, next) {
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
                    projects[i].project_logo = {
                      location: projectLogos[j].location,
                      id: projectLogos[j].id,
                    };
                    i++;
                  } else {
                    projects[i].project_logo = {};
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
                      projects[i].project_banner = {
                        location: projectBanners[j].location,
                        id: projectBanners[j].id,
                      };
                    } else {
                      projects[i].project_banner = {};
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

module.exports = {
  listProjects,
};
