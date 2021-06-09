const xss = require("xss");
const OrgService = require("../../services/org-service");
const { RoleService } = require("../../services/role-service");
const AWS_S3_Service = require("../../services/aws-s3-service");

const postOrg = async (req, res, next) => {
  const userId = req.user.sub;
  const { roleId } = req;

  const { name, url, handle, description, region, sector, logoId, bannerId } =
    req.body;
  // Sanitize     !!! We need to verify the url is a url !!!
  const newOrg = {
    name: xss(name),
    url: xss(url),
    description: xss(description),
    handle: xss(handle),
    region: xss(region),
    sector: xss(sector),
  };
  // make sure the fields are not empty
  for (const field of ["name", "url"])
    if (!req.body[field])
      return res.status(400).json({
        error: { message: `Missing '${field}' in request body` },
      });
  // Whats a good way to set these as default?
  newOrg.plan = "free";
  newOrg.plan_status = "active";

  // Create Organization

  const org = await OrgService.createOrg(req.app.get("db"), newOrg);
  // Now create an orgUser entry
  await OrgService.createOrgUser(req.app.get("db"), {
    user_id: userId,
    org_id: org.org_id,
    role_id: roleId,
  });

  const newOrgId = {
    org_id: org.org_id,
  };

  if (req.logoExist) {
    const orgLogo = await AWS_S3_Service.updateOrgLogo(
      req.app.get("db"),
      logoId,
      newOrgId
    );

    org.org_logo = orgLogo.location;
  }

  if (req.bannerExist) {
    const orgBanner = await AWS_S3_Service.updateOrgBanner(
      req.app.get("db"),
      bannerId,
      newOrgId
    );

    org.org_banner = orgBanner.location;
  }

  res.status(201).json(org);
};

function getRoleId(req, res, next) {
  const roleName = req.body.role;

  if (roleName) {
    RoleService.getByName(req.app.get("db"), roleName)
      .then((roleId) => {
        if (!roleId) {
          return res.status(400).json({
            error: { message: `Role '${roleName}' does not exist` },
          });
        }
        req.roleId = roleId.id;
        next();
      })
      .catch(next);
  } else {
    RoleService.getByName(req.app.get("db"), "ORGANIZATION_OWNER")
      .then((roleRes) => {
        req.roleId = roleRes.id;
        next();
      })
      .catch(next);
  }
}

function checkOrgLogo(req, res, next) {
  const { logoId } = req.body;

  const logoCheck = "logoId" in req.body;
  if (!logoCheck) {
    return res.status(400).json({
      error: { message: `Missing logoId in request body` },
    });
  }

  AWS_S3_Service.checkOrgLogo(req.app.get("db"), logoId)
    .then((logo) => {
      if (!logo) {
        req.logoExist = false;
      } else {
        req.logoExist = true;
      }
      next();
    })
    .catch(next);
}

function checkOrgBanner(req, res, next) {
  const { bannerId } = req.body;

  const bannerCheck = "logoId" in req.body;
  if (!bannerCheck) {
    return res.status(400).json({
      error: { message: `Missing bannerId in request body` },
    });
  }

  AWS_S3_Service.checkOrgBanner(req.app.get("db"), bannerId)
    .then((banner) => {
      if (!banner) {
        req.bannerExist = false;
      } else {
        req.bannerExist = true;
      }
      next();
    })
    .catch(next);
}

module.exports = {
  postOrg,
  getRoleId,
  checkOrgLogo,
  checkOrgBanner,
};
