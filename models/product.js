const mongoose=require('mongoose')
const productSchema=new mongoose.Schema({
        name:{
            type: String,
            required:[true, 'Enter Product Name'],
            trim:true,
            maxLength:[100, 'Product name Cannot exceet 100 character']
        },
        price:{
            type: Number,
            required:[true, 'Enter Product Price'],
            maxLength:[10, 'Product name Cannot exceet 10 character'],
            default: 0.0
        },
        description:{
            type: String,
            required:[true, 'Enter Product description'],
        },
        ratings:{
            type: Number,
            default: 0.0
        },
        images:[
            {
                public_id:{
                    type: String,
                    required: true,
                },
                url:{
                    type: String,
                    required: true,
                }
            }
        ],
        category:{
            type: String,
            required:[true, 'Enter Product Category'],
            enum:{
                values:[
                    'Electronics',
                    'Cameras',
                    'Laptops',
                    'Accessories',
                    'Headphones',
                    'Food',
                    'Books',
                    'Clothes',
                    'Sports',
                    'Outdoors',
                    'Home',
                ],
                message: 'Select Correct category for this products'
            }
        },
        seller:{
            type: String,
            required:[true, 'Enter Product Seller'], 
        },
        stock:{
            type: Number,
            required:[true, 'Enter Product Stock'],
            maxLength:[10, 'Product name Cannot exceet 10 character'],
            default: 0
        },
        numOfReviews:{
            type: Number,
            default: 0
        },
        reviews:[
          { user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true
            },
            name:{
                type: String,
                required:true
            },
            rating:{
                type: Number,
                required:true
            },
            comment:{
                type: String,
                required:true
            }
          }
     ],
     user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
     },
     createdAt:{
         type:Date,
         default:Date.now
     }

    
})

module.exports=mongoose.model('Product',productSchema);
