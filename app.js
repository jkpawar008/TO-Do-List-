//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://jkpawar008:jayesh98@cluster0.bzdgm.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = new mongoose.model("List", listSchema);

const item1 = new Item({
  name: "welcome to your to-do list",
});
const item2 = new Item({
  name: "hit that + button to add item..",
});
const item3 = new Item({
  name: "hit enter to save.",
});

//if we want to delete record ...here we are deleting all the record by keeping {} field in condition.
// Item.deleteMany({}, function(err) {
//   if(err) console.log(err)
// })

let defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("insertion successful");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: result });
      }
    }
  });

  // res.render("list", {listTitle: "Today", newListItems: items});
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;
  // Item.insertMany([{name: item }] ,function(err) {
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     console.log("inserted one item succesfully.!!")
  //   }
  // })

  //to add only one item...since we don't have insertOne method ..so alternatively we can do

  const newItem = new Item({
    name: item,
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        result.items.push(newItem);
        result.save();
        res.redirect("/" + listName);
      }
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  let checkedId = req.body.checked; //this will give us value of that field since we have value assign for that field now
  let listName = req.body.routeName;
  console.log(listName + " & " + checkedId);
  if (listName === "Today") {
    Item.deleteMany({ _id: checkedId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deletion successful .!!");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedId } } },
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          // console.log("deletion successful ...from custom list !!");
        }
      }
    );
    res.redirect("/" + listName);
  }
});
app.get("/:customParam", function (req, res) {
  // console.log(req.params.customParam);
  const customParam = lodash.capitalize(req.params.customParam);

  List.findOne({ name: customParam }, function (err, resultObj) {
    if (err) {
      console.log(err);
    } else {
      if (!resultObj) {
        // console.log("list doesn't already exist");
        //then creating new list
        const list = new List({
          name: customParam,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customParam);
      } else {
        // console.log("list exists !");
        //show existing list
        res.render("list", {
          listTitle: resultObj.name,
          newListItems: resultObj.items,
        });
      }
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});   
