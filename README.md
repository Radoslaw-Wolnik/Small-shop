# Small shop

## Roles:
- Owner : The owner of shop, with this role you should make general decisions about shop, create products, make newsletters, change the order status(ship them) etc; should have accews to general but not highest information
- Admin : This is to be used periodicly when some major changes happen such as email template change, api keys change etc. Also avaliable genral info on highest level
- Customer : normal user that shopes and buy things
- Anonymous : folks that buy without account or dispiute via magic link

## ToDo: 
- [ ] Actual SEO things (product slug and category should be masde using npm slug) (and also global site-settings)
- [ ] Api insted of placeholders in services (payment and shipment)
- [ ] Added dispiute-order model and promotion-code model -> make controllers and routes 

- [ ] Admin controleer -> del product (shouldnt it be in product controller), change email template (should i make seperate controller for that? and imort from there in adfmin routes)

- [ ] deactivated?: Date; // idk if its better to put it here or to make sepret schema with deactivated users - to be deleted in a week time or in User schema
- [ ] Added last time active to user schema - make usage of it in login
- [ ] // add middleware to attach - upload things to messages and disputes
- [ ] Change register to also handle if the account is there but is anonymous (change things  and anon flag)
- [ ] add registration from magic link
- [ ] if not making order from logged in acc make magic link and new user anonymous acc

Suggestions to improve:
 - Implement caching for frequently accessed data
 - Add rate limiting to prevent API abuse ( this is by traefik so not really)
 - Enhance the background job system for tasks like sending newsletters
 - Implement full-text search functionality for products
 - Consider adding analytics tracking for business insights
 - Plan for internationalization if you're considering expanding to multiple languages/currencies
 - the logging management tool ( for whole aplication )