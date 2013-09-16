(function(global) {  
    var SearchViewModel,
        app = global.app = global.app || {};
    
    SearchViewModel = function() {
        var self = this;
        self.searchTerm = ko.observable();
        self.searchResults = ko.observableArray();
        
        self.executeSearch = function(){
            app.api.executeSearch(self.searchTerm(), function(data){
                self.searchResults(data.d);
            });
        };
        
        
        return {
            searchTerm: self.searchTerm,
            executeSearch: self.executeSearch,
            searchResults: self.searchResults
        }
    };  

    app.searchVM = new SearchViewModel();
})(window);