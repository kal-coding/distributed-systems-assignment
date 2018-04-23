module.exports = {

  // FIXME: NEED TO ACTUALLY CREATE CONTROLLER

  friendlyName: 'Create this invoice',


  description: 'Creates a invoice and returns to /invoice once it Creates',


  exits: {

    success: {
      viewTemplatePath: 'pages/invoice/view-all',
    },
    badRequest: {
      statusCode: '500',
    },
    err: {
      statusCode: '500',
    }

  },


  fn: async function (inputs, exits) {

//
// -- User attempts to add an item to the list


//                !!!!!!!!!!!!!!!! AJAX??? !!!!!!!!!!!!!!!
// -----> cheese ID + quantity + factory is checked against the inventory to see if it has enough
// -----> if yes, then continue, else, send a notification saying oops. no k sorry bye.
// -----> at the end of adding all the inventory items send it to the sails server


// -----> the sails server then rechecks all the items
// --------> if still has enough items, then it locks the resource and deducts the item.
// -----> once all items are deducted,
// -----> add all the records to the InvoiceItemTable
// -----> return an OK.
//


    let fakeObject = {
      total : 300,
      invoiceItems : [
        {
          factoryID : 60,
          cheeseID: 60,
          quantity: 1,
          price: 100,
        },
        {
          factoryID : 60,
          cheeseID: 70,
          quantity: 2,
          price: 200,
        },
      ]
    }


    let i = 0;

    var flaverr = require('flaverr');
    sails.log('right outside of transaction')
    await sails.getDatastore()
    .transaction(async (db, proceed)=> {

      let {invoiceItems} = fakeObject

      console.log('plog -- invoiceItem.length',invoiceItems.length)

      // this FOR loop is like a forEach loop except it knows when it fucks up by checking for err
      for( let i = 0, err= undefined; i < invoiceItems.length && !err; i++ ) {
        await Inventory.findOne({
          where: {
            cheeseID: invoiceItems[i].cheeseID,
            factoryID: invoiceItems[i].factoryID,
          }
        }).usingConnection(db)
        .then( async result => {
          console.log('plog -- result.id exists: ',result.id)
          if( result.isBeingUpdated ){
            // this is where the try again a few times would go if we did the one that tries again like three times.
            err = 'words'
            throw flaverr('E_BEING_UPDATED', new Error('ERR: this record is being touched gently'))
          }

          // if not being updated. then LOCK THAT SHIT DOWN.
          Inventory.update(45)
          .set({
            isBeingUpdated: true
          })
          .then ( result => {
            console.log('plog -- result in update',result)
            if (!result) {
              err = 'words'
              throw  flaverr('E_UPDATE_ERROR', new Error('An error for Update occured'));
            }
          })

        })

      }


      return proceed()
    })
    .intercept('E_UPDATE_ERROR', ()=>{sails.log('ERR: A record has failed to update'); return'badRequest'} )
    .intercept('E_BEING_UPDATED', ()=>{sails.log('ERR: A record is being touched gently'); return'badRequest'} )
    // .intercept('E_BEING_UPDATED', ()=>'badRequest')
    .intercept('E_RECORD_BEING_UPDATED', ()=>'notFound');

    sails.log('at the end')
    // respond with a 200:
    return exits.success();

  } // end of the entire FN function



};

/*

var myAccount = await BankAccount.findOne({ owner: this.req.session.userId })
.usingConnection(db);
if (!myAccount) {
return proceed(new Error('Consistency violation: Database is corrupted-- logged in user record has gone missing'));
}


async.waterfall([
  function(callback) {
    callback(null, 'one', 'two');
  },
  function(arg1, arg2, callback) {
    // arg1 now equals 'one' and arg2 now equals 'two'
    callback(null, 'three');
  },
  function(arg1, callback) {
    // arg1 now equals 'three'
    callback(null, 'done');
  }
], (err, result) => {
  if(err){
    //
  }
})


*/
