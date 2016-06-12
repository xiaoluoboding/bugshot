define(['lib/knockout', 'lib/knockout.validation'], function (ko, kov) {
    ko.validation.rules['url'] = {
        validator: function (val) {
            return /^http(s)?\:\/\/[a-z0-9-\\.@:%_\+~#=]+((\.)?[a-z0-9]+)*(:[0-9]{1,5})?(\/.*)*$/.test(val);
        },
        message: '输入的URL格式不对!'
    };
    ko.validation.registerExtenders();
});
