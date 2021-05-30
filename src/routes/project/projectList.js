const ProjectService = require('../../services/project-service')

function listProjects(req, res, next) {
    const userId = req.user.sub

    ProjectService.getProjectIdBasedOnUser(
        req.app.get('db'),
        userId
    )
        .then(projectUser => {
            if(!projectUser) {
                return res.status(400).json({
                    error: {message: `No Projects`} 
                })
            }
            const projectIds = projectUser.map(item => item.project_id)
            ProjectService.getProjects(
                req.app.get('db'),
                projectIds
            )
                .then(projects => {
                    for(let i = 0; i < projects.length; i++) {
                        for(let j = 0; j < projectUser.length; j++) {
                            if(projects[i].project_id === projectUser[j].project_id) {
                                projects[i].role = projectUser[j].name
                            }
                        }
                    }
                    res.status(200)
                    .json(projects)
                })
        })
        .catch(next)

}

module.exports = {
    listProjects,
}