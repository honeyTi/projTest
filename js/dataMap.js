let panorama = function (data) {
            return panorama.prototype.init(data);
};

panorama.prototype = {
            version: '1.0.0',
            init: function (data) {
                        const option = {
                                    container: data.container,
                                    containerStyle: data.containerStyle,
                                    rand: data.rand,
                                    color: data.radius,
                                    radius: data.radius,
                                    data: data.data,
                                    onNodeClick: data.onNodeClick,
                                    cententClick: data.cententClick
                        };
                        let ACTION = '';
                        let node_info = '';
                        // 页面原色的宽度
                        const width = option.containerStyle[0];
                        const height = option.containerStyle[1];

                        // 关系数据处理函数
                        function dataLink(data, link) {
                                    for (var i = 0; i < data.length; i++) {
                                                for (var j = 0; j < link.length; j++) {
                                                            if (data[i].name === link[j].source) {
                                                                        link[j].source = i;
                                                            } else if (data[i].name === link[j].target) {
                                                                        link[j].target = i;
                                                            } else {

                                                            }
                                                }
                                    }
                                    return link;
                        }

                        option.data.links = dataLink(option.data.nodes, option.data.links);
                        // d3颜色调整
                        let colors = d3.scaleOrdinal(d3.schemeCategory10); //待调整样式

                        //***********************圆弧线or直线的判断********************
                        /*
                         *  此处的作用是给下面判断当前是两个节点之间的第几条线儿添加必要的参数（linkNum、size）的,
                         *  其中本段的作用为添加size属性，最后调用的setLinkNumber()方法添加linkNum属性
                         */
                        let linkGroup = {};
                        let linkmap = {};
                        let links = option.data.links;
                        for(let i=0; i<links.length; i++){
                            let key = links[i].source<links[i].target?links[i].source+':'+links[i].target:links[i].target+':'+links[i].source;
                            if(!linkmap.hasOwnProperty(key)){
                                linkmap[key] = 0;
                            }
                            linkmap[key]+=1;
                            if(!linkGroup.hasOwnProperty(key)){
                                linkGroup[key]=[];
                            }
                            linkGroup[key].push(links[i]);
                        }
                        for(let i=0; i<links.length; i++){
                            let key = links[i].source<links[i].target?links[i].source+':'+links[i].target:links[i].target+':'+links[i].source;
                            links[i].size = linkmap[key];
                            let group = linkGroup[key];
                            let keyPair = key.split(':');
                            let type = 'noself';
                            if(keyPair[0]==keyPair[1]){
                                type = 'self';
                            }
                            setLinkNumber(group,type);
                        }
                        //**********************属性添加结束*************************

                // 缩放功能
                        let zoom = d3.zoom()
                                    .scaleExtent([1 / 2, 20]) //缩放 比例范围
                                    .on("zoom", zoomed);

                        function zoomed() {
                                    d3.select(this).attr("transform", d3.event.transform);
                        };

                        // svg画布初始化
                        let svg = d3.select(option.container)
                                    .append('svg')
                                    .attr('width', width)
                                    .attr('height', height)
                                    .call(zoom)
                                    .on('dblclick.zoom', null)
                                    .on("click", function () {
                                                svg.selectAll("use").classed("menu-show", true);
                                    }, 'false');

                        // 饼图按钮初始化
                        let defs = svg.append('defs');
                        let database = [1, 1, 1];
                        let pie = d3.pie();
                        let pieData = pie(database);
                        // 按钮不同大小调整
                        function threeMenu(data) {
                                    let maxRank = data[0].rank;
                                    for (var i = 0; i < data.length; i++) {
                                                maxRank = maxRank > data[i].rank ? maxRank : data[i].rank;
                                    }
                                    for (var j = 1; j <= maxRank; j++) {
                                                let arc = d3.arc()
                                                            .innerRadius((option.radius / Math.pow(1.3, (j - 1)) * 1.1))
                                                            .outerRadius((option.radius / Math.pow(1.3, (j - 1)) * 2.1));

                                                // 饼图defs增加按钮元素
                                                let outer = defs.append('g')
                                                            .attr('id', 'out_circle' + j)
                                                            .selectAll('.group')
                                                            .data(pieData)
                                                            .enter()
                                                            .append('g')
                                                            .attr('class', function (d, i) {
                                                                        return "action" + i;
                                                            });
                                                outer.append("path")
                                                            .attr("d", function (d) {
                                                                        return arc(d);
                                                            })
                                                            .attr('cursor', 'pointer')
                                                            .attr("fill", "#bbcdc5")
                                                            .attr("stroke", "#f0f0f4")
                                                            .attr("stroke-width", 2);
                                                outer.append("text")
                                                            .attr("transform", function (d, i) {
                                                                        return "translate(" + arc.centroid(d) + ")";
                                                            })
                                                            .attr("text-anchor", "middle")
                                                            .attr('cursor', 'pointer')
                                                            .text(function (d, i) {
                                                                        let zi = new Array()
                                                                        zi[0] = "释放";
                                                                        zi[1] = "扩展";
                                                                        zi[2] = "属性";
                                                                        return zi[i]
                                                            })
                                                            .attr("font-size", 10);

                                    }
                        }
                        threeMenu(option.data.nodes);
                        // 强制位置分离
                        let forceCollide = d3.forceCollide()
                                    .radius(function (d) {
                                                return 100;
                                    })
                                    .iterations(0.2)
                                    .strength(0.15);

                        // 引力布局
                        let simulation = d3.forceSimulation(option.data.nodes)
                                    .force('charge', d3.forceManyBody())
                                    .force('link', d3.forceLink())
                                    .force('center', d3.forceCenter(option.containerStyle[0] / 2, option.containerStyle[1] / 2))
                                    .force('collide', forceCollide);
                        simulation.force("link")
                                    .distance(140);

                        // 增加关系线 
                        let link = svg
                                    .selectAll('line')
                                    .data(option.data.links)
                                    .enter()
                                    .append('path')
                                    .attr("id", function (d, i) { // 设定节点间连线的 id ，这个id 会被连线上的文字的属性所引用。用以设定文字样式。
                                        return "line" + i
                                    })
                                    .attr('stroke', '#000')
                                    .attr('fill', 'transparent')
                                    .attr('stroke-width', 1);
                        //************************增加连接线文字***********************
                        let link_text = svg
                                    .selectAll('nodes')
                                    .data(option.data.links)
                                    .enter()
                                    .append("text")
                                    .attr("class", "link_text")
                                    //dx和dy分别用来设置文字距离节点的距离和文字距离连接线的位置
                                    //此处的设置为基础固定值，到后面的tick函数中，我们写入相应的方法，根据每条线的长度，计算对应的文字距离节点的距离，保证文字始终在中间
                                    .attr("dx", function (d) {
                                        return 100;
                                    })
                                    .attr("dy", function (d) {
                                        return 4
                                    })
                                    .append("textPath")
                                    //根据之前定义的链接线的id来定位文字的相对地方
                                    .attr("xlink:href", function (d, i) {
                                        return "#line" + i
                                    })
                                    .attr("fill", "#1685a9")
                                    .style("font-size", 16)
                                    //以links中的relation属性的值作为显示在连接线上的内容
                                    .text(function (d) {
                                        return d.relation
                                    });
                        //所有连接线文字的选择器，下方文字动态变化时用得上
                        let link_text_selector = svg.selectAll(".link_text");

                        //***************************为links的每一个元素添加linkNum属性的方法**************************
                        function setLinkNumber(group,type){  
                            if(group.length==0) return;  
                            var linksA = [], linksB = [];  
                            for(var i = 0;i<group.length;i++){  
                                var link = group[i];  
                                if(link.source < link.target){  
                                    linksA.push(link);  
                                }else{  
                                    linksB.push(link);  
                                }  
                            }
                            var maxLinkNumber = 0;  
                            if(type=='self'){  
                                maxLinkNumber = group.length;  
                            }else{  
                                maxLinkNumber = group.length%2==0?group.length/2:(group.length+1)/2;  
                            }  
                            if(linksA.length==linksB.length){  
                                var startLinkNumber = 1;  
                                for(var i=0;i<linksA.length;i++){  
                                    linksA[i].linknum = startLinkNumber++;  
                                }  
                                startLinkNumber = 1;  
                                for(var i=0;i<linksB.length;i++){  
                                    linksB[i].linknum = startLinkNumber++;  
                                }  
                            }else{
                                var biggerLinks,smallerLinks;  
                                if(linksA.length>linksB.length){  
                                    biggerLinks = linksA;  
                                    smallerLinks = linksB;  
                                }else{  
                                    biggerLinks = linksB;  
                                    smallerLinks = linksA;  
                                }  
                        
                                var startLinkNumber = maxLinkNumber;  
                                for(var i=0;i<smallerLinks.length;i++){  
                                    smallerLinks[i].linknum = startLinkNumber--;  
                                }  
                                var tmpNumber = startLinkNumber;  
                        
                                startLinkNumber = 1;  
                                var p = 0;  
                                while(startLinkNumber<=maxLinkNumber){  
                                    biggerLinks[p++].linknum = startLinkNumber++;  
                                }  
                                startLinkNumber = 0-tmpNumber;  
                                for(var i=p;i<biggerLinks.length;i++){  
                                    biggerLinks[i].linknum = startLinkNumber++;  
                                }  
                            }   
                        }  

                        // 增加节点
                        let nodeGroup = svg.append('g')
                                    .selectAll('nodes')
                                    .data(option.data.nodes)
                                    .enter()
                                    .append('g')
                                    .attr('class', 'nodes')
                                    .append('circle')
                                    .attr('r', function (d) {
                                                return option.radius / Math.pow(1.3, (d.rank - 1));
                                    })
                                    .attr('class', function (d, i) {

                                                return 'color_list' + d.rank;
                                    })
                                    .attr('stroke', '#ccc')
                                    .attr('stroke-width', 2)
                                    .on("click", function (d, i) { // 单击 清除所有的显示状态的三瓣式圆环，只显示本节点的 三瓣式 圆环
                                                console.log('添加事件');
                                                node_info = d;
                                                let pie_id = ".ingroup_pie_" + d.name;
                                                let pie_node = svg.select(pie_id).classed("menu-show", false);
                                    })
                                    .call(d3.drag()
                                                .on('start', dragstarted)
                                                .on('drag', dragged)
                                                .on('end', dragended)
                                    )
                        let node_text = svg.selectAll('.nodes')
                                    .append('text')
                                    .attr('class', 'text_name')
                                    .data(option.data.nodes)
                                    .text(function (d) {
                                                return d.name;
                                    })
                                    .on("click", function (d, i) { // 单击 清除所有的显示状态的三瓣式圆环，只显示本节点的 三瓣式 圆环
                                        console.log('添加事件');
                                        node_info = d;
                                        let pie_id = ".ingroup_pie_" + d.name;
                                        let pie_node = svg.select(pie_id).classed("menu-show", false);
                                    })
                                    .call(d3.drag()
                                                .on('start', dragstarted)
                                                .on('drag', dragged)
                                                .on('end', dragended)
                                    );
                        // 引入按钮
                        let node = d3.selectAll('.nodes');
                        node.append('use')
                                    .attr('xlink:href', function (d) {
                                                return '#out_circle' + d.rank;
                                    })
                                    .attr('class', function (d) {
                                                return 'menu-show' + '        ingroup_pie_' + d.name + '      three-pie-menu'
                                    })
                        // .attr('class', '');



                        let three_menu = svg.selectAll('.three-pie-menu');
                        simulation
                                    .nodes(option.data.nodes)
                                    .on('tick', ticked);

                        simulation.force('link')
                                    .links(option.data.links);

                        svg.selectAll(".action0")
                            .on("click", function (d, i) {
                                console.log(123)
                                ACTION = "FREE"
                            });

                        svg.selectAll(".action2").on("click", function (d, i) {
                            console.log(123);
                            ACTION = "PROPERTY"
                        });
                        svg.selectAll(".action1").on("click", function (d, i) {
                            console.log(1231);
                            ACTION = "EXTENDS"
                        });
                        // 监测每针变化
                        function ticked() {
                                    svg.selectAll(".nodes").on("click", function (d, i) {
                                        console.log(d);
                                        if (ACTION) {
                                            switch (ACTION) {
                                                case "FREE":
                                                    d.fx = null;
                                                    d.fy = null;
                                                    ACTION = ''; //重置 ACTION
                                                    break;
                                                case "PROPERTY":
                                                    ACTION = '';
                                                    option.cententClick(node_info);
                                                    break;
                                                case "EXTENDS":
                                                    option.onNodeClick(node_info);
                                                    // 扩展功能增加
                                                    ACTION = '';
                                                    break;
                                            }
                                        }
                                    });

                                    link
                                                .attr('x1', function (d) {
                                                            return d.source.x;
                                                })
                                                .attr('y1', function (d) {
                                                            return d.source.y;
                                                })
                                                .attr('x2', function (d) {
                                                            return d.target.x;
                                                })
                                                .attr('y2', function (d) {
                                                            return d.target.y;
                                                })
                                                //*************************画线的重要属性 d ，分为5种情况*************************
                                                .attr("d", function (d, i) {
                                                    //1.当某个结点自己直向自己时
                                                    if(d.target==d.source){
                                                        dr = 30/d.linknum;
                                                        return"M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 1,1 " + d.target.x + "," + (d.target.y+1);
                                                    //2.判断当两个结点之间有奇数条连接线时，将中间那条线画成直线
                                                    }else if(d.size%2!=0 && d.linknum==1){
                                                       return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                                    }
                                                    var curve=1.5;
                                                    var homogeneous=1.2;
                                                    var dx = d.target.x - d.source.x,
                                                        dy = d.target.y - d.source.y,
                                                        dr = Math.sqrt(dx*dx+dy*dy)*(d.linknum+homogeneous)/(curve*homogeneous);
                                                    //3.连接线编号大于0时，画向上拱的弧线
                                                    if(d.linknum<0){
                                                        dr = Math.sqrt(dx*dx+dy*dy)*(-1*d.linknum+homogeneous)/(curve*homogeneous);
                                                        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,0 " + d.target.x + "," + d.target.y;
                                                    }
                                                    //4.连接线编号小于0时，画向下拱的弧线
                                                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                                                    //5.不想用直线，想把所有的线都画成朝一个方向拱的弧线时
                                                    // let dx = d.target.x - d.source.x,//增量
                                                    // dy = d.target.y - d.source.y,
                                                    // dr = Math.sqrt(dx * dx + dy * dy);
                                                    // let path = "M" + d.source.x + ","
                                                    //             + d.source.y + "A" + dr + ","
                                                    //             + dr + " 0 0,1 " + d.target.x + ","
                                                    //             + d.target.y;
                                                    // return path
                                                });
                                    link_text_selector
                                                .attr('dx', function( d , i){
                                                    //根据勾股定理计算圆弧的直向长度
                                                    return (Math.sqrt(Math.pow(d.target.x - d.source.x, 2) + Math.pow(d.target.y - d.source.y, 2))) / 2.2;
                                                })
                                                .attr('dy', -4);
                                    three_menu
                                                .attr('x', function (d) {
                                                            return d.x;
                                                })
                                                .attr('y', function (d) {
                                                            return d.y;
                                                });
                                    nodeGroup
                                                .attr('cx', function (d) {
                                                            return d.x;
                                                })
                                                .attr('cy', function (d) {
                                                            return d.y;
                                                });
                                    node_text
                                                .attr('x', function (d) {
                                                            return d.x;
                                                })
                                                .attr('y', function (d) {
                                                            return d.y;
                                                });
                        }

                        // 拖拽事件

                        function dragstarted(d) {
                                    if (!d3.event.active) simulation.alphaTarget(0.1).restart();
                                    d.fx = d.x;
                                    d.fy = d.y;
                        }

                        function dragged(d) {
                                    d.fx = d3.event.x;
                                    d.fy = d3.event.y;
                        }

                        function dragended(d) {
                                    d.fixed = true; // 拖动节点时，固定在鼠标停留位置
                                    d3.event.sourceEvent.stopPropagation(); // 解决drag和zoom 冲突。解决拖动节点时，整个svg 一起拖动的问题。
                        }

            }
}