#!/usr/bin/env node
import puppeteer from 'puppeteer';
import Configstore from 'configstore';
import {join} from 'path';
import ora from 'ora';

const browser = await puppeteer.launch({headless: false});
const page = await browser.newPage();

const store = new Configstore('result', {}, {configPath: join(process.cwd(), 'result.json')});
const spinner = ora('Loading unicorns')

/*  MAIN CODE */
const [, , argUrl, maxDeep] = process.argv;
spinner.start('Crawling into the web ...');
const result = await crawlDeep(argUrl, Number(maxDeep))
store.set('result', result)
spinner.succeed('Crawl complete. Check result.json')
await browser.close();
/* end MAIN CODE */

//----------------- crawlDeep -----------------
async function crawlDeep(sourceUrl, maxDeep = 0) {
    const stack = [{sourceUrl, deep: 0}];
    const imageDetails = []
    const urlTagged = new Set([sigUrl(sourceUrl)])


    while (stack.length) {
        const {sourceUrl, deep} = stack.shift();
        await page.goto(sourceUrl,{
            waitUntil:'networkidle2'
        });

        // look for all <img> in the page 
        let imagesURL = await page.$$eval('img', function (imgs) {
            return imgs.map(img => img.src)
        })

        let styleURL = await page.$$eval('[style]', function (elms){
            return elms.map( e=> e.getAttribute('style')).map(s => s.match(/background.*?url\((.+?)\)/)).filter(Boolean).map( a=> a[1])
        })

        // save all images url in the collection
        for (let url of [imagesURL, styleURL].flat()) {
            imageDetails.push({
                imageUrl: url,
                sourceUrl: sourceUrl,
                depth: deep
            })
        }

        if (deep < maxDeep) {
            // Look for all <a> in the page
            const links = await page.$$eval('a', function (a) {
                return a.map(a => a.href)
            })

            // If there is new links save them for next check
            for (let link of links) {
                if (link == '') continue;
                if (urlTagged.has(sigUrl(link))) continue;
                urlTagged.add(sigUrl(link))
                stack.push({
                    sourceUrl: link,
                    deep: deep + 1
                })
            }
        }
    }

    return imageDetails;
}

//----------------- signature URL -----------------
function sigUrl(url) {
    try {
        const $url = new URL(url);
        return url.replace($url.hash, '').replace($url.protocol, '');
    } catch (e) {
        console.error(`url ${url} are not legal`)
        debugger
    }

}