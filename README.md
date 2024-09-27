# Small shop

## Roles:
- Owner : The owner of shop, with this role you should make general decisions about shop, create products, make newsletters, change the order status(ship them) etc; should have accews to general but not highest information
- Admin : This is to be used periodicly when some major changes happen such as email template change, api keys change etc. Also avaliable genral info on highest level
- Customer : normal user that shopes and buy things
- Anonymous : folks that buy without account or dispiute via magic link

## ToDo: 
 - [ ] refund payment

 - [ ] should i make generating tokens int its own middleware or util (its a lot and it obsures the auth and isnt really auth function)
 - [ ] should i schedule cleaning job for resolved disputes?

## ToDo later mby:
 - [ ] check promotion controller
 - [ ] inventory schema is not needed here but could be incoporated
 - [ ] del product should be in bloated product controller insted of admin one (its there becouse the product is so bloated)
 - [ ] if emailError should i eg not register user etc ? catch(emailError) {logger.error('Failed to send verification email', { error: emailError, userId: user._id });}


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