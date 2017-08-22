	var list;
	
	jsPlumb.ready(function(){
		var instance = window.jsp = jsPlumb.getInstance({
				Endpoint: ["Dot", {radius: 2}],
				Connector:"Flowchart",
				ConnectionOverlays: [
	            [ "Arrow", {
	                location: 1,
	                visible:true,
	                width:11,
	                length:11,
	                id:"ARROW",
	                events:{
	                    click:function() { 
	                    	alert("you clicked on the arrow overlay")
	                    }
	                }
	            } ],
	            [ "Label", {
	                location: 0.5,
	                id: "label",
	                cssClass: "aLabel",
	                events:{
	                    click:function(labelOverlay, originalEvent) { 
	                    	labelOverlay.setLabel('<span class="transitonSpan">hello点过了</span><a class="del">Delete</a>');
	                    },
	                    mousedown:function(conn,e){
	                    	if(3 == e.which){
	                    		$(this.canvas.children[1]).show();
          					}
	                    }
	                }
	            }]
	        ],
	        Container: "canvas"
		})

		/*var basicType = {
	        connector: "Flowchart",
	        paintStyle: { stroke: "red", strokeWidth: 4 },
	        hoverPaintStyle: { stroke: "blue" },
	        overlays: [
	            "Arrow"
	        ]
    	};*/
    	//动态的修改连接线或端点的样式
    	instance.registerConnectionType("basic", { anchor:"Continuous", connector:"Flowchart" });
/*
    	//连接线的样式
    	var connectorPaintStyle = {
            strokeWidth: 2,
            stroke: "#61B7CF",
            joinstyle: "round",
            outlineStroke: "white",
            outlineWidth: 2
        },
        //连接线滑过的样式
        connectorHoverStyle = {
            strokeWidth: 3,
            stroke: "#216477",
            outlineWidth: 5,
            outlineStroke: "white"
        },
        //结束的点 滑过的颜色
        endpointHoverStyle = {  
            fill: "#216477",
            stroke: "#216477"
        },
        //起点样式
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                stroke: "#7AB02C",
                fill: "transparent",
                radius: 7,
                strokeWidth: 1
            },
            isSource: true,
            connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle
        },
        //终点样式
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fill: "#7AB02C", radius: 7 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true
        }*/
        /*,
        init = function (connection) {
            console.log(connection)
            alert(label.getLabel())
            connection.getOverlay("label").setLabel("click");
        };*/

        /*
			toId:元素id
			sourceAnchors:起点锚点位置
			targetAnchors：终点锚点位置
			addEndpoint:添加端点 
			uuid:可连接两个端点的UUID数组。如果你提供这个，你不需要提供source或target
        */
        /*var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        	console.log(toId)
	        for (var i = 0; i < sourceAnchors.length; i++) {
	            var sourceUUID = toId + sourceAnchors[i];
	            instance.addEndpoint(toId, sourceEndpoint, {
	                anchor: sourceAnchors[i], uuid: sourceUUID
	            });
	        }
	        for (var j = 0; j < targetAnchors.length; j++) {
	            var targetUUID = toId + targetAnchors[j];
	            instance.addEndpoint(toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
	        }
    	};*/

    	//
    // initialise element as connection targets and source.
    //
    var initNode = function(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            maxConnections: 2,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
        	dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous"
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };


    	// batch 可以在拖拽后实现重绘
    	
    	instance.batch(function () {

	        $(".left li").draggable({
	        	helper:'clone',
				scope: "ss"
			});
    		$("#canvas").droppable({
				scope: "ss",
				drop: function (event, ui) {
					var left = parseInt(ui.offset.left - $(this).offset().left);
					var top = parseInt(ui.offset.top - $(this).offset().top);
					var id = $(ui.draggable).attr("data-id");
					$(ui.draggable).hide();
					$(this).append('<div class="window jq-draggable-incontainer" id='+id+'><strong>'+$(ui.draggable).html()+'</strong><span class="ep"></span><br /><br /></div>');
					$("#" + id).css("left", left).css("top", top);
					var windows = jsPlumb.getSelector(".window");
		            for (var i = 0; i < windows.length; i++) {
			            initNode(windows[i], true);
			        }
					$("#" + id).draggable({ containment: "parent" });
				}
			})


	        // listen for new connections; initialise them the same way we initialise the connections at startup.
	        instance.bind("connection", function (connInfo, originalEvent) {
	            connInfo.connection.getOverlay("label").setLabel('<span class="transitonSpan">click</span><a class="del">Delete</a>');
	            if (connInfo.sourceId == connInfo.targetId) {
          			alert("不能连接自己！");
          		    instance.deleteConnection(connInfo.connection);
        		}
        		var n=0;
        		var source_target=connInfo.sourceId+'-'+connInfo.targetId;
				list=instance.getAllConnections();//获取所有的链接  
        		$.each(list,function(i,v){
        			if(v.sourceId+'-'+v.targetId==source_target){
        				n++;
        			}
        		})
        		if(n>1){
        			alert("不能重复连接！");
          		    instance.deleteConnection(connInfo.connection);
        		}
        		
	        });

	        // 手动拖拽连线 
	        instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
	        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
	        // method, or document.querySelectorAll:
	        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

	        // 自动连线
	        /*instance.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
	        instance.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
	        instance.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
	        instance.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
	        instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
	        instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});*/


	        //
	        //监听事件
	        //
	        instance.bind("click", function (conn, e) {
	           // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
	             //   instance.detach(conn);
	            console.log(conn)
	            var target=e.target||e.srcElement;
	            if(target.className=='del'){
	            	instance.deleteConnection(conn);
	            }
	            
	        });

	        instance.bind("connectionDrag", function (connection) {
	            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
	        });

	        instance.bind("connectionDragStop", function (connection) {
	            console.log("connection " + connection.id + " was dragged");
	        }); 

	        instance.bind("connectionMoved", function (params) {
	            console.log("connection " + params.connection.id + " was moved");
	        });
	        document.getElementById("canvas").oncontextmenu = function(e){
　　				return false;
			}

    	});

		jsPlumb.fire("jsPlumbDemoLoaded", instance);
	})