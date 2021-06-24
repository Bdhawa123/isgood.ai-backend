const { getOrgRole, getProjectRole } = require("../services/role-service");

function checkProjectCreate(req, res, next) {
  const userId = req.user.sub;
  const { orgId } = req.body;

  getOrgRole(req.app.get("db"), orgId, userId)
    .then((roles) => {
      const role = roles.name;
      if (role !== "ORGANIZATION_OWNER" && role !== "ORGANIZATION_MANAGER") {
        return res.status(403).json({
          error: { message: "Unauthorized Request" },
        });
      }
      next();
    })
    .catch(next);
}

function checkProjectRead(req, res, next) {
  const userId = req.user.sub;
  const { projectId } = req.params;

  getProjectRole(req.app.get("db"), projectId, userId)
    .then((role) => {
      req.role = role;
      next();
    })
    .catch(next);
}

function checkProjectUpdate(req, res, next) {
  const userId = req.user.sub;
  const { orgId } = req.body;
  const { projectId } = req.params;

  getOrgRole(req.app.get("db"), orgId, userId)
    .then((roles) => {
      const orgRole = roles.name;
      if (
        orgRole !== "ORGANIZATION_OWNER" &&
        orgRole !== "ORGANIZATION_MANAGER"
      ) {
        return res.status(403).json({
          error: { message: "Unauthorized Request" },
        });
      }
      getProjectRole(req.app.get("db"), projectId, userId).then((role) => {
        const projectRole = role.name;
        if (
          projectRole !== "PROJECT_OWNER" &&
          projectRole !== "PROJECT_MANAGER"
        ) {
          return res.status(403).json({
            error: { message: "Unauthorized Request" },
          });
        }
        req.role = role;

        next();
      });
    })
    .catch(next);
}

function checkProjectDelete(req, res, next) {
  const userId = req.user.sub;
  const { orgId } = req.query;
  const { projectId } = req.params;

  getOrgRole(req.app.get("db"), orgId, userId)
    .then((roles) => {
      const orgRole = roles.name;
      if (
        orgRole !== "ORGANIZATION_OWNER" &&
        orgRole !== "ORGANIZATION_MANAGER"
      ) {
        return res.status(403).json({
          error: { message: "Unauthorized Request" },
        });
      }
      getProjectRole(req.app.get("db"), projectId, userId).then((role) => {
        const projectRole = role.name;
        if (projectRole !== "PROJECT_OWNER") {
          return res.status(403).json({
            error: { message: "Unauthorized Request" },
          });
        }
        req.role = role;

        next();
      });
    })
    .catch(next);
}

function checkOrgDelete(req, res, next) {
  const userId = req.user.sub;
  const { orgId } = req.params;

  getOrgRole(req.app.get("db"), orgId, userId)
    .then((roles) => {
      const orgRole = roles.name;
      if (orgRole !== "ORGANIZATION_OWNER") {
        return res.status(403).json({
          error: { message: "Unauthorized Request" },
        });
      }

      next();
    })
    .catch(next);
}

const checkOrgUpdate = async (req, res, next) => {
  const userId = req.user.sub;
  const { orgId } = req.params;

  getOrgRole(req.app.get("db"), orgId, userId).then((roles) => {
    if(roles.name !== "ORGANIZATION_OWNER") {
      return res.status(403).json({
        error: { message: "Unauthorized Request" },
      });
    }
    next();
  }).catch(next)
};

module.exports = {
  checkProjectCreate,
  checkProjectRead,
  checkProjectUpdate,
  checkProjectDelete,
  checkOrgDelete,
  checkOrgUpdate,
};
