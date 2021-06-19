const xss = require("xss");
const BeneficiaryService = require("../../services/beneficaryService");
const ProjectService = require("../../services/project-service");

const deleteBeneficiary = async (req, res, next) => {
  const { deleteBeneficiaryIds, deleteLifeChangeIds, deleteDemographicIds } =
    req.body;
  const { projectId } = req.params;

  try {
    const beneficiaryPromises = [];
    for (let i = 0; i < deleteBeneficiaryIds.length; i++) {
      beneficiaryPromises.push(
        BeneficiaryService.deleteBeneficiary(
          req.app.get("db"),
          deleteBeneficiaryIds[i]
        )
      );
    }
    await Promise.all(beneficiaryPromises);

    const lifeChangePromises = [];
    for (let i = 0; i < deleteLifeChangeIds.length; i++) {
      lifeChangePromises.push(
        BeneficiaryService.deleteLifeChange(
          req.app.get("db"),
          deleteLifeChangeIds[i]
        )
      );
    }
    await Promise.all(lifeChangePromises);

    const demographicPromises = [];
    for (let i = 0; i < deleteDemographicIds.length; i++) {
      demographicPromises.push(
        BeneficiaryService.deleteDemographic(
          req.app.get("db"),
          deleteDemographicIds[i]
        )
      );
    }
    await Promise.all(demographicPromises);

    const beneficiaries = await ProjectService.getBeneficiaries(
      req.app.get("db"),
      projectId
    );

    const beneficiaryIds = beneficiaries.map(
      (beneficiary) => beneficiary.beneficiary_id
    );
    const lifeChanges = await ProjectService.getLifeChange(
      req.app.get("db"),
      beneficiaryIds
    );
    const newBeneficiary = beneficiaries;
    for (let i = 0; i < beneficiaries.length; i++) {
      newBeneficiary[i].lifeChange = [];
      for (let j = 0; j < lifeChanges.length; j++) {
        if (beneficiaries[i].beneficiary_id == lifeChanges[j].beneficiary_id) {
          newBeneficiary[i].lifeChange.push({
            life_change_id: lifeChanges[j].life_change_id,
            description: lifeChanges[j].description,
          });
        }
      }
    }
    const demographics = await ProjectService.getDemographics(
      req.app.get("db"),
      beneficiaryIds
    );
    for (let i = 0; i < beneficiaries.length; i++) {
      newBeneficiary[i].demographics = [];
      for (let j = 0; j < demographics.length; j++) {
        if (beneficiaries[i].beneficiary_id == demographics[j].beneficiary_id) {
          newBeneficiary[i].demographics.push({
            demographic_id: demographics[j].demographic_id,
            name: demographics[j].name,
            operator: demographics[j].operator,
            value: demographics[j].value,
          });
        }
      }
    }

    res.status(200).json(newBeneficiary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deleteBeneficiary,
};
