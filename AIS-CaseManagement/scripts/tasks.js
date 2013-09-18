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
            app.api.approveTask(self.selectedTask(), self.selectedApprover(), function(data){
                self.completedTasks.push(self.selectedTask().Id);
                self.loadData();
                app.application.navigate("#:back");
            });
        };
        
        self.rejectTask = function() {
            app.api.rejectTask(self.selectedTask(), function(data){
                self.completedTasks.push(self.selectedTask().Id);
                self.loadData();
                app.application.navigate("#:back");
            });
        };
        
        self.loadData = function(){
            app.api.getDashboardTasks(function(data){
                var taskList;
                if (self.selectedTask()){
                    taskList = _.filter(data.d, function(item) {
                        return !_.contains(self.completedTasks(), item.Id);
                    });
                }
                else{
                    taskList = data.d;
                }
                self.tasks(taskList);
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