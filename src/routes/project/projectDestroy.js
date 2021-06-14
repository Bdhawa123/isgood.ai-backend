const ProjectService = require("../../services/project-service");

const setProjectInactive = async (req, res, next) => {
  const { projectId } = req.params;

  const setFalse = {
    status: false,
  };

  try {
    const projectExist = ProjectService.getById(req.app.get("db"), projectId);

    if (!projectExist) {
      return res.status(404).json({
        error: { message: "Project does not exist" },
      });
    }

    await ProjectService.setProjectStatusToInactive(
      req.app.get("db"),
      projectId,
      setFalse
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  setProjectInactive,
};
