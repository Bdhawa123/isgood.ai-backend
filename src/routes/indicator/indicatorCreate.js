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
      const { indicators } = indicatorRes.data;
      const concatIndicators = [];
      for (let i = 0; i < indicators.length; i++) {
        concatIndicators.push({
          project_id: indicatorRes.data.projectId,
          indicator_id: indicators[i].indicatorId,
          aligned_strength: indicators[i].alignedStrength,
        });
      }
      IndicatorsService.createIndicators(
        req.app.get("db"),
        concatIndicators
      ).then((setIndicators) => {
        res.status(201).json(setIndicators);
      });
    })
    .catch((error) => {
      res.status(201).send({
        error: {
          message: "There has been an issue fetching projects indicators",
        },
      });
      next();
    });
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
  getProject,
};
