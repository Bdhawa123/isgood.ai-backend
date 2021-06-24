const orgService = require('../../services/org-service')
const xss = require("xss")

const updateOrg = async (req, res, next) => {
const orgId = req.params.orgId

const {name, url, description, handle, sector, region} = req.body;
const updateData = {
    name: name ? xss(name) : undefined,
    url: url ? xss(url) : undefined,
    description: description ? xss(description) : undefined,
    handle: handle ? xss(handle) : undefined,
    sector: sector ? xss(sector) : undefined,
    region: region ? xss(region) : undefined
}

try{
    const org = await orgService.partialUpdateOrg(req.app.get("db"), orgId, updateData)
    res.status(200).json(org);
}catch (err) {
    next(err)
}
}

module.exports = {
    updateOrg,
}