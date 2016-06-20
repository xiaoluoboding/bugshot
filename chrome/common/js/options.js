requirejs.config({
    baseUrl: 'js',
    shim: {
        'lib/jquery.ui.src': {deps: ['lib/jquery.src']}
    }
});

define(['lib/jquery', 'lib/knockout', 'lib/knockout.validation', 'comm', 'util/validators', 'lib/jquery.ui'],
    function ($, ko, kov, CommunicatorLoader) {
    var OptionsPageViewModel = (function () {
        function OptionsPageViewModel(options) {
            var settings = JSON.parse(localStorage['CommunicatorSettings'] || "{}");
            this.Login = ko.observable(settings.Login).extend({required: true});
            this.Type = ko.observable(localStorage['CommunicatorType'] || 'Gemini');
            this.Errors = ko.computed(function () {
                var fields = [this.Login];
                return ko.validation.group(fields);
            }, this);
            $('#optionsForm :input[type="text"]').keydown(function() {
                $('#saveBtn').prop('value', '* 保存');
            });
        }
        OptionsPageViewModel.prototype.getSettings = function () {
            return {
                Url: 'http://8.1.3.211:3001/redmine',
                Login: this.Login(),
                Password: '11111111'
            };
        };
        OptionsPageViewModel.prototype.save = function () {
            if (this.Errors()().length > 0) {
                this.Errors().showAllMessages();
                return;
            }
            $(".confirmationMessage").stop().hide().text("测试连接...").show();
            $('#saveBtn').prop('disabled', 'disabled');
            var settings = this.getSettings();
            var type = this.Type();
            var CommunicatorClass = CommunicatorLoader(type);
            var communicator = new CommunicatorClass(settings);
            communicator.test().fail(function(text) {
                $(".confirmationMessage").stop().hide().text(text).show().delay(1700).fadeOut(400, function() {
                    $('#saveBtn').prop('disabled', '');
                });
            }).done(function () {
                localStorage['CommunicatorSettings'] = JSON.stringify(settings);
                localStorage['CommunicatorType'] = type;
                $(".confirmationMessage").stop().hide().text("用户信息已保存!").show().delay(1700).fadeOut(400, function() {
                    $('#saveBtn').prop('disabled', '').prop('value', '保存');
                });
            });
        };
        return OptionsPageViewModel;
    })();
    
    ko.applyBindings(new OptionsPageViewModel());
});