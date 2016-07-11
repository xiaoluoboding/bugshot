define(['lib/jquery', 'lib/knockout', 'lib/knockout.validation', 'comm', 'lib/jquery.ui', 'lib/jquery.loading'],
    function ($, ko, kov, CommunicatorLoader) {

    var DetailsViewModel = (function () {
        function DetailsViewModel(options) {
            this.Parent = options.Parent;
            this.Comment = ko.observable().extend({required: true});
            this.Title = ko.observable().extend({required: true});
            this.Description = ko.observable().extend({required: true});
            this.Username = ko.observable(localStorage['Username'] || '').extend({required: true});
            this.Phone = ko.observable(localStorage['Phone'] || '').extend({required: true});
            this.Issue = ko.observable().extend({required: true});
            this.IssueId = ko.computed(function () {
                var issue = this.Issue();
                if (issue != null) {
                    return issue.Id;
                }
                return null;
            }, this);
            this.Communicator = new (CommunicatorLoader())();
            this.Fields = this.Communicator.getFields();
            this.FieldsArr = [];
            for (var i in this.Fields) {
                this.FieldsArr.push(this.Fields[i]);
            }
            this.ActiveTab = ko.observable('Create');
            this.init();
        }
        DetailsViewModel.prototype.init = function () {
            var self = this;
            this.CreateErrors = ko.validation.group([this.Title, this.Description]);
            this.AttachErrors = ko.validation.group([this.Issue, this.Comment]);
            $("#issue").autocomplete({
                appendTo: "#issue_dialog",
                minLength: 3,
                source: function(request, response) {
                    var search = self.Communicator.search(request.term);
                    if (search != null) {
                        search.done(function (data) {
                            if(data.constructor != Array) {
                                data = new Array(data);
                            }
                            var labeledData = $.map(data, function (item) {
                                item.label = item.Name;
                                item.value = item.Id;
                                return item;
                            });
                            response(labeledData);
                        });
                    }
                },
                focus: function( event, ui ) {
                    $("#issue").val(ui.item.label);
                    return false;
                },
                select: function(event, ui) {
                    $("#issue").val(ui.item.label);
                    self.Issue(ui.item);
                    return false;
                }
            });
            $("#issue_dialog").dialog(
                {
                    draggable: true,
                    autoOpen: false,
                    width: 500
                }
            );
        };
        DetailsViewModel.prototype.selectCreate = function () {
            this.ActiveTab('Create');
        };

        DetailsViewModel.prototype.createIssue = function () {
            if (this.CreateErrors().length > 0) {
                this.CreateErrors.showAllMessages();
                return;
            }
            var imageData = this.Parent.Editor.getImageData();
            var self = this;
            $("#issue_dialog").showLoading();
            var issueId = null;
            localStorage.setItem('Username', this.Username());
            localStorage.setItem('Phone', this.Phone());
            this.Communicator.create(
                    this.Title(),
                    this.Description(),
                    this.Fields,
                    this.Username(),
                    this.Phone()
                ).then(function (data) {
                    issueId = data.Id;
                    return self.Communicator.attach(issueId, imageData, self.Fields);
                }).done(function () {
                    $("#issue_dialog").hideLoading().dialog("close");
                    new jBox('Notice', {
                        content: '^_^问题已经提交!',
                        autoClose: 1800,
                        color: 'green'
                    });
                    // location.href = self.Communicator.getRedirectUrl(issueId, self.Fields);
                });
        };
        DetailsViewModel.prototype.showDialog = function () {
            $("#issue_dialog").dialog("open");
            $('.ui-dialog').addClass('panel panel-info');
            var titlebar = $('.ui-dialog-titlebar');
            if (!titlebar.hasClass('panel-heading')) {
                titlebar.addClass('panel-heading');
                $('.ui-button').attr('title', '关闭').addClass('btn btn-link pull-right');
                $('.ui-dialog-titlebar').append('<span>创建问题</span>')
                $('.ui-button-text').html('X');
            }

        };
        DetailsViewModel.prototype.closeDialog = function () {
            $("#issue_dialog").dialog("close");
        };
        return DetailsViewModel;
    })();
    return DetailsViewModel;
});
