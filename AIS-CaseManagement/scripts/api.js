(function(global) {  
    var app = global.app = global.app || {},
        self = this;
    
    self.savedServer = localStorage.getItem("remote-server") || "bawlabapp01.cloudapp.net";
    self.baseUrl = "http://" + self.savedServer + ":25000/Pages";
    self.authenticationHeader = "Basic " + btoa(localStorage.getItem("username") + ":" + localStorage.getItem("password"));
    
    self.remoteServer = ko.observable(savedServer);
    
    self.remoteServer.subscribe(function(newValue){
        self.remoteServer(newValue);
        baseUrl = "http://" + newValue + ":25000/Pages"
        localStorage.setItem("remote-server", newValue);
        app.reloadAll();
    });
    
    var inputParams = {
        hostUrl: encodeURIComponent("http://bawlabapp01/sites/development"),
        agentLogin: encodeURIComponent("i:0#.w|" + localStorage.getItem("username"))
    };

    
    /***** Operations for Dashbaord *****/
    self.executeLogin = function(username, password, callback){
        self.authenticationHeader = "Basic " + btoa(username + ":" + password);
        inputParams.agentLogin = encodeURIComponent("i:0#.w|" + username);
        
        // There is no API call for login. So we're just going to execute a search for something
        // that we know won't produce results. Either we get a 401 (login failed) or we get empty array (success).
        self.executeSearch("ThisIsAMajorHackForASearchTermThatDoesNotExist!!!", function(data){
            if (typeof data === "string"){
                callback(data);
            }
            else if(data.d.length === 0){
                callback("Success");
            }
            else{
                callback(data);
            }
        });
    };
    
    self.getDashboardTasks = function(callback){
        self.httpPost(baseUrl + "/dashboard.aspx/GetDashboardTasks", { hostUrl: inputParams.hostUrl, agentLogin: inputParams.agentLogin }, callback);
    };
    
    /***** Operations for Search *****/
    self.executeSearch = function(queryText, callback){
        self.httpPost(baseUrl + "/search.aspx/RunSearch", { hostUrl: inputParams.hostUrl, agentLogin: inputParams.agentLogin, queryText: queryText }, callback);
    };
    
    
    /***** Operations for Cases *****/
    self.getOpenCases = function(callback){
        self.httpPost(baseUrl + "/dashboard.aspx/GetOpenCasesForAgent", { hostUrl: inputParams.hostUrl, agentLogin: inputParams.agentLogin }, callback);
    };
    
    self.getDocumentSummaryForCase = function(caseId, callback){
        self.httpPost(baseUrl + "/case.aspx/GetDocumentSummaryForCase", { hostUrl: inputParams.hostUrl, caseId: caseId }, callback);
    };
    
    self.getCasesById = function(caseId, callback){
        self.httpPost(baseUrl + "/case.aspx/GetCasesById", { hostUrl: inputParams.hostUrl, id: caseId }, callback);
    };
    
    self.getCaseFactsById = function(caseId, callback){
        self.httpPost(baseUrl + "casefacts.aspx/GetCaseFactsByCaseId", { hostUrl: inputParams.hostUrl, id: caseId }, callback);
    };
    
    
    /***** Operations for Tasks *****/
    self.getFormForTask = function(task, callback){
        self.httpPost(baseUrl + "/dashboard.aspx/GetFormRepresentationForTask", { hostUrl: inputParams.hostUrl, webUrl: task.Url, taskId: task.Id }, callback);
    };
    
    self.getTaskApprovers = function(callback){
        self.httpPost(baseUrl + "/dashboard.aspx/GetTeamMembersByLogin", { hostUrl: inputParams.hostUrl, agentLogin: inputParams.agentLogin }, callback);
    };
    
    self.approveTask = function(task, nextApprover, callback){
        self.httpPost(baseUrl + "/dashboard.aspx/ApproveTask", { hostUrl: inputParams.hostUrl, webUrl: task.Url, taskId: task.Id, nextApprover: nextApprover }, callback);    
    };
    
    self.rejectTask = function(task, callback){
        self.httpPost(baseUrl + "/dashboard.aspx/RejectTask", { hostUrl: inputParams.hostUrl, webUrl: task.Url, taskId: task.Id }, callback);        
    };
    
    /***** Private Methods *****/
    self.httpPost = function(url, requestData, callback) {
        $.ajax({
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            url: url,
            data: JSON.stringify(requestData),
            headers: {
                "Authorization": self.authenticationHeader
            }
            }).fail(function(data) {
                if (data.status === 401){
                    callback("Unauthorized");
                }
                else{
                    callback("Unexpected request error.");
                }
            }).done(function(data){
                callback(data);
            });
    };
    
    app.api = {
        executeLogin: self.executeLogin,
        getOpenCases: self.getOpenCases,
        getDocumentSummaryForCase: self.getDocumentSummaryForCase,
        getCasesById: self.getCasesById,
        getCaseFactsById: self.getCaseFactsById,
        getDashboardTasks: self.getDashboardTasks,
        executeSearch: self.executeSearch,
        getFormForTask: self.getFormForTask,
        getTaskApprovers: self.getTaskApprovers,
        ipAddress: self.ipAddress,
        approveTask: approveTask,
        rejectTask: rejectTask
    };
})(window);