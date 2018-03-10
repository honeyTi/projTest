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
                                    console.log(link);
                                    return link;
                        }

                        option.data.links = dataLink(option.data.nodes, option.data.links);
                        // d3颜色调整
                        let colors = d3.scaleOrdinal(d3.schemeCategory10); //待调整样式

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
                                    .append('line')
                                    .attr('stroke', '#ccc')
                                    .attr('stroke-width', 1);

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
                                                });
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