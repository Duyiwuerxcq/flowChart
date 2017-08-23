;
(function ($, window, document, undefined) {
    var pluginName = "flowdesign";
    var defaults = {
        folowChartData: {},
        saveBtn: ''
    };

    function Plugin(element, options) {
        this.element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        this.bindEvent();
        this.saveBtn = this.settings.saveBtn;

    }
    Plugin.prototype = {
        init: function () {
            var $this = this.element;
            obj = this;
            //连线
            jsPlumb.ready(function () {
                var list;
                instance = window.jsp = jsPlumb.getInstance({
                        Endpoint: ["Dot", {
                            radius: 2
                    }],
                        Connector: "Flowchart",
                        ConnectionOverlays: [["Arrow", {
                            location: 1,
                            visible: true,
                            width: 11,
                            length: 11,
                            id: "ARROW",
                            events: {
                                click: function () {
                                    alert("you clicked on the arrow overlay")
                                }
                            }
                    }], ["Label", {
                            location: 0.5,
                            label: "click",
                            id: "label",
                            cssClass: "aLabel",
                            events: {
                                click: function (labelOverlay, originalEvent) {
                                    labelOverlay.setLabel('<span class="transitonSpan">hello点过了</span><a class="del">Delete</a>');
                                },
                                mousedown: function (conn, e) {
                                    if (3 == e.which) {
                                        $(this.canvas.children[1]).show();
                                    }
                                }
                            }
                    }]],
                        Container: "canvas"
                    })
                    //动态的修改连接线或端点的样式
                instance.registerConnectionType("basic", {
                    anchor: "Continuous",
                    connector: "Flowchart"
                });

                //
                // initialise element as connection targets and source.
                //
                initNode = function (el) {

                    // initialise draggable elements.
                    instance.draggable(el);

                    instance.makeSource(el, {
                        filter: ".ep",
                        anchor: "Continuous",
                        connectorStyle: {
                            stroke: "#5c96bc",
                            strokeWidth: 2,
                            outlineStroke: "transparent",
                            outlineWidth: 4
                        },
                        connectionType: "basic",
                        maxConnections: 3,
                        onMaxConnections: function (info, e) {
                            alert("Maximum connections (" + info.maxConnections + ") reached");
                        }
                    });

                    instance.makeTarget(el, {
                        dropOptions: {
                            hoverClass: "dragHover"
                        },
                        anchor: "Continuous"
                    });

                    // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
                    // version of this demo to find out about new nodes being added.
                    //
                    instance.fire("jsPlumbDemoNodeAdded", el);
                };

                // batch 可以在拖拽后实现重绘
                instance.batch(function () {
                    var windows = $(".left li").draggable({
                        helper: 'clone',
                        scope: "ss"
                    });
                    $("#canvas").droppable({
                        scope: "ss",
                        drop: function (event, ui) {
                            var left = parseInt(ui.offset.left - $(this).offset().left);
                            var top = parseInt(ui.offset.top - $(this).offset().top);
                            var id = $(ui.draggable).attr("data-id");
                            $(ui.draggable).hide();
                            $(this).append('<div class="window jq-draggable-incontainer" id=' + id + '><strong>' + $(ui.draggable).html() + '</strong><span class="ep"></span></div>');
                            $("#" + id).css("left", left).css("top", top);
                            initNode($("#" + id), true)
                        }
                    })

                    // listen for new connections; initialise them the same way we initialise the connections at startup.
                    instance.bind("connection", function (connInfo, originalEvent) {
                        //connInfo.connection.getOverlay("label").setLabel('<span class="transitonSpan">click</span><a class="del">Delete</a>');
                        if (connInfo.sourceId == connInfo.targetId) {
                            alert("不能连接自己！");
                            instance.deleteConnection(connInfo.connection);
                        };
                        var n = 0;
                        var source_target = connInfo.sourceId + '-' + connInfo.targetId;
                        list = instance.getAllConnections(); //获取所有的链接  
                        $.each(list, function (i, v) {
                            if (v.sourceId + '-' + v.targetId == source_target) {
                                n++;
                            }
                        });
                        if (n > 1) {
                            alert("不能重复连接！");
                            instance.deleteConnection(connInfo.connection);
                        };

                    });

                    //
                    //监听事件
                    //
                    instance.bind("click",function (conn, e) {
                        debugger;
                            var target = e.target || e.srcElement;
                            if (target.className == 'del') {
                                instance.deleteConnection(conn);
                            }

                        });

                    document.getElementById("canvas").oncontextmenu = function (e) {　　
                        return false;
                    };

                });

                jsPlumb.fire("jsPlumbDemoLoaded", instance);

                obj.flowChartDraw();

            })
        },
        flowChartSave: function () {
            var connects = [],
                connectors = instance.getAllConnections();
            $.each(connectors, function (idx, connection) {
                console.log(connection)
                connects.push({
                    ConnectionId: connection.id,
                    PageSourceId: connection.sourceId,
                    PageTargetId: connection.targetId,
                    SourceAnchor: connection.endpoints[0].anchor.type,
                    TargetAnchor: connection.endpoints[1].anchor.type,
                    ConnectText: connection.getOverlay("label").label
                });
            });
            var blocks = [];
            $("#canvas .window").each(function (idx, elem) {
                var $elem = $(elem);
                blocks.push({
                    BlockId: $elem.attr('id'),
                    BlockClass: $elem.attr('class'),
                    BlockContent: $elem.html(),
                    BlockStyle: $elem.attr('style')
                });
            });
            var serliza = {},
                json = '';
            serliza["connector"] = connects;
            serliza["element"] = blocks;
            json = JSON.stringify(serliza);
            window.localStorage.setItem("data", json);
            console.log(json);
        },
        flowChartDraw: function () {
            var data = obj.settings.folowChartData;
            if (data) {
                $.each(data.element, function (i, v) {
                    var newNode = $('<div><div>');
                    newNode.attr('id', v.BlockId).attr('class', v.BlockClass).attr('style', v.BlockStyle).html(v.BlockContent);
                    $(".left li[data-id=" + v.BlockId + "]").hide();
                    $("#canvas").append(newNode);
                    initNode($("#" + v.BlockId), true)
                });
                $.each(data.connector, function (i, v) {
                    instance.connect({
                        source: v.PageSourceId,
                        target: v.PageTargetId,
                        type: "basic"
                    });
                    instance.getConnections()[i].getOverlay('label').setLabel(v.ConnectText);
                });
            }
        },
        remove: function () {
            this.element.off("." + pluginName);
            this.element.removeData(pluginName);
        },
        bindEvent: function () {
            var saveBtn = $("#" + obj.settings.saveBtn);
            saveBtn.on('click', function () {
                obj.flowChartSave();
            })
        }

    };
    $.fn[pluginName] = function (options) {
        this.each(function () {
            var el = $(this);
            if (el.data(pluginName)) {
                el.data(pluginName).remove();
            }
            el.data(pluginName, new Plugin(this, options));
        });
        return this;
    };

})(jQuery, window, document);