var express = require("express");
var router = express.Router(); 
// Scraping dependencies
const axios = require("axios");
const cheerio = require("cheerio");
// Requiring Article model
var Article = require("../models/Article.js");
var SiteList = require("../models/SiteList.js");
//Require ExcelJs
const ExcelJS = require('exceljs');

let sitesObj = {}; //put stuff in this to push to db
var sites = [];
var finalSites = [];

router.get("/",function(req,res){

  Article.find({}).lean()
  // execute query
  .exec(function(error, body) {
      //console.log("FIRING");
      // Log any errors
      if (error) {
          console.log(error);
      }
      // Otherwise, send the body to the browser as a json object
      else {
        //console.log("Articles: ", body);   
        // console.log(body);
        res.render("index");
      }
  });
});

//FOR EACH:: IF LINK -- go into link, grab picture, data, etc in RTF
  //IF NOT LINK -- grab picture, data, etc in RTF
  //PUT IN MONGODB, PRINT TO XML

// A GET route for scraping Openculture
router.get("/scrape/openculture", function(req, res) {
    // Grab html with axios
    axios.get("http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/ident.html").then(function(response) {
      // Load into cheerio, save it to $ for shorthand selector
      var $ = cheerio.load(response.data);

      // console.log("RESPONSE:", response.data);

    // console.info("=========================================");
    // console.log("Cheerio version:", $);

      // WHAT YOU WANT TO DO: grab each link and follow them to get to plant info
      $( "td" ).each(function(i, element) {
        //NEED TO GET THE LINKS FROM THE TABLE, TO GO INTO THE LINKS TO GET MORE LINKS TO GET INFORMATION.......
        // console.log("this.chirren:::", this.children.attribs);
        
        const newSite = $(this).children("a").attr("href");
        if (newSite !== undefined && newSite !== 'http://www.rbgsyd.nsw.gov.au'){
          sites.push(newSite);
        }
        // console.log("Sites::", sites);
      });

      getSecondLayer();
  
      // Return to home page
      res.redirect("/");
    });
});

