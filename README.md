# Item collector 

Full stack app with a backend CRUD api tied to a mongo database.

<!-- [Running at glitch](https://item-collector.glitch.me/) -->


## Functionality

Add, edit and delete an item.

Get and delete all items. 

An item cannot be empty.
- An error message will be displayed when trying to add an empty item and it will disappear when a valid input is entered.
- Trying to edit an already added item into an empty string will be ignored.

Delete all items will display a modal with a reminder that the action will delete all items with the possibility to cancel or proceed.

When there are no items, the css selector <code>:empty</code> will provide a no items message.

Sanitizing and escaping input.

The layout is not optimized for longer input than what fits on a line.


## Development

Developed with Pug, Parcel, Express, Mongoose.

Testing of the api and the mongo model with Jest and Supertest using a local mongodb.
