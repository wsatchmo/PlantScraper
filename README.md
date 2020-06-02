# PlantScraper

Triple-layer scrape

Uses CheerioJS, ExcelJS, Axios, MongoDB, and of course Node/Express

Instructions for Al:

Install [Homebrew](https://brew.sh/) and [Brew install Node](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x) or install [Node.js](https://nodejs.org/en/download/) directly from the install package; NPM (node package manager, or no peanuts man, or nothing perfectly meaningful, or november puppies megacity, etc.) will be installed automatically. 

Check to make sure it installed by opening terminal and typing in 
```bash
node -v
```
It should give you a version number; if it gives you anything else, try again, sucka! (or email me for help, nbd).

If all goes well, you'll need to install the required packages. cd (change directory) to the file downloaded, and run 
```bash
npm install
```
Sit back and wait for it to install.

You'll also need to install MongoDB, [the instructions for which can be found here](https://docs.mongodb.com/manual/installation/). They can be a little hard to follow; again, let me know if you need help. 

Afterward, run these in two different terminal tabs:
```bash
mongo
mongodb
```
Cross your fingers for no errors; if there are any, their fixes can almost assuredly be found on the webbernet. Good luck!

After it's done, run
```bash
node server.js
```

It will run on localhost 3001 - so either click the given link or visit https://localhost:3001/

If everything is right so far, the site will come up; just hit the scrape PlantNet button, and an XLSX file should be generated via ExcelJS in the same file, containing (most of) the Cycad informaiton from Plantnet

Let me know if you need any assistance - good luck!
