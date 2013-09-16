(function(global) {  
    var TasksViewModel,
        app = global.app = global.app || {};
    
    TasksViewModel = function() {
        var self = this;
        
        // data
        self.tasks = ko.observableArray();
        self.taskForm = ko.observable();
        self.approvers = ko.observableArray();
        self.selectedApprover = ko.observable();
        self.selectedTask = ko.observable(null);
        self.completedTasks = ko.observableArray();
        
        // functions
        self.numberTasks = ko.computed(function(){
            return self.tasks().length;
        });
        
        self.selectTask = function(item){
            self.selectedTask(item);
            app.application.navigate("#task-detail-view");
            app.api.getFormForTask(item, function(data){
                self.taskForm(data.d);
            });
            
            app.api.getTaskApprovers(function(data){
                self.approvers(data.d);
            });
        };
        
        self.approveTask = function(){
            console.log("selectedapprover", self.selectedApprover(), encodeURIComponent(self.selectedApprover()));
            /*app.api.approveTask(self.selectedTask(), self.selectedApprover(), function(data){
                self.completedTasks.push(self.selectedTask().id);
            });*/
        };
        
        self.rejectTask = function() {
            /*app.api.rejectTask(self.selectedTask(), function(data){
                self.completedTasks.push(self.selectedTask().id);
            });*/
        };
        
        self.loadData = function(){
            app.api.getDashboardTasks(function(data){
                self.tasks(data.d);
            });
        };
        
        return {
            loadData: self.loadData,
            tasks: self.tasks,
            numberTasks: self.numberTasks,
            selectedTask: self.selectedTask,
            selectTask: self.selectTask,
            taskForm: self.taskForm,
            approvers: self.approvers,
            selectedApprover: self.selectedApprover,
            approveTask: self.approveTask,
            rejectTask: self.rejectTask
        }
    };  
    
    app.tasksVM = new TasksViewModel();
})(window);