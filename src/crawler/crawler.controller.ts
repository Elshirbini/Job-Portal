import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ApiError } from "../utils/apiError";
import * as cheerio from 'cheerio';
import { success } from "../utils/response";


@injectable()
export class CrawlerController {
    constructor(){}

    public crawlUrl = async (req: Request , res: Response) => {
        const { url } = req.body;
        let parsedUrl: URL;

      parsedUrl = new URL(url);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ApiError('Only HTTP and HTTPS are allowed',400);
    }

    const response = await fetch(parsedUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch page: ${response.status}`,
        400
      );
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('text/html')) {
      throw new ApiError('URL must return HTML',400);
    }

    console.log('Crawling URL:', parsedUrl.href);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text().trim();
    const description =
    $('meta[name="description"]').attr('content') ?? null;

    const headings = $('h1, h2, h3')
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean);

    const links = $('a[href]')
      .map((_, element) => {
        const href = $(element).attr('href');
        return href ? new URL(href, parsedUrl).href : null;
      })
      .get()
      .filter((link): link is string => link !== null);

    $('script, style, noscript, svg').remove();

    const text = $('body').text().replace(/\s+/g, ' ').trim();


    return success(res,200,{
      url: parsedUrl.href,
      statusCode: response.status,
      title,
      description,
      headings,
      links: [...new Set(links)],
      text,
    })
    }
}