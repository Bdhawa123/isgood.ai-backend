const express = require('express')
const xss = require('xss')
const axios = require('axios')
const ProjectService = require('../services/project-service')
const AuthService = require('../services/auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const projectRouter = express.Router()
const jsonBodyParser = express.json()


  

projectRouter
    
    .get('/', requireAuth, jsonBodyParser, (req, res, next) => {
        // //Get userId
        // const authHeader = req.headers['authorization']
        // const token = authHeader && authHeader.split(' ')[1]
        // if (token == null) return res.status(401)
        // const userId = AuthService.verifyJwt(token).userId

        // ProjectService.getProjectIdBasedOnUser(
        //     req.app.get('db'),
        //     userId
        // )
        //     .then(projectUser => {
        //         if(!projectUser) {
        //             return res.status(400).json({
        //                 error: `No Projects` 
        //             })
        //         }
        //         const projectIds = projectUser.map(item => item.projectId)
        //         ProjectService.getProjects(
        //             req.app.get('db'),
        //             projectIds
        //         )
        //             .then(projects => {
        //                 res.status(200)
        //                 .json(projects)
        //             })
        //     })
        //     .catch(next)
        axios.get('https://api-dev.digitalhumani.com/tree?enterpriseId=7997dd50&user=fern@fakeemail.com')
        .then(response=>{
          // handle success
          res.send(response.data)
        })
        .catch(next)
 
    })

    // .post('/create', requireAuth, jsonBodyParser, (req, res, next) => {

    //             //Get userId
    //     const authHeader = req.headers['authorization']
    //     const token = authHeader && authHeader.split(' ')[1]
    //     if (token == null) return res.status(401)
    //     const userId = AuthService.verifyJwt(token).userId
        
    //         //deconstruct req.body
    //     const {name, description, projectImpacts, outcomesDesired, beneficiaries, geolocation, startDate, endDate, orgId } = req.body
        

    //         //construct newProject
    //     const newProject = {
    //         name: xss(name), 
    //         description: xss(description),
    //         geolocation: xss(geolocation),
    //         startDate: startDate,
    //         endDate: endDate,
    //         orgId: orgId
    //     }
        

    //         //make sure the fields are not empty
    //      for (const field of ['name', 'description', 'projectImpacts', 'outcomesDesired'])
    //      if (!req.body[field])
    //          return res.status(400).json({
    //              error: `Missing '${field}' in request body`
    //          })
        
    //          //create project table
    //     ProjectService.createProject (
    //         req.app.get('db'),
    //         newProject
    //     )
    //             //once project is created.. insert projectImpacts into impact table
    //         .then(project => {
    //             let newImpacts = []
    //             projectImpacts.map(impact => {{
    //                 newImpacts.push({
    //                     "projectId": project.projectId, 
    //                     "description": xss(impact)
    //                 })
    //             }})
    //             axios.get('https://api-dev.digitalhumani.com/tree?enterpriseId=7997dd50&user=fern@fakeemail.com')
    //             .then(response=>{
    //               // handle success
    //               console.log("your data is coming")
                
    //             ProjectService.createImpact(
    //                 req.app.get('db'),
    //                 newImpacts
    //             )
    //                     //once impacts are created.. insert projectOutcomes in outcome table
    //                 .then(impacts => {
    //                     console.log(response.data)
    //                     let newOutcomes = []
    //                     outcomesDesired.map(outcome => {
    //                         newOutcomes.push({
    //                             "projectId": project.projectId, 
    //                             "description": xss(outcome)
    //                         })
    //                     })
    //                     ProjectService.createOutcome(
    //                         req.app.get('db'),
    //                         newOutcomes
    //                     )
    //                             //once outcomes are created.. create userProject table
    //                         .then(outcomes => {
    //                             ProjectService.createProjectUser(
    //                                 req.app.get('db'),
    //                                 {
    //                                     projectId: project.projectId,
    //                                     userId: userId

    //                                 }
    //                             )
    //                                     //all required info is inserted now.. proceed if user added beneficiaries
    //                                 .then(projectUser => {
    //                                     if(!beneficiaries) {
    //                                         res.status(201)
    //                                         .json({
    //                                             projectId: project.projectId, 
    //                                             role: projectUser.role,
    //                                             name: xss(projectUser.name), 
    //                                             description: xss(projectUser.description),
    //                                             orgId: orgId,
    //                                             projectImpacts: xss(projectImpacts),
    //                                             outcomesDesired: xss(outcomesDesired),
    //                                             geolocation: xss(geolocation),
    //                                             startDate: startDate,
    //                                             endDate: endDate
    //                                         })
    //                                     }
    //                                         //if there are beneficiaries insert them into Beneficiary table
    //                                     else {
    //                                         const newBeneficiaries = []
    //                                         beneficiaries.map(beneficiary => {
    //                                             newBeneficiaries.push({
    //                                                 "projectId": project.projectId, 
    //                                                 "name": xss(beneficiary.name), 
    //                                                 "lifeChange": xss(beneficiary.lifeChange)
    //                                             })
    //                                         })
    //                                         ProjectService.createBeneficiaries(
    //                                             req.app.get('db'),
    //                                             newBeneficiaries
    //                                         )
    //                                                 //insert demographics into demographic table
    //                                             .then(beneficiaryRes => {
    //                                                 let newDemographics = []
    //                                                 for(let i = 0; i < beneficiaries.length; i++) {
    //                                                     if (beneficiaries[i].demographics) {
    //                                                         for(let j = 0; j < beneficiaries[i].demographics.length; j++) {
    //                                                                 if (!beneficiaries[i].demographics[j].name || !beneficiaries[i].demographics[j].operator || !beneficiaries[i].demographics[j].value) {
    //                                                                     return res.status(400).json({
    //                                                                         error: `Name, operator, and value required in demographics request body`
    //                                                                     })
    //                                                                 } else {
    //                                                                     newDemographics.push({
    //                                                                         "beneficiaryId": beneficiaryRes[i].beneficiaryId,
    //                                                                         "name": xss(beneficiaries[i].demographics[j].name),
    //                                                                         "operator": xss(beneficiaries[i].demographics[j].operator),
    //                                                                         "value": xss(beneficiaries[i].demographics[j].value)
    //                                                                     })
    //                                                                 }
                                                                
    //                                                         }
    //                                                     }
    //                                                 }
    //                                                 ProjectService.createDemographics(
    //                                                     req.app.get('db'),
    //                                                     newDemographics
    //                                                 )
    //                                                     .then(demographics => {
    //                                                             // All is well return the project. To get beneficiaries and demographics client will have to make a GET request
    //                                                         res.status(201)
    //                                                         .json({
    //                                                             projectId: project.projectId, 
    //                                                             role: projectUser.role,
    //                                                             name: xss(name), 
    //                                                             description: xss(description),
    //                                                             orgId: orgId,
    //                                                             projectImpacts: xss(projectImpacts),
    //                                                             outcomesDesired: xss(outcomesDesired),
    //                                                             geolocation: xss(geolocation),
    //                                                             startDate: startDate,
    //                                                             endDate: endDate
    //                                                         })
    //                                                     })
    //                                             })
    //                                     }
                                        
    //                                 })
                                
    //                         })
                        
    //             })  })
    //         })
    //         .catch(next)
    // })

    .post('/create', requireAuth, jsonBodyParser, (req, res, next) => {
            //Get userId
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        
        if (token == null) return res.status(401)
        
        const userId = AuthService.verifyJwt(token).userId
        
            //deconstruct req.body
        const {name, description, projectImpacts, outcomesDesired, orgId } = req.body

        // const string = outcomesDesired.toString()
        // console.log(string)
        

            //construct newProject
        const newProject = {
            name: xss(name), 
            description: xss(description),
            orgId: orgId
        }
        

            //make sure the fields are not empty
        for (const field of ['name', 'description', 'projectImpacts', 'outcomesDesired'])
        if (!req.body[field])
            return res.status(400).json({
                error: `Missing '${field}' in request body`
            })
        
            //create project table
        ProjectService.createProject (
            req.app.get('db'),
            newProject
        )
            .then(project => {
                let newImpacts = []
                projectImpacts.map(impact => {
                    newImpacts.push({
                        "projectId": project.projectId, 
                        "description": xss(impact)
                    })
                })
      
                ProjectService.createImpact(
                    req.app.get('db'),
                    newImpacts
                )
                 //once impacts are created.. insert projectOutcomes in outcome table
                    .then(impacts => {
                        let newOutcomes = []
                        outcomesDesired.map(outcome => {
                            newOutcomes.push({
                                "projectId": project.projectId, 
                                "description": xss(outcome)
                            })
                        })
                        ProjectService.createOutcome(
                            req.app.get('db'),
                            newOutcomes
                        )
                                // once outcomes are created.. create userProject table
                            .then(outcomes => {
                                ProjectService.createProjectUser(
                                    req.app.get('db'),
                                    {
                                        projectId: project.projectId,
                                        userId: userId

                                    }
                                )
                                    .then(projectUser => {
                                        res.status(201)
                                        .json({projectUser})
                                    })
                            })
                    })
            })
            .catch(next)
    })

 



module.exports = projectRouter

// {
//     name: "test",
//     description: "dxftdkrxghijoih'ug;yflhkt",
//     projectImpacts: ["ertvwerb eb", "evwevweveq", "efvweveqveqv"],
//     outcomesDesired: ["fvwevrvwvt", "efvwevwqvq", "ervewvrvw"],
//     beneficiaries: [
//         {
//            name: "ljhvkv",
//            change: ",jh kgvj",
//            demographics: [
//                {
//                    type: "age",
//                    operator: ">",
//                    value: "10"
//                },
//            ] 
//         },
//     ],
//     geolocation: ["ervweqv", "vevewveq"],
//     startDate: "timestamp",
//     endDate: "timestamp",
//     indicators: [
//         {
//             indicatorId: "",
//             indicator: "",
//             strength: "", 
//         }
//     ]

// }