+function(){
    var jsonData = [];
    function jsonGet(btn) {
        var urlName = '';
        if (btn === 'domain') {
            urlName = './json/domain.json';
        } else {
            urlName = './json/function.json';
        }
        d3.select('#svg')
            .selectAll('*')
            .remove();
        $.ajax({
            type:"GET",
            //文件位置
            url: urlName,
            dataType: "json",
            success: function(data){
                jsonData = data;
                updata();
            }
        });
    }
    jsonGet('domain');
    function updata() {
        var jsonList = {
            nodes:[
                {
                    name: "分类",
                    rank: 1,
                    properties:[

                    ]
                }
            ],
            links:[]
        };
        function dataReset(data) {
            jsonList = {
                nodes:[
                    {
                        name: "分类",
                        rank: 1,
                        properties:[

                        ]
                    }
                ],
                links:[]
            };
            for (var i = 0 ; i < data[0].nodes.length; i++){
                jsonList.nodes.push(
                    {
                        name: data[0].nodes[i],
                        rank: 2,
                        properties:[

                        ]
                    }
                );
                jsonList.links.push(
                    {
                        source: data[0].nodes[i],
                        target: '分类'
                    }
                )
            }
            return jsonList;
        };
        var datalist = dataReset(jsonData);
        function mapReset(d, data) {
            datalist = dataReset(jsonData);
            for (var i = 0; i < data[1].nodes.length; i++) {
                if (d === data[1].nodes[i]) {
                    for (var j = 0; j < data[1].nodes.length; j++) {
                        jsonList.nodes.push(
                            {
                                name: data[1].nodes[j],
                                rank: data[1].level,
                                properties:[

                                ]
                            }
                        );
                        jsonList.links.push(
                            {
                                source: data[1].nodes[j],
                                target: data[1].name
                            }
                        )
                    }
                } else {

                }
            }
            if (d !== '其它') {
                for (var i = 2; i < data.length; i++) {
                    if (d === data[i].name) {
                        for (var j = 0 ; j < data[i].nodes.length; j++){
                            jsonList.nodes.push(
                                {
                                    name: data[i].nodes[j],
                                    rank: data[i].level,
                                    properties:[
                                        data[i].properties[j]
                                    ]
                                }
                            );
                            jsonList.links.push(
                                {
                                    source: data[i].nodes[j],
                                    target: data[i].name
                                }
                            )
                        }
                        return jsonList;
                    }
                }
            } else {
                for (var j = 0 ; j < data[1].nodes.length; j++){
                    jsonList.nodes.push(
                        {
                            name: data[1].nodes[j],
                            rank: data[1].level,
                            properties:[

                            ]
                        }
                    );
                    jsonList.links.push(
                        {
                            source: data[1].nodes[j],
                            target: data[1].name
                        }
                    )
                }
                return jsonList;
            }

        };
        var dom = document.getElementById('svg');
        var dataRide;
        var data = {
            container: '#svg',
            containerStyle: [dom.clientWidth, dom.clientHeight],
            rand: [1,2,3,4],
            radius: 50,
            color: ['#e4393c', '#fff'],
            data: datalist,
            onNodeClick:function(d) {
                if (d.rank !== '4') {
                    data.data = mapReset(d.name, jsonData);
                    d3.select('#svg')
                        .selectAll('*')
                        .remove();
                    $('.my-content').html('');
                    panorama(data);
                }

            },
            cententClick: function (d) {
                $('.my-content').html(
                    '<div class="panel panel-info">'+
                    '<div class="panel-heading title-list" style="background: #4cae4c;">'+d.name+'</div>'+
                    '<div class="panel-body" style="background: #fff;padding: 5px;">'+ d.properties[0]+
                    '</div>'+
                    '</div>'
                )

            }
        };
        panorama(data);
    }
    $('.btnList').on('click', 'input', function () {
        $(this).addClass('btn-active1').siblings().removeClass('btn-active1');
        jsonGet($(this).val());
    });
}();