(function(global) {  
    var CasesViewModel,
        app = global.app = global.app || {};
    
    var SelectedCaseViewModel = function(){
        var self = this;
        self.caseInfo = ko.observable();
        self.caseForms = ko.observableArray();
        self.importantDates = ko.observableArray();
        
        self.caseFactsVM = new MapViewModel();
        
        self.goToCaseFacts = function(){
            self.caseFactsVM.initialize(self.caseInfo().Id);
            app.application.navigate("#case-facts-view");
            
        };
    };
    
    var MapViewModel = function(){
        var self = this,
            mapkey = "AqYGTdo9tjH1B6AraKYQRn4jtdv3RT5l2irO0Dj6ZMwJFC4zdPoOaUGTiUL8MOXI";
        
        self.map;
        self.infobox;

        self.mapViewDataLayer = new Microsoft.Maps.EntityCollection();
        
        // can't execute this line until the DOM is ready
        self.initialize = function(caseId) {
            self.map = new Microsoft.Maps.Map(document.getElementById('map-canvas'), { credentials: mapkey });
            
            self.map.entities.push(self.mapViewDataLayer);
            var infoboxLayer = new Microsoft.Maps.EntityCollection();
            self.map.entities.push(infoboxLayer);
            self.infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), { visible: false, offset: new Microsoft.Maps.Point(0, 20) });
            infoboxLayer.push(self.infobox);
            
            
            
            app.api.getCaseFactsById(caseId, function(data){
                if (data.d.length > 0) {                
                    for (var i = 0, len = data.d.length; i < len; i++) {
                        var lat = data.d[i].PlaceLatitude;
                        var lon = data.d[i].PlaceLongitude;
                        var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lat, lon), null);
                        pushpin.Title = data.d[i].Topic;
                        pushpin.Description = data.d[i].EventMonth + "/" + data.d[i].EventDay + "/" + data.d[i].EventYear + " - " + data.d[i].Details;
                        Microsoft.Maps.Events.addHandler(pushpin, 'click', displayInfobox);
                        self.mapViewDataLayer.push(pushpin);
                    }
                    SetMapZoom(self.map, self.mapViewDataLayer);
                }
            });
            
            function displayInfobox(e) {
                if (e.targetType == 'pushpin') {
                    self.infobox.setLocation(e.target.getLocation());
                    self.infobox.setOptions({ visible: true, title: e.target.Title, description: e.target.Description });
                }
            }
            
            function SetMapZoom(mapcontrol, layer) {
                if (layer.getLength() > 1) {
                    /*
                    var locations = [];
                    for (var i = 0, len = layer.getLength() ; i < len; ++i) {
                        var location = layer.get(i).getLocation();
                        locations.push(location);
                    }
            
                    var boundingBox = Microsoft.Maps.LocationRect.fromLocations(locations);
                    mapcontrol.setView({ bounds: boundingBox });
                    */
                    // Haven't figured out why boundingBox isn't working on mobile. For now, just
                    // set view based on first location.
                    mapcontrol.setView({ zoom: 5, center: layer.get(0).getLocation()})
                }
                else if (layer.getLength() == 1) {
                    mapcontrol.setView({ zoom: 10, center: layer.get(0).getLocation()})
                }
            }
        };
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
                self.selectedCase.importantDates.removeAll();
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