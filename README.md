# Small shop

## Roles:
- Owner : The owner of shop, with this role you should make general decisions about shop, create products, make newsletters, change the order status(ship them) etc; should have accews to general but not highest information
- Admin : This is to be used periodicly when some major changes happen such as email template change, api keys change etc. Also avaliable genral info on highest level
- Customer : normal user that shopes and buy things
- Anonymous : folks that buy without account or dispiute via magic link

## ToDo: 
 - [ ] // add middleware to attach - upload things to messages and disputes also to delete product photos and delete a variant from product properly incoporate in exsisting upload.middleware

 - [ ] Admin controleer -> del product (shouldnt it be in product controller) and then as admin route?,
 - [ ] better update sensitive data ino admin controller 

 - [ ] whats going on with the process payment in payment controller ? Is it just unneded Also are the tokens used in verify payment
 - [ ] in shipment controller the token expired error add at the last function

 - [ ] delete category only if there are no products in the category
 - [ ] variant controller - remove variant only if its not used, alsio in product make remove variant that also deletes the photos (mby not sure mby additional delete photo)

 - [ ] check promotion controller
 - [ ] make tag model and properly use it and check the controller and routes

 - [ ] make routes for site settings
 - [ ] update routes for making orders (seperate anonymous and logged in)
 - [ ] route for copied product and in general chack if all functions in controllers have its corresponding routes


## ToDo later mby:
 - [ ] Actual SEO things (im not sure if its correct with slugify) (and also global site-settings)

 - [ ] comprehensive tests with edge cases to check if everythin (or anything) works
 - [ ] will emails work? :'(-+=||=+-)':

Suggestions to improve:
 - Implement caching for frequently accessed data
 - Add rate limiting to prevent API abuse ( this is by traefik so not really)
 - Enhance the background job system for tasks like sending newsletters
 - Implement full-text search functionality for products
 - Consider adding analytics tracking for business insights
 - Plan for internationalization if you're considering expanding to multiple languages/currencies
 - the logging management tool ( for whole aplication )