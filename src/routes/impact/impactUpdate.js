const ImpactService = require("../../services/impact-service");
const xss = require("xss");
const updateImpact = async (req, res, next) => {
  const { projectImpacts } = req.body;

  try {
    const updatedImpacts = [];
    const newImpacts = [];
    for (let i = 0; i < projectImpacts.length; i++) {
      if (
        !projectImpacts[i].description ||
        projectImpacts[i].description.length === 0
      ) {
        return res.status(400).json({
          error: { message: `Impact description required` },
        });
      }
      let newImpact = {
        description: xss(projectImpacts[i].description),
        project_id: req.params.projectId,
      };

      if (!projectImpacts[i].id) {
        newImpacts.push(newImpact);
      } else {
        updatedImpacts.push(
          ImpactService.updateImpacts(
            req.app.get("db"),
            req.params.projectId,
            projectImpacts[i].id,
            newImpact
          )
        );
      }
    }
    if (newImpacts.length > 0) {
      const impactsAdded = await ImpactService.createImpact(
        req.app.get("db"),
        newImpacts
      );
    }

    const impacts = await Promise.all(updatedImpacts);

    const getImpacts = await ImpactService.getImpacts(
      req.app.get("db"),
      req.params.projectId
    );
    res.status(200).json(getImpacts);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateImpact,
};
