/**
 * Plugin to get comments from portal
 * @class reviewerComments
 * @constructor
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Revathi P 
 * @listens stage:select
 * @listens stage:render:complete
 */

org.ekstep.contenteditor.basePlugin.extend({
    NO_COMMENTS: 'No Reviewer Comments',
    initialize: function () {
        ecEditor.addEventListener("stage:render:complete", this.initializeComments, this);
        ecEditor.addEventListener("stage:delete", this.deleteComments, this);
    },
    initializeComments: function (event, event) {
        var instance = this;
        if (instance.comments == undefined) {
            this.context = org.ekstep.contenteditor.globalContext;
            if (!ecEditor._.isUndefined(this.context)) {
                if (!ecEditor._.isUndefined(this.context.contentId) && this.context.contentId != "") {
                    var instance = this;
                    var pkgVersion = ecEditor.getService('content').getContentMeta(org.ekstep.contenteditor.api.getContext('contentId')).pkgVersion;
                    var data = {
                        "request": {
                            "contextDetails": {
                                'contentId': ecEditor.getContext('contentId'),
                                'contentType': 'application/vnd.ekstep.ecml-archive',
                                'contentVer':  !_.isUndefined(pkgVersion) ? pkgVersion.toString() : '0'
                            }
                        }
                    };
                    //Do Api call and get the response  
                    ecEditor.getService(ServiceConstants.CONTENT_SERVICE).getComments(data, function (error, response) {
                        if (!error) {
                            //Loop through the response and generate the comments Thread
                            // instance.comments = response.data.result.comments
                            instance.showComments(response.data.result.comments);
                        } else {
                            instance.displayNoComments();
                            ecEditor.dispatchEvent("org.ekstep.toaster:error", {
                                message: "Error in fetching comments, please try again!",
                                position: 'topCenter',
                                icon: 'fa fa-warning'
                            });
                            ecEditor.getService('telemetry').error({
                                "env": 'content',
                                "stage": '',
                                "action": 'review comments',
                                "objectid": "",
                                "objecttype": "",
                                "err": error.status,
                                "type": "API",
                                "data": error,
                                "severity": "fatal"
                            })
                        }
                        callback && callback(error, response);
                    });
                }
            }
        } else {
            instance.displayStageComments(instance.comments)
        }
    },
    //Show comments after getting the apiResponse
    showComments: function (comments) {
        var instance = this;
        var sortedComments = {}
        if (comments !== undefined && comments.length > 0) {
            sortedComments = _.sortBy(comments, function (dateObj) {
                return new Date(dateObj.createdOn);
            });
            instance.mapComment(sortedComments);
        }
    },
    //To show the 'No review message to the user
    displayNoComments: function () {
        jQuery('a[data-content ="comments"]').removeClass('highlight');
        jQuery('#reviewerComments').html('<div>' + this.NO_COMMENTS + '</div>');
    },
    //Function to format the date 
    getMonthName: function (date) {
        var date = new Date(date);
        return date.toLocaleString('en-us', {
            month: "long"
        }).toString().substr(0, 3) + " " + date.getDate();
    },
    //To map the comments from the apiResponse
    mapComment: function (sortedComments) {
        var instance = this;
        var displayComments = [];
        var result = _.map(sortedComments, function (item) {
            var commentThread = {};
            commentThread.username = item.userInfo.name
            commentThread.logo = item.userInfo.logo ? item.userInfo.logo : ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/reviewer_icon.png");
            commentThread.username = item.userInfo.name;
            commentThread.date = instance.getMonthName(item.createdOn);
            commentThread.body = item.body
            commentThread.stageId = item.stageId
            displayComments.push(commentThread);
        });
        instance.comments = displayComments;
        //update the mapped comments to the template      
        instance.displayStageComments(displayComments);
    },
    checkFilter: function (comments) {
        var filterComments = _.filter(comments, ['stageId', ecEditor.getCurrentStage().id]);
        return filterComments;
    },
    displayStageComments: function (displayComments) {
        filteredComments = [];
        filteredComments = this.checkFilter(displayComments)
        if (filteredComments.length > 0) {
            var commentTemplate = _.template(
                '<% _.each(filteredComments, function(item) { %>' +
                '<div class="comment"> ' +
                '<div class="avatar"><img src= " <%-item.logo %> "/></div>' +
                '<div class="content"><div class="flex-class"><span class="author"><%- item.username %></span>' +
                '<span class="date"><%- item.date %> </span></div>' +
                '<div class="text"> <%-item.body  %> ' +
                '</div></div></div>' +
                '<% }); %>');

            //Add highlight class to the comments tab
            ecEditor.jQuery('a[data-content ="comments"]').addClass('highlight');
            ecEditor.jQuery('#reviewerComments').html(commentTemplate);
        } else {
            this.displayNoComments();
        }
    },
    deleteComments: function (event, callback) {
        console.log('event delete: ', event);
        console.log('event callback: ', callback);
        var deleteStageId = callback.stageId;
        var data = {
            "request": {
                "contextDetails": {
                    'contentId': (this.context.contentId).toString(),
                    'contentType': 'application/vnd.ekstep.ecml-archive',
                    'contentVer': "0",
                    'stageId': deleteStageId
                }
            }
        };
        //Do Api call and delete the comments related to the stageId
        ecEditor.getService(ServiceConstants.CONTENT_SERVICE).deleteComments(data, function (error, response) {
            if (!error) {
                //On success show the success message for comments deletion
                ecEditor.dispatchEvent("org.ekstep.toaster:success", {
                    message: "Comments of the stage is deleted",
                    position: 'topCenter',
                    icon: 'fa fa-check-circle'
                });
            } else {
                ecEditor.dispatchEvent("org.ekstep.toaster:error", {
                    message: "Error in deleting the stage's comments, please try again!",
                    position: 'topCenter',
                    icon: 'fa fa-warning'
                });
            }
        });
    }
});
//# sourceURL=reviewercomments.js