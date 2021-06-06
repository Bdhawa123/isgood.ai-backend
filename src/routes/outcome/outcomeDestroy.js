const OutcomeService = require("../../services/outcome-service");

const deleteOutcomes = async (req, res, next) => {
  const { deleteOutcomeIds } = req.body;

  try {
    const outcomePromises = [];
    for (let i = 0; i < deleteOutcomeIds.length; i++) {
      outcomePromises.push(
        OutcomeService.deleteOutcome(req.app.get("db"), deleteOutcomeIds[i])
      );
    }
    await Promise.all(outcomePromises);
    const getOutcomes = await OutcomeService.getOutcomes(
      req.app.get("db"),
      req.params.projectId
    );

    res.status(200).json(getOutcomes);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deleteOutcomes,
};
