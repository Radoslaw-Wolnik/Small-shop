# Small shop

## Roles:
- Owner : The owner of shop, with this role you should make general decisions about shop, create products, make newsletters, change the order status(ship them) etc; should have accews to general but not highest information
- Admin : This is to be used periodicly when some major changes happen such as email template change, api keys change etc. Also avaliable genral info on highest level
- Customer : normal user that shopes and buy things
- Anonymous : folks that buy without account or dispiute via magic link

## ToDo: 
 - [ ] Actual SEO things (product slug and category should be masde using npm slug) (and also global site-settings)
 - [ ] Api insted of placeholders in services (payment and shipment)

 - [ ] Admin controleer -> del product (shouldnt it be in product controller), change email template (should i make seperate controller for that? and imort from there in adfmin routes)

 - [ ] Added last time active to user schema - make usage of it in login
 - [ ] // add middleware to attach - upload things to messages and disputes also to delete product photos and delete a variant from product

 - [ ] update inventory logic and inventory management

 - [ ] delete category only if there are no products in the category
 - [ ] insted of this make a compare or sth in the schemas or sth better tbh this is embarassing 
 const slug = slugify(name, { lower: true, strict: true });
    const existingProduct = await Product.findOne({ 'seo.slug': slug });
    if (existingProduct) {
      throw new BadRequestError('A product with this name already exists');
    }
 - [ ] better update sensitive data ino admin controller 
 - [ ] better email-template (categories or labels and also make usage of them across aplication) and not schema but insted json in resources dir
 - [ ] create deactivation account token request fro deactivationg account (in auth.controller) deactivate account 1. auth create deactivation token 2. user.deactivate my acc 
 - [ ] order controller fix 
 - [ ] whats going on with the process payment in payment controller ? Is it just unneded Also are the tokens used in verify payment
 - [ ] in shipment controller the token expired error add at the last function
 - [ ] idk if use product template is good in product template controller
 - [ ] check promotion controller
 - [ ] make tag model and properly use it and check the controller and routes
 - [ ] variant controller - remove variant only if its not used, alsio in product make remove variant that also deletes the photos (mby not sure mby additional delete photo)
 - [ ] make routes for siter settings
 - [ ] copy and modify exsisting product insted of product template
 - [ ] make sendEmail(email-template, data-nneded) or sendVerificationemail, sendSth email
 - [ ] in prodyct schema im not sure if reserve and relese inventory functions work

Suggestions to improve:
 - Implement caching for frequently accessed data
 - Add rate limiting to prevent API abuse ( this is by traefik so not really)
 - Enhance the background job system for tasks like sending newsletters
 - Implement full-text search functionality for products
 - Consider adding analytics tracking for business insights
 - Plan for internationalization if you're considering expanding to multiple languages/currencies
 - the logging management tool ( for whole aplication )