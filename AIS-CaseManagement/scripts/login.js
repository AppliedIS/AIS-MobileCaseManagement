(function (global) {
    var LoginViewModel,
        app = global.app = global.app || {};

    LoginViewModel = function(){
        var self = this;
        self.isLoggedIn = false;
        self.username = localStorage.getItem("username");
        self.password = localStorage.getItem("password");

        self.onLogin = function () {
            console.log("Username: " + self.username + "; Password: " + self.password);
            if (self.username === "" || self.password === "") {
                navigator.notification.alert("Both fields are required!",
                    function () { }, "Login failed", 'OK');

                return;
            }

            app.application.showLoading();
            app.api.executeLogin(self.username, self.password, function(data){
               console.log("response from executeLogin", data); 
                if(data === "Unauthorized"){
                    navigator.notification.alert("Login failed!");
                }
                else if (data === "Success"){
                    // Save username/password for next time
                    localStorage.setItem("username", self.username);
                    localStorage.setItem("password", self.password);
                    
                    // Perform all refresh methods 
                    app.reloadAll();
                    app.application.navigate("dashboard-view");
                }
                else{
                    navigator.notification.alert("Unexpected error while logging in!");   
                }
                app.application.hideLoading();
            });
            self.isLoggedIn = true;
        },

        self.onLogout = function () {
            var that = this;

            that.clearForm();
            that.set("isLoggedIn", false);
        },

        self.clearForm = function () {
            var that = this;

            that.set("username", "");
            that.set("password", "");
        }
        
        ko.track(this);
    };

    app.loginVM = new LoginViewModel();
})(window);