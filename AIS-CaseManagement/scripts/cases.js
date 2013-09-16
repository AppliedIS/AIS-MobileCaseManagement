(function(global) {  
    var CasesViewModel,
        app = global.app = global.app || {};
    
    var SelectedCaseViewModel = function(){
        var self = this;
        self.caseInfo = ko.observable();
        self.caseForms = ko.observableArray();
    };
    
    CasesViewModel = function() {
        var self = this;
        
        // data
        self.cases = ko.observableArray();
        self.selectedCase = new SelectedCaseViewModel();
        
        
        // functions
        self.numberCases = ko.computed(function(){
            return self.cases().length;
        });
        
        self.selectCase = function(item){
            console.log(item);
            self.selectedCase.caseInfo(item);
            app.application.navigate("#case-detail-view");
            app.api.getDocumentSummaryForCase(item.Id, function(data){
                var formsList = _.chain(data.d)
                    .filter(function(item) { return item.Status != "SerializedDocuments"; })
                    .map(function(item) { return item.ItemCount + " " + item.Status })
                    .value();
                
                self.selectedCase.caseForms(formsList);
            });
            
            //TODO: don't even need this call (remove it!)
            // Just use OpeningDate from current item
            // Then use momentjs to parse required dates to match other UI.
            app.api.getCasesById(item.Id, function(data){
               console.log("getcasesbyId", data); 
            });
        };
        
        self.loadData = function(){
            app.api.getOpenCases(function(data){
                self.cases(data.d);
            });
        };
        
        
        return {
            loadData: self.loadData,
            cases: self.cases,
            numberCases: self.numberCases,
            selectedCase: self.selectedCase,
            selectCase: self.selectCase
        }
    };  

    app.casesVM = new CasesViewModel();
})(window);