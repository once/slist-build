function listItem(options) {

    this.type = options.type || 'simple';
    this.crossedOut = false;
    this.quantity = options.quantity || 1;

    this.id = options.id || '';
    this.offer_id = options.offer_id || '';
    this.name = options.name || '';
    this.img = options.img || '';
    this.advertiser = options.advertiser || '';
    this.advertiser_id = options.advertiser_id || '';
    this.system_date_to = options.system_date_to || '';
    this.price_old = options.price_old || '';
    this.price_new = options.price_new || '';



}



module.exports = {

    listItem : listItem
}