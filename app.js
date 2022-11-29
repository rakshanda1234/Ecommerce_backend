const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");

//imported for associations
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

//urlencoded + json encoded
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//added association between Product and User
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

//one to one between cart and user
User.hasOne(Cart);
Cart.belongsTo(User);

//many to many between cart and product
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

//creating one dummy user
sequelize
  // .sync({ force: true })             //force:true added for force change and overwrite
  .sync()
  .then((result) => {
    return User.findByPk(1);
    console.log("result", result);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Max", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
