const axios = require("axios");
const IndicatorService = require("../../services/indicator-service");
const config = require("../../config");

function handleIndicatorsDesc(req, res, next) {
  const { authToken } = res;

  IndicatorService.getIndicators(req.app.get("db"), req.params.projectId)
    .then((metaIndicatorInfo) => {
      if (metaIndicatorInfo.length === 0) {
        res.status(400).json({
          error: { message: "there was a problem fetching project indicators" },
        });
      }
      const indicatorIds = metaIndicatorInfo.map(
        (indicator) => indicator.indicator_id
      );
      const ids = {
        numbers: indicatorIds,
      };

      axios
        .post(config.GATEWAY_INDICATOR_DETAILS, ids, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then((details) => {
          const completeIndicators = [];
          const { indicators } = details.data;
          for (let i = 0; i < indicators.length; i++) {
            for (let j = 0; j < metaIndicatorInfo.length; j++) {
              if (indicators[i].id == metaIndicatorInfo[j].indicator_id) {
                completeIndicators.push({
                  indicator_id: metaIndicatorInfo[j].indicator_id,
                  description: indicators[i].description,
                  aligned_strength: metaIndicatorInfo[j].aligned_strength,
                });
              }
            }
          }
          res.status(200).json(completeIndicators);
        })
        .catch(next);
    })
    .catch(next);
}

module.exports = {
  handleIndicatorsDesc,
};
