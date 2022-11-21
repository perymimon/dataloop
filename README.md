# node crawler
    crawling source page until x deep to get all image url 
    result store at  `resutl.json` of `process.cwd`

## install 
git clone  https://github.com/perymimon/dataloop.git
git link

## use

```
crawl [srouce-url] [max-deep]
```

If it not works for some reason run the `index.js` in the `src` folder and give it two parameter:
- source-url : The url to start crawling. 
- max-deep : How far the crawler will go deep.

```
node ./src [srouce-url] [max-deep]
```
