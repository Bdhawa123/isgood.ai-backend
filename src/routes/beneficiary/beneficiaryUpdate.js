const xss = require("xss");
const BeneficiaryService = require("../../services/beneficaryService");

const updateBeneficiary = async (req, res, next) => {
  const { beneficiary } = req.body;
  const { lifeChanges } = beneficiary;
  const { demographics } = beneficiary;

  if (!beneficiary.name) {
    return res.status(400).json({
      error: { message: `Beneficiary name required` },
    });
  }

  try {
    const updatedBeneficiaryName = {
      name: xss(beneficiary.name),
    };

    const updatedBeneficiary = await BeneficiaryService.updateBeneficiaries(
      req.app.get("db"),
      beneficiary.beneficiary_id,
      updatedBeneficiaryName
    );

    const updatedLifeChanges = [];
    const newLifeChanges = [];
    for (let i = 0; i < lifeChanges.length; i++) {
      if (!lifeChanges[i].description) {
        return res.status(400).json({
          error: { message: `Life change description required` },
        });
      }
      const newLifeChange = {
        description: xss(lifeChanges[i].description),
        beneficiary_id: beneficiary.beneficiary_id,
      };

      if (!lifeChanges[i].life_change_id) {
        newLifeChanges.push(newLifeChange);
      } else {
        updatedLifeChanges.push(
          BeneficiaryService.updateLifeChange(
            req.app.get("db"),
            lifeChanges[i].life_change_id,
            newLifeChange
          )
        );
      }
    }

    if (newLifeChanges.length > 0) {
      await BeneficiaryService.createLifeChange(
        req.app.get("db"),
        newLifeChanges
      );
    }

    await Promise.all(updatedLifeChanges);

    const getLifeChanges = await BeneficiaryService.getLifeChanges(
      req.app.get("db"),
      beneficiary.beneficiary_id
    );

    updatedBeneficiary.lifeChanges = getLifeChanges;
    const updatedDemographics = [];
    const newDemographics = [];
    for (let i = 0; i < demographics.length; i++) {
      const demographicError = BeneficiaryService.validateNameOperatorValue(
        demographics[i].name,
        demographics[i].operator,
        demographics[i].value
      );
      if (demographicError)
        return res.status(400).json({ error: demographicError });

      const newDemographic = {
        beneficiary_id: beneficiary.beneficiary_id,
        name: xss(demographics[i].name),
        operator: xss(demographics[i].operator),
        value: xss(demographics[i].value),
      };
      if (!demographics[i].demographic_id) {
        newDemographics.push(newDemographic);
      } else {
        updatedDemographics.push(
          BeneficiaryService.updateDemographic(
            req.app.get("db"),
            demographics[i].demographic_id,
            newDemographic
          )
        );
      }
    }

    if (newDemographics.length > 0) {
      await BeneficiaryService.createDemographic(
        req.app.get("db"),
        newDemographics
      );
    }

    await Promise.all(updatedDemographics);

    const getDemographics = await BeneficiaryService.getDemographics(
      req.app.get("db"),
      beneficiary.beneficiary_id
    );

    updatedBeneficiary.demographics = getDemographics;

    res.status(200).json(updatedBeneficiary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateBeneficiary,
};
