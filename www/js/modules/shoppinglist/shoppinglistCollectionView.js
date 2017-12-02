
var f7 = require('f7'),
    fs = require('fs'),
    utility = require('utils/utility'),
    slCollectionCompiledTemplate = Template7.compile(fs.readFileSync(__dirname + '/templates/shoppinglistCollection.html', 'utf8'));

function render(model, bindings) {

    f7.getCurrentView().router.loadContent(slCollectionCompiledTemplate(model));

    utility.bindEvents(f7.getCurrentView().activePage, bindings);

}

module.exports = {

    render : render
}