const xss = require('xss')
const ProjectService = require('../../services/project-service')

 const updateProject = async (req, res, next) => {
    const {name, description, startDate, endDate, coordinates } = req.body

     //make sure the fields are not empty
     for (const field of ['name', 'description', 'orgId'])
     if (!req.body[field])
         return res.status(400).json({
             error: {message: `Missing '${field}' in request body`}
         })

    const projectToUpdate = {
        name: xss(name),
        description: xss(description)
    }

    // check if startDate and endDate are valid before saving to db
    Date.prototype.isValid = function () {
        // An invalid date object returns NaN for getTime() and NaN is the only
        // object not strictly equal to itself.
        return this.getTime() === this.getTime();
    }; 
    let sd = new Date(startDate);
    let ed = new Date(endDate);
    let checkStartDate = sd.isValid()
    let checkEndDate = ed.isValid()
    
    if(startDate.length !== 0 && !checkStartDate) {
        return res.status(400).json({
            error: {message: `${startDate} is an invalid timestamp`}
        })
    } else if (startDate.length !== 0) {
        projectToUpdate.start_date = startDate;
    }
    
    if (endDate.length !== 0 && !checkEndDate) {
        return res.status(400).json({
            error: {message: `${endDate} is an invalid timestamp`}
        })
    } else if (endDate.length !== 0) {
        projectToUpdate.end_date = endDate;
    } 

    //save geoLocation if exists
    if(coordinates && coordinates.length !== 0) {
        projectToUpdate.geolocation = [xss(coordinates[0]), xss(coordinates[1])]
    }

    try{
        const updatedProject = await ProjectService.updateProject(
            req.app.get('db'),
            req.params.projectId,
            projectToUpdate
        )

        res.status(200).json(updatedProject)
    } catch(err) {
        next(err)
    }
}

function checkProjectExists(req, res, next) {
    const projectId = req.params.projectId
    const userId = req.user.sub

    ProjectService.checkProjectForUser(
        req.app.get('db'),
        userId,
        projectId
    )
        .then(metaUserProjectInfo => {
            if(!metaUserProjectInfo) {
                return res.status(400).json({
                    error: {message: `No Projects`} 
                })
            } else {
                req.metaUserProjectInfo = metaUserProjectInfo
                next()
            }
        }).catch(next)

}

module.exports = {
    checkProjectExists,
    updateProject
}