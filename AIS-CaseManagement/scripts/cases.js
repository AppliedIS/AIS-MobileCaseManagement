(function(global) {  
    var CasesViewModel,
        app = global.app = global.app || {};
    
    var SelectedCaseViewModel = function(){
        var self = this;
        self.caseInfo = ko.observable();
        self.caseForms = ko.observableArray();
        self.importantDates = ko.observableArray();
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
                // Set Case Forms
                var formsList = _.chain(data.d)
                    .filter(function(item) { return item.Status != "SerializedDocuments"; })
                    .map(function(item) { return item.ItemCount + " " + item.Status })
                    .value();
                
                self.selectedCase.caseForms(formsList);
            
                // Set Important Dates
                var openingDt = moment(item.OpeningDate);
                self.selectedCase.importantDates.push(openingDt.format("MM/DD/YYYY") + " - Case Opened");
                var anniversaryDt = self.getAnniversaryDate(openingDt);
                self.selectedCase.importantDates.push(anniversaryDt.format("MM/DD/YYYY") + " - Anuual Review");
                var yearDiff = anniversaryDt.year() - openingDt.year();
                self.selectedCase.importantDates.push(anniversaryDt.format("MM/DD/YYYY") + " - " + yearDiff + " year anniversary");
            });
        };
        
        self.loadData = function(){
            app.api.getOpenCases(function(data){
                self.cases(data.d);
            });
        };
        
        // Private methods
        self.getAnniversaryDate = function(opening){
            var anniversaryThisYear = moment({ month: opening.month(), day: opening.date() });
            if (moment().isAfter(anniversaryThisYear)){
                anniversaryThisYear.add("years", 1);
            }
            return anniversaryThisYear;
        }
        
        
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