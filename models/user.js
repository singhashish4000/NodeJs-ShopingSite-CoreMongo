const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const db = getDb();
    const cartProductsIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    
    if(cartProductsIndex >= 0) {
      newQuantity = this.cart.items[cartProductsIndex].quantity + 1;
      updatedCartItems[cartProductsIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({ 
        productId: new mongodb.ObjectId(product._id), 
        quantity : newQuantity
      });
    }

    const updatedCart = {items: updatedCartItems};
    return db
      .collection('users')
      .updateOne(
      {_id: new mongodb.ObjectId(this._id)},
      {$set: {cart: updatedCart} }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db
      .collection('products')
      .find({_id: {$in: productIds}})
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
               return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      })
      .catch(e => console.log(e));
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb(); 
    return db
    .collection('users')
    .updateOne(
    {_id: new mongodb.ObjectId(this._id)},
    {$set: {cart: {items: updatedCartItems} } }
    );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.username
          }
        };
        return db
        .collection('orders')
        .insertOne(order);
      })
      .then(result => {
        this.cart = {items: []};
        return db
        .collection('users')
        .updateOne(
        {_id: new mongodb.ObjectId(this._id)},
        {$set: {cart: {items: [] } } }
        );
      })

      .catch(e => console.log(e));
  };

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({'user._id': new mongodb.ObjectId(this._id)})
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
  }
}

module.exports = User;
