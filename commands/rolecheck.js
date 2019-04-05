exports.run = function (client, message, args) {
    //counts all the roles on the server below Roletab and orders them
    var roleCount = /** @class */ (function () {
        function roleCount() {
        }
        return roleCount;
    }());
    var botFunctions = require("./other/botFunctions.js");
    var roleObjects = [];
    var messageToSend = [];
    var roles = message.guild.roles.array();
    var roleTab = message.guild.roles.find(function (role) {
        return role.name === "roletab";
    });
    roles = roles.filter(function (role) {
        return roleTab.comparePositionTo(role) > 0;
    });
    roles = roles.filter(function (role) {
        return role.name !== "@everyone";
    });
    for (var _i = 0, roles_1 = roles; _i < roles_1.length; _i++) {
        var role = roles_1[_i];
        var thisRole = new roleCount;
        thisRole.role = role.name;
        thisRole.count = message.guild.roles.get(role.id).members.array().length;
        roleObjects.push(thisRole);
    }
    roleObjects = roleObjects.sort(function (a, b) {
        return b.count - a.count;
    });
    for (var _a = 0, roleObjects_1 = roleObjects; _a < roleObjects_1.length; _a++) {
        var role = roleObjects_1[_a];
        messageToSend.push(role.role + " : " + role.count + "\r");
    }
    botFunctions.sendEmbed(message.channel.guild.name, message.channel.id, messageToSend, "**Most Popular Self-Assigned Roles**", client);
};
