import express from 'express'
import { CrawlerController } from './crawler.controller'
import { container } from 'tsyringe'


const router = express.Router()
const crawlerController = container.resolve(CrawlerController)

router.post('/', crawlerController.crawlUrl)

export const crawlerRoutes = router