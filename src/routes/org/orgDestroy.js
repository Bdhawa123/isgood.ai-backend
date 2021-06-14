const OrgService = require("../../services/org-service");

const setOrgInactive = async (req, res, next) => {
  const { orgId } = req.params;

  const setFalse = {
    status: false,
  };

  try {
    await OrgService.setOrgStatusInactive(req.app.get("db"), orgId, setFalse);

    await OrgService.setProjectStatusToInactive(
      req.app.get("db"),
      orgId,
      setFalse
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

function checkOrgExists(req, res, next) {
  const { orgId } = req.params;
  const userId = req.user.sub;

  OrgService.checkOrgForUser(req.app.get("db"), userId, orgId)
    .then((metaUserOrgInfo) => {
      if (!metaUserOrgInfo) {
        return res.status(400).json({
          error: { message: `Organization does not exist` },
        });
      }
      req.metaUserOrgInfo = metaUserOrgInfo;
      OrgService.getByOrgId(req.app.get("db"), orgId).then((org) => {
        if (!org) {
          return res.status(400).json({
            error: { message: `Organization does not exist` },
          });
        }
        next();
      });
    })
    .catch(next);
}

module.exports = {
  checkOrgExists,
  setOrgInactive,
};
