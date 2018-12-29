const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product {
   constructor(title, price, description, imageUrl, id, userId) {
     this.title = title;
     this.price = price;
     this.description = description;
     this.imageUrl = imageUrl;
     this._id = id ? new mongodb.ObjectId(id): null; 
     this.userId = userId;
   }

   save() {
    const db = getDb();
    let dbOp;
     if(this._id) {
       //Update Product
      dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this }); 
     } else{
       //Insert Product
      dbOp = db.collection('products').insertOne(this);
     }
    return dbOp
        .then(result => {
          console.log(result);
        })
        .catch(e => console.log(e));
   }

   static fetchAll() {
    const db = getDb();
      return db.collection('products')
          .find()
          .toArray()
          .then(products => {
            console.log(products);
            return products;
          })
          .catch(e => console.log(e));          
   }

   static findById(prodID) {
     const db = getDb();
     return db
         .collection('products')
         .find({_id: mongodb.ObjectID(prodID)})
         .next()
         .then(product => {
           console.log(product);
           return product;
         })
         .catch(e => console.log(e))
   }

   static deleteById(prodId) {
     const db = getDb();
     return db
      .collection('products')
      .deleteOne( {_id: new mongodb.ObjectId(prodId) })
      .then(result => console.log('Deleted!'))
      .catch(e => console.log(e));
    }
}
module.exports = Product;
