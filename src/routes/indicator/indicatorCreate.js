const axios = require("axios");
const IndicatorsService = require("../../services/indicator-service");
const OutcomeService = require("../../services/outcome-service");
const ImpactService = require("../../services/impact-service");
const config = require("../../config");

const handleIndicators = (req, res, next) => {
  const { project } = req;

  axios
    .post(config.GATEWAY_GET_INDICATORS, project)
    .then((indicatorRes) => {
      res.status(201).json({
        message: "Project sent. Waiting for indicators",
      });
    })
    .catch((error) => {
      res.status(400).send({
        error: {
          message: "There has been an issue fetching projects indicators",
        },
      });
    });
};

const saveIndicators = async (req, res, next) => {
  const { projectId, indicators } = req.body;

  const concatIndicators = [];
  for (let i = 0; i < indicators.length; i++) {
    concatIndicators.push({
      project_id: projectId,
      indicator_id: indicators[i].indicatorId,
      aligned_strength: indicators[i].alignedStrength,
    });
  }
  try {
    const indicatorRes = await IndicatorsService.createIndicators(
      req.app.get("db"),
      concatIndicators
    );

    res.status(201).json(indicatorRes);
  } catch (err) {
    next(err);
  }
};

function getProject(req, res, next) {
  const { projectId } = req.params;

  ImpactService.getImpacts(req.app.get("db"), projectId)
    .then((impacts) => {
      const impactDescriptions = impacts.map((impact) => impact.description);
      OutcomeService.getOutcomes(req.app.get("db"), projectId).then(
        (outcomes) => {
          const outcomeDescriptions = outcomes.map(
            (outcome) => outcome.description
          );
          IndicatorsService.getProjectById(req.app.get("db"), projectId).then(
            (project) => {
              project.projectId = projectId;
              project.impacts = impactDescriptions;
              project.outcomes = outcomeDescriptions;
              req.project = project;
              next();
            }
          );
        }
      );
    })
    .catch(next);
}

module.exports = {
  handleIndicators,
  saveIndicators,
  getProject,
};
