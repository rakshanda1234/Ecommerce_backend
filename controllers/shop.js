const Product = require("../models/product");
const Cart = require("../models/cart");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  //   .then((products) => {
  //     console.log(products);
  //     res.json({ products, success: true });
  // res.render("shop/product-list", {
  //   prods: products,
  //   pageTitle: "All Products",
  //   path: "/products",
  // });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  const page = +req.query.page || 1;
  let total_items;
  Product.findAndCountAll({
    offset: (page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
  })
    .then((response) => {
      total_items = response.count;
      res.status(200).json({
        totalItems: total_items,
        hasNextPage: page * ITEMS_PER_PAGE < total_items,
        hasPreviousPage: page > 1,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(total_items / ITEMS_PER_PAGE),
        products: response.rows,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then((products) => {
  //     res.json({ products, success: true });
  //     res.render("shop/product-detail", {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: "/products",
  //     });
  // })
  // .catch((err) => console.log(err));

  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/product",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  // req.user.getCart()
  // .then((cart)=>{
  //   return cart.getProducts();
  // })
  // .then((products)=>{
  //     res.render('shop/cart', {
  //     path: '/cart',
  //     pageTitle: 'Your Cart',
  //     products:products
  //   });
  // })
  // .catch(err=>{
  //   console.log(err)
  // })
  const ITEMS_PER_PAGE = 2;
  let total_items;
  let fetchedCart;
  let all_products;
  let page = +req.query.page || 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.countProducts();
    })
    .then((count) => {
      total_items = count;
      return fetchedCart.getProducts();
    })
    .then((allProducts) => {
      all_products = allProducts;
      return fetchedCart.getProducts({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
    })
    .then((products) => {
      res.status(200).json({
        totalItems: total_items,
        allProducts: all_products,
        products: products,
        hasNextPage: page * ITEMS_PER_PAGE < total_items,
        hasPreviousPage: page > 1,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(total_items / ITEMS_PER_PAGE),
      });
    })
    .catch(() => {
      res
        .status(500)
        .json({ success: false, message: "can not extract from cart" });
    });
};

exports.postCart = (req, res, next) => {
  if (!req.body.productId) {
    return res
      .status(400)
      .json({ success: false, message: "product Id is missing" });
  }

  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Successfully added the product" });
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: "Error occured" });
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
