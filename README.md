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