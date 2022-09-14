import { Router } from 'express'
const apiSubRouter = Router({mergeParams: true})

const edges: string[] = [
  'users'
]

export default (apiRouter: Router) => {
  for (const edge of edges) {
    require(`./${edge}`)(apiSubRouter)
    apiRouter.use(`/${edge}`, apiSubRouter)
  }
}