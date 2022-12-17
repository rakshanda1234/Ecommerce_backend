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
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const app = express();

const dotenv = require("dotenv");

//get config vars
dotenv.config();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

//urlencoded + json encoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

//request is made and move to next
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

app.use((req, res) => {
  console.log("urlll", req.url);
  res.sendFile(path.join(__dirname, "public/${req.url}"));
});

//added association between Product and User
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

//one to one between cart and user
User.hasOne(Cart);
Cart.belongsTo(User);

//many to many between cart and product
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

//one to many between user and order
User.hasMany(Order);
Order.belongsTo(User);

//Many to many between user and order-product
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

//creating one dummy user
sequelize
  // .sync({ force: true }) //force:true added for force change and overwrite
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: "Max",
        email: "test@test.com",
      });
    } else return user;
  })
  .then((user) => {
    Cart.findByPk(1).then((cart) => {
      if (!cart) return user.createCart();

      return cart;
    });
  })

  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
