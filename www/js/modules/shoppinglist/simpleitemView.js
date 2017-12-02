
 var f7 = require('f7'),
     fs = require('fs'),
     utility = require('utils/utility'),
     simpleItemTemplate = fs.readFileSync(__dirname + '/templates/simpleitem.html', 'utf8'),
     simpleItemCompiledTemplate = Template7.compile(simpleItemTemplate);


function render (item, bindings) {
      
      $$(f7.getCurrentView().activePage.container).html(simpleItemCompiledTemplate(item));      
                
      utility.bindEvents(f7.getCurrentView().activePage, bindings);


}


module.exports = {

    render: render
}