function getSecondLayer(){

  //||||||||||||||||||||||||||||||||||||||||||||||||
  // create workbook by api.
  var workbook = new ExcelJS.Workbook();

  // must create one more sheet.
  var sheet = workbook.addWorksheet("CycaScrape Export");

  // you can create xlsx file now.
  var reColumns=[
    {header:'URL',key:'URL'},
    {header:'Body',key:'Body'}
  ];
  sheet.columns = reColumns;
  //||||||||||||||||||||||||||||||||||||||||||||||||

  for (let i=0; i< sites.length; i++){
    // console.log("Site scraped: ", "http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + sites[i])
    // console.log( 
    //   "\n========================\n",
    //   "SCRAPED: http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + sites[i], " : \n"
    // )
    axios.get("http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + sites[i]).then(function(response) {
      SiteList.collection.drop();
      var x = cheerio.load(response.data);
      // console.log(
      //   "==================\n" +
      //   "LOG - " + sites[i] + ":",
      //   "RES:: ", response.data
      // );
      x( "a" ).each(function(i, element) {
        let finalSite = x(this).attr("href");

        //TEST
        // console.log(
        //   "finalSite:", finalSite
        // );

        if(finalSite !== undefined && finalSite !== 'http://www.rbgsyd.nsw.gov.au' && !finalSite.includes('#key')){
          //if it has ../.. ::
            if (finalSite.includes("../..")){
              let z = finalSite.replace("../..", "http://plantnet.rbgsyd.nsw.gov.au");
              if(finalSites.indexOf(z) === -1){
                finalSites.push(z);
              }
            }
          //if it doesn't have /
          else if (finalSite.charAt(0) !== '/') {
            let w = "http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + finalSite;
            if(finalSites.indexOf(w) === -1){
              finalSites.push(w);
            }
          }
          //otherwise ::
            else {
              let y = "http://plantnet.rbgsyd.nsw.gov.au" + finalSite;
              if(finalSites.indexOf(y) === -1){
                finalSites.push(y);
              }
            }
        }
      });
      //console.log("finalSites:" , finalSites);
      //ADD TO DB
      sitesObj.list = finalSites;
      SiteList.create(sitesObj)
        .then(function(dbSites) {
          console.log("COMPLETED ~");
          // console.log("dbSites:: ", dbSites);
          //LAST CALLBACK:: Take this list and scrape all THOSE sites


            // ──────────────███████──███████
            // ──────────████▓▓▓▓▓▓████░░░░░██
            // ────────██▓▓▓▓▓▓▓▓▓▓▓▓██░░░░░░██
            // ──────██▓▓▓▓▓▓████████████░░░░██
            // ────██▓▓▓▓▓▓████████████████░██
            // ────██▓▓████░░░░░░░░░░░░██████     -  EET'SA MEE!
            // ──████████░░░░░░██░░██░░██▓▓▓▓██
            // ──██░░████░░░░░░██░░██░░██▓▓▓▓██
            // ██░░░░██████░░░░░░░░░░░░░░██▓▓██
            // ██░░░░░░██░░░░██░░░░░░░░░░██▓▓██
            // ──██░░░░░░░░░███████░░░░██████
            // ────████░░░░░░░███████████▓▓██
            // ──────██████░░░░░░░░░░██▓▓▓▓██
            // ────██▓▓▓▓██████████████▓▓██
            // ──██▓▓▓▓▓▓▓▓████░░░░░░████
            // ████▓▓▓▓▓▓▓▓██░░░░░░░░░░██
            // ████▓▓▓▓▓▓▓▓██░░░░░░░░░░██
            // ██████▓▓▓▓▓▓▓▓██░░░░░░████████
            // ──██████▓▓▓▓▓▓████████████████
            // ────██████████████████████▓▓▓▓██
            // ──██▓▓▓▓████████████████▓▓▓▓▓▓██
            // ████▓▓██████████████████▓▓▓▓▓▓██
            // ██▓▓▓▓██████████████████▓▓▓▓▓▓██
            // ██▓▓▓▓██████████──────██▓▓▓▓████
            // ██▓▓▓▓████──────────────██████ 
// ──████  BU- NU - NU - NU-NUP -NUNT!! BROOP, BROOP, BROOP - BROOP DOOP DEEDOOP ………


          //FINAL LAYER

          let last = dbSites.list;
          // console.log("LAST:: ", last);
          // console.log("LAST first ::", last[0]);

          for (let j=0; j < last.length; j++){
            // console.log("Site scraped: ", "http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + sites[i])
            // console.log( 
            //   "\n========================\n",
            //   "SCRAPED: http://plantnet.rbgsyd.nsw.gov.au/PlantNet/cycad/" + sites[i], " : \n"
            // )
            axios.get(last[j]).then(function(response) {
              // console.log("RES DATA::", response.data);
              var lastX = response.data;
              
              //REMOVE FOOTER AND SCRIPTS
              
              //REGEX FOR REMOVING ALL TAGS & SCRIPTS
              // lastX.replace(/<script>.*>?/g, "");
              // lastX.replace(/<.*>?/g, "");
              
              console.log(
                "\n==================\n" + "lastURL:: ", last[j] + "\n" +
                "LASTX :: " + lastX + 
                "\n==================\n"
              );

              //PUSH TO XLSX OBJECT
              sheet.addRows([{URL: last[j].toString(), Body: lastX}]);

            });
              //console.log("finalSites:" , finalSites);
              //ADD TO DB
              
          };
          
          //CREATE XLSX; FIND A WAY TO HANDLE THIS AS A PROMISE
          workbook.xlsx.writeFile("./cycascrape.xlsx").then(function() {
            console.log("xls file is written.");
          });


          //END FINAL LAYER
          res.redirect("/");

        })
        .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
    });
  }
}

//GOAL: Get all "Final" sites into one object, then run through them all
//To do this; you will need to modify what is already here so that it collects ONLY USEFUL LINKS,
//and puts 'first layer' links with no second layer into the Useful Links section;
//THEN we will scrape information from all useful links



//                           ud$$$**$$$$$$$bc.
//                        u@**"        4$$$$$$$Nu
//                      J                ""#$$$$$$r
//                     @                       $$$$b
//                   .F                        ^*3$$$
//                  :% 4                         J$$$N
//                  $  :F                       :$$$$$
//                 4F  9                       J$$$$$$$
//                 4$   k             4$$$$bed$$$$$$$$$
//                 $$r  'F            $$$$$$$$$$$$$$$$$r
//                 $$$   b.           $$$$$$$$$$$$$$$$$N
//                 $$$$$k 3eeed$$b    $$$Euec."$$$$$$$$$
//  .@$**N.        $$$$$" $$$$$$F'L $$$$$$$$$$$  $$$$$$$
//  :$$L  'L       $$$$$ 4$$$$$$  * $$$$$$$$$$F  $$$$$$F         edNc
// @$$$$N  ^k      $$$$$  3$$$$*%   $F4$$$$$$$   $$$$$"        d"  z$N
// $$$$$$   ^k     '$$$"   #$$$F   .$  $$$$$c.u@$$$          J"  @$$$$r
// $$$$$$$b   *u    ^$L            $$  $$$$$$$$$$$$u@       $$  d$$$$$$
//  ^$$$$$$.    "NL   "N. z@*     $$$  $$$$$$$$$$$$$P      $P  d$$$$$$$
//     ^"*$$$$b   '*L   9$E      4$$$  d$$$$$$$$$$$"     d*   J$$$$$r
//          ^$$$$u  '$.  $$$L     "#" d$$$$$$".@$$    .@$"  z$$$$*"
//            ^$$$$. ^$N.3$$$       4u$$$$$$$ 4$$$  u$*" z$$$"
//              '*$$$$$$$$ *$b      J$$$$$$$b u$$P $"  d$$P
//                 #$$$$$$ 4$ 3*$"$*$ $"$'c@@$$$$ .u@$$$P
//                   "$$$$  ""F~$ $uNr$$$^&J$$$$F $$$$#
//                     "$$    "$$$bd$.$W$$$$$$$$F $$"
//                       ?k         ?$$$$$$$$$$$F'*
//                        9$$bL     z$$$$$$$$$$$F
//                         $$$$    $$$$$$$$$$$$$
//                          '#$$c  '$$$$$$$$$"
//                           .@"#$$$$$$$$$$$$b
//                         z*      $$$$$$$$$$$$N.
//                       e"      z$$"  #$$$k  '*$$.
//                   .u*      u@$P"      '#$$c   "$$c
//            u@$*"""       d$$"            "$$$u  ^*$$b.
//          :$F           J$P"                ^$$$c   '"$$$$$$bL
//         d$$  ..      @$#                      #$$b         '#$
//         9$$$$$$b   4$$                          ^$$k         '$
//          "$$6""$b u$$                             '$    d$$$$$P
//            '$F $$$$$"                              ^b  ^$$$$b$
//             '$W$$$$"         OH MY GOBLN!!!         'b@$$$$"
//                                                      ^$$$* 



/*

// A GET route for scraping ScienceNews
router.get("/exportxml", function(req, res) {
  //Get sites from sitelist
  console.log("BITCH FUCK U");
  SiteList.find({}), function(err, body){
    console.log("DID IT FUCKING WORK HO?! ::", body);
  

        // Grab html with axios
    axios.get("https://www.sciencenews.org/").then(function(response) {
      // Load into cheerio, save it to $ for shorthand selector
      var $ = cheerio.load(response.data);

      // WHAT YOU WANT TO DO: grab each image and display it, and the h2 associated with it
      $("li.term-river-grid__wrapper___fTw9V.with-image").each(function(i, element) {
        // Save an empty result object
        var result = {};

      });  
    });


  

    res.redirect("/");
  };
});
*/







/*


router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, query for Article with matching id
    // console.log("req: ", req);
    // console.log("res: ", res);
    Article.findOne({ "_id": req.params.id }).lean() //may need .lean()
    // ..and populate all of the notes associated with it
    .populate("comments")
    // now, execute our query
    .exec(function(error, body) {
      // Log any errors
      console.log("body: ", body);
        if (error) {
            console.log(error);
        }
        // Otherwise, send the body to the browser as a json object
        else {
            res.render("article", {article: body});
        }
    });
});

// Create a new comment 
router.post("/articles/comment", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    console.log("req.body: " , req.body)
    // And save the new comment the db
    // Use the article id to find and update comment array
    Article.findOneAndUpdate({ "_id": req.body._id }, { $push:{"comment": req.body.comment }},{new:true},function(err,body){
        if (err){
            console.log("ERROR - Could not add comment: " + err);
        }
        else{
            console.log("Body: ", body);
        };
    });
});

// Delete a comment 
router.post("/articles/comment/delete", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    //console.log("req.body: " , req.body)
    // And save the new comment the db
    // Use the article id to find and update comment array
    let commByArr = {};
    commByArr["comment"] = req.body.comment;
    console.log("commByArr:: ", commByArr);

    "comment." + req.body.index;
    Article.findOneAndUpdate({ "_id": req.body._id }, { $pull: commByArr}, function(err,body){
        if (err){
            console.log("ERROR - Could not delete comment: " + err);
        }
        else{
            //console.log("Body: ", body);
        };
    });
});


*/

module.exports=router;

