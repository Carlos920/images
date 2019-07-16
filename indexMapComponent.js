var fwCore = require("comjs:fw-core");
var IviewView = require("comjs:iview-view");

var fw = {
    core: fwCore
};


var pointUrl;
//引入one-map
var onemap = require("comjs:one-map");
var mapUtils = onemap.MapUtils;

var path = module.uri.substr(0, module.uri.lastIndexOf('/')) + "/";
pointUrl = path + "../../images/point.png";
var pageCustomer = require('../../../scripts/pageCustomer.js');
var mSet;

class Page extends IviewView {

    onCreate() {
        //使用以下代码，对项目后期开发调试帮助很大
        this.setDefine(require, exports, module);

        //建议用me代替this，以免控制不好作用域
        var me = this;
        me.vars = {};
        me.mSet = mSet;
        //必须要实现dom节点的创建
        me.setElement($('#map').get(0));
        me.statusColorList = [[238, 207, 161], [50, 205, 50], [238, 173, 14], [238, 154, 74], [238, 118, 73], [238, 64, 0], [238, 0, 0]];
    };

    onInit() {
        //建议用me代替this，以免控制不好作用域
        var me = this;
        me.layerNames = {
            city: 'city',
            country: 'country',
            highlightCity: 'highlightCity',
            cantonStatistics: 'cantonStatistics',
            taskPt: 'taskPt',
            cantonBj: 'cantonBj'
            // monitorPoint0: 'monitorPoint0',
            // monitorPoint1: 'monitorPoint1',
        };
        me.eventHandleObj = {};
        require.async(`../../maps/scripts/mapSettings/${pageCustomer.mapCantonCode}/mapSettings.js`, function (mapSettings) {
            mSet = mapSettings;
            me.initMap();
        });


        me.resize();
    };

    initMap() {
        var me = this;

        var mapView = new onemap.BaseMapView();
        me.mapView = mapView;
        mapView.set({
            loadBaseLabelLayers:false,
            baseMapLayer: 'tdt_vec_c',
            extent: mSet.defaultExtent,
            onExtentChange: function (e) {
                console.log(e)
            },
            onLoad: function () {
                me.params = me.getParams();


                setTimeout(function () {
                    mapView.addLayer('arcGISTiledMapServiceLayer', {
                        layerName: 'zjWhite',
                        layerUrl: 'http://58.210.204.106:8182/arcgis/rest/services/zjRiver/%E6%B5%99%E6%B1%9F%E7%9C%81white/MapServer',
                        onClick: function (e) {
                            console.log(e)
                        }
                    });
                    // mapView.setBaseLabelLayers('zjtdt_cva_c');
                }, 500)

                if (me.params && $.isFunction(me.params.callback)) {
                    me.params.callback()
                }
            }
        });
        mapView.appendTo(me.getElement());
    }

    getMap() {
        if (this.mapView) {
            return this.mapView.getMap();
        }
    }

    layerHide(properties) {
        var settings = $.extend({layerName: '', layer: null}, properties);
        if (this.mapView) {
            this.mapView.hideLayer(settings.layerName);
        }


    };

    layerShow(properties) {
        var settings = $.extend({layerName: '', layer: null}, properties);
        if (this.mapView) {
            if (settings.layer) {
                settings.layer.show();
            } else if (settings.layerName) {
                this.mapView.showLayer(settings.layerName);
            }
            ;
        }
        ;
    };

    getLayer(properties) {
        var settings = $.extend({layerName: ''}, properties);
        if (this.mapView) {
            return this.mapView.getLayer(settings.layerName);
        }
        ;

    };

    initCanton(dataList) {

        this.addCantonLayer(dataList);
        this.addCantonStatisticsLayer(dataList);
    }

// 任务
    initTask(dataList) {
        var me = this;
        var mapView = me.mapView;

        me.addCantonBjLayer();
        mapView.removeLayer(me.layerNames.taskPt);
        showPtLayer(dataList);

        function showPtLayer(dataList) {
            var settings = {
                layerName: me.layerNames.taskPt,
                symbol: {
                    type: 'imagePoint',
                    url: path + './../maps/styles/images/monitorPt/completed.svg',
                    height: 12,
                    width: 12,
                },
                data: dataList,
                onClick: function (evt) {
                    //点位上单击响应事件
                    var data = evt.data;
                    var titleHtml = `<div class='title-info' >
                    <!--<div class='title-info-log-waterStation'></div>-->
                    <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-size: 16px;height:40px;">${data.name}</div>
                 </div>`;
                    var html = `<li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:rgb(171, 247, 140);display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">建成</span><span class="">${data.overDone}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#54D0F3;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">投运</span><span class="">${data.doing}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#FFCB4B;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">开工</span><span class="">${data.noStart}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#F1867E;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">前期</span><span class="">${data.noAccept}</span>
                                </li>`;
                    mapView.openInfoWindow(evt.getLocation(), {
                        "protCode": "4",
                        "protContent": html,
                        "openTypeCode": "12",
                        "title": titleHtml
                    });
                },
                callback: function () {
                }
            }
            if (dataList.length > 1000) {
                mapView.addLayer('vacuateLayer', settings);
            } else {
                mapView.addLayer('pointLayer', settings);
            }


        }
    }

// 监测点
    initMonitorPoint(dataList) {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        ;
        var map = mapView.getMap();
        if (!map) {
            return;
        }
        me.addCantonBjLayer();
        var layerId = '';
        dataList.map(function (item, index) {
            //地图检测点位颜色
            item.levelStatus = item.id;
            layerId = 0;
                item.symbol = {
                    type: 'simplePoint',
                    style: 'circle',//圆形
                    color: me.statusColorList[1],
                    size: 10,
                    outline: {
                        color: [255, 0, 0, 0],
                        style: 'solid',
                        width: 2
                    }
                }

            return item
        });

        if (layerId > -1 && !me.layerNames[`monitorPoint${layerId}`]) {
            me.layerNames[`monitorPoint${layerId}`] = `monitorPoint${layerId}`;
        }
        ;
        mapView.addLayer('pointLayer', {
            layerName: me.layerNames[`monitorPoint${layerId}`],
            data: dataList,
            onClick: function (evt) {
                //点位上单击响应事件
                var data = evt.data;
                // console.log("-----" + JSON.stringify(data))
                var titleHtml = `<div class='title-info' >
                                <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-size: 15px;height:40px;">${data.name}</div>
                             </div>`;

                var contentHtml = '<div style="padding: 10px;min-height:200px;" class="content-info-waterStation" slot="frame-content"></div>'
                var contentHtmlJQ = $(contentHtml)
                mapView.openInfoWindow(evt.getLocation(), {
                    "protCode": "4",
                    "protContent": contentHtmlJQ[0],
                    "openTypeCode": "12",
                    "title": titleHtml
                });

                //插槽👇
                var waterStationMonitor = new WaterStationMonitor();
                waterStationMonitor.spCode = data.spCode;
                waterStationMonitor.monitorSiteCode = data.id; //monitorSiteCode
                // waterStationMonitor.basicInfoModelList = data.basicInfoModelList;
                if(null != data.list){
                    waterStationMonitor.list = data.list[0];
                }else {
                    waterStationMonitor.list = [];
                }
                waterStationMonitor.$mount();
                $(waterStationMonitor.$el).appendTo($('.content-info-waterStation'));

                var lngLat = mapUtils.offsetLngLat(mapView, {
                    screenPoint: evt._esriEvent.screenPoint,
                    offsetX: 0,
                    offsetY: -150
                });
                mapView.setCenter([lngLat.x, lngLat.y]);

                 //mapView.setCenter([data.x, data.sign==1 ? data.y+2 : data.y+1]);//重置地图中心点，纬度偏移2
                //mapView.setCenter([data.x, data.y]);



            },
            callback: function (glayer) {


            }
        });


    }

    initMonitorPoint2(dataList, tempIndex) {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        ;
        var map = mapView.getMap();
        if (!map) {
            return;
        }
        me.addCantonBjLayer();

        dataList.map(function (item, index) {
            //地图检测点位颜色
            // item.levelStatus = item.qualityCode;
            // item.reachStatus = item.id;
            item.levelStatus = item.id + 1;
            // item.reachStatus = item.statuCode == 1 ? 1 : 2;//判断是否超标，是显示外层红圈
            if (0 === tempIndex) {
                item.symbol = {
                    html: `<div class="monitorPoint reachStatus reachStatus_${item.reachStatus}">
                        <div class="levelStatus levelStatust_${item.levelStatus}" @click="de"></div>
                    </div>`
                }
            } else if (1 === tempIndex) {
                item.symbol = {
                    html: `<div class="monitorPoint reachStatus reachStatus_${item.reachStatus}">
                        <div class="levelStatus levelStatust_${item.levelStatus}" @click="de"></div>
                    </div>`
                }
            }

            return item
        });
        mapView.addLayer('customGraphicDivLayer', {
            layerName: me.layerNames.monitorPoint,
            data: dataList,
            onClick: function (evt) {
                //点位上单击响应事件
                var data = evt.data;
                // console.log("-----" + JSON.stringify(data))
                var titleHtml = `<div class='title-info' >
                                <!--<div class='title-info-log-waterStation'></div>-->
                                <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-size: 16px;height:40px;">${data.name}</div>
                             </div>`;
                // var contentHtml = 
                // '<div style="padding: 10px">'+
                // '<div>开始日期：2019年5月14日</div><div>任务进度：<i-progress :percent="25" hide-info></i-progress></div><div style="color:#2C8CF0;border-top:1px solid #F4F5F6;height:26px;line-height:42px;text-align:center;">任务详情</div></div>';
                var contentHtml = '<div class="content-info-waterStation" slot="frame-content"></div>'
                var contentHtmlJQ = $(contentHtml)
                mapView.openInfoWindow(evt.getLocation(), {
                    "protCode": "4",
                    "protContent": contentHtmlJQ[0],
                    "openTypeCode": "12",
                    "title": titleHtml
                });
                var waterStationMonitor = new WaterStationMonitor();
                waterStationMonitor.startDate = data.startDate;
                waterStationMonitor.id = data.id;
                waterStationMonitor.$mount()
                $(waterStationMonitor.$el).appendTo($('.content-info-waterStation'));
            },
            callback: function (glayer) {
                var handleName = `${me.layerNames.monitorPoint}` + '_handle';
                if (me.eventHandleObj[handleName]) {
                    me.eventHandleObj[handleName].remove();
                }
                ;
                me.eventHandleObj[handleName] = map.on('extent-change', function (e) {
                    var graphics = glayer._esriLayer.graphics;

                    if (map.getScale() > mSet.monitorPointScale) {
                        // 小图标样式
                        if (0 === tempIndex) {
                            graphics.map(function (graphic) {
                                var attr = graphic.attributes;
                                graphic._element.innerHTML = `<div class="monitorPoint reachStatus reachStatus_${attr.reachStatus}">
<div class="levelStatus levelStatus_${attr.levelStatus}"></div>
</div>`
                            })
                        } else if (1 === tempIndex) {
                            graphics.map(function (graphic) {
                                var attr = graphic.attributes;
                                graphic._element.innerHTML = `<div class="monitorPoint reachStatus reachStatus_${attr.reachStatus}">
<div class="levelStatus levelStatust_${attr.levelStatus}"></div>
</div>`
                            })
                        }

                    } else {
                        // 放大后的样式
                        if (0 === tempIndex) {
                            graphics.map(function (graphic) {
                                var attr = graphic.attributes;
                                graphic._element.innerHTML = `
<div class="monitorPoint-text textReachStatus_${attr.reachStatus}">${attr.name}</div>
<div class="monitorPoint big reachStatus reachStatus_${attr.reachStatus}">
<div class="levelStatus levelStatus_${attr.levelStatus}"></div>
</div>`
                            })
                        } else if (1 === tempIndex) {
                            graphics.map(function (graphic) {
                                var attr = graphic.attributes;
                                graphic._element.innerHTML = `
<div class="monitorPoint-text textReachStatus_${attr.reachStatus}">${attr.name}</div>
<div class="monitorPoint big reachStatus reachStatus_${attr.reachStatus}">
<div class="levelStatus levelStatust_${attr.levelStatus}"></div>
</div>`
                            })
                        }

                    }
                    // console.log(map.getScale())
                });

            }
        });


    }

    //添加饼图统计图
    addPieChartLayer(options) {
        var settings = $.extend({
            layerName: 'pieChartLayer',
            data: [],
            onClick: null
        }, options);
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        ;
        var map = mapView.getMap();
        if (!map) {
            return;
        }
        ;
        if (!settings.data || settings.data.length < 1) {
            return;
        }
        ;

        mapView.addLayer('customPieLayer', settings);
    }

    //删除饼图统计图
    removePieChartLayer() {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        ;
        var map = mapView.getMap();
        if (!map) {
            return;
        }
        ;
        mapView.removeLayer('pieChartLayer');
    }

    //从图层上加载行政区
    addCantonBjLayer() {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        mapView.addLayer('arcGISDynamicMapServiceLayer', {
            layerName: me.layerNames.cantonBj,//图层名称，不同图层名称要求不能重复
            layerUrl: mSet.cantonBjLayerUrl,
            data: [0, 1]
        });
    }

    addCantonLayer(dataList) {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        if (!mapView) {
            return
        }
        var map = mapView.getMap();
        if (!map) {
            return
        }
        if (me.city) {
            addCityLayer(me.city)
        } /*else {
            fetch(path + `.././../maps/scripts/mapSettings/${pageCustomer.mapCantonCode}/city.json`).then(function (response) {  //地图背景色
                return response.json();
            }).then(function (city) {
                me.city = city;
                addCityLayer(city)
            });
        }*/
        ;

        if (me.country) {
            addCountryLayer(me.country)
        }/* else {
            fetch(path + `.././../maps/scripts/mapSettings/${pageCustomer.mapCantonCode}/country.json`).then(function (response) {   //地图背景色
                return response.json();
            }).then(function (country) {
                me.country = country;
                addCountryLayer(country)
            });
        }*/
        ;

        function addCityLayer(city) {
            var data = city.features.map(function (item, index) {
                var entity = dataList.filter(function (d) {
                    if (d.cantonCode == item.attributes.CODE) {
                        return d;
                    }
                });

                var color = [];
                if (entity && entity.length > 0 && entity[0].reachDestStatusCode == "1") {
                    color = mSet.cantonColorList[0];
                } else if (entity && entity.length > 0 && entity[0].reachDestStatusCode == "0") {
                    color = mSet.cantonColorList[1];
                }
                return {
                    rings: item.geometry.rings,
                    name: item.attributes.Name,
                    code: item.attributes.CODE,
                    symbol: {
                        type: 'simplePolygon',
                        style: 'solid',
                        color: color.concat(mSet.cantonOpacity),
                        outline: {
                            color: [184, 181, 181],
                            style: 'solid',
                            width: 1.2
                        }
                    }
                };
            });
            mapView.addLayer('polygonLayer', {
                layerName: me.layerNames.city,
                data: data,
                options: {
                    maxScale: mSet.cityMaxScale
                },
                onClick: function (e) {
                    removeHighlightCityLayer();
                    highlightCityLayer(e, {
                        minScale: mSet.countryMinScale,
                    });
                    mapView.setZoomScale(mSet.countryMinScale);

                    var location = e._esriEvent.graphic.geometry.getCentroid();
                    mapView.setCenter([location.x, location.y]);
                },
                callback: function () {
                    //图层加载完成之后的回调函数

                }
            });
        }

        function addCountryLayer(country) {
            var data = country.features.map(function (item, index) {
                var entity = dataList.filter(function (d) {
                    if (d.cantonCode == item.attributes.CODE) {
                        return d;
                    }
                });
                var color = [];
                if (entity && entity.length > 0 && entity[0].color) {
                    color = entity[0].color;
                } else {
                    color = mSet.cantonColorList[index % 2];
                }
                return {
                    rings: item.geometry.rings,
                    name: item.attributes.Name,
                    code: item.attributes.CODE,
                    symbol: {
                        type: 'simplePolygon',
                        style: 'solid',
                        color: color.concat(mSet.cantonOpacity),
                        outline: {
                            color: [184, 181, 181],
                            style: 'dashdot',
                            width: 1
                        }
                    }
                };
            });

            mapView.addLayer('polygonLayer', {
                layerName: me.layerNames.country,
                data: data,
                options: {
                    minScale: mSet.countryMinScale,
                },
                callback: function () {
                    //图层加载完成之后的回调函数

                    mapUtils.reorderLayer(mapView, me.layerNames.cantonStatistics, map.graphicsLayerIds.length);
                }
            });


        }

        function removeHighlightCityLayer() {
            mapView.removeLayer(me.layerNames.highlightCity)
        }

        function highlightCityLayer(e, options) {
            mapView.addLayer('polygonLayer', {
                layerName: me.layerNames.highlightCity,
                data: [{rings: e.data.rings}],
                options: options,
                symbol: {
                    type: 'simplePolygon',
                    style: 'solid',
                    color: [0, 0, 0, 0],
                    outline: {
                        color: [0, 255, 255],
                        style: 'solid',
                        width: 1.2
                    }
                },
                callback: function (e) {

                    mapUtils.reorderLayer(mapView, me.layerNames.cantonStatistics, map.graphicsLayerIds.length);

                }
            });

        }
    }

    removeEventHandle() {
        var me = this;
        var eventHandleList = Object.keys(me.eventHandleObj)
        eventHandleList.map(function (item) {
            if (me.eventHandleObj[item]) {
                me.eventHandleObj[item].remove();
                me.eventHandleObj[item] = null;
            }
            ;
        })
    }

    zoomToFullExtent() {
        var me = this;
        var mapView = me.mapView;
        if (!mapView) {
            return;
        }
        ;
        mapView.setExtent(mSet.defaultExtent);
    }

// 行政区统计
    addCantonStatisticsLayer(dataList) {
        var me = this;
        var mapView = me.mapView;

        addCantonStatisticsLayer(dataList);

        function addCantonStatisticsLayer(dataList) {
            var data = dataList.map(function (item, index) {
                var color = '';
                if (item.reachDestStatusCode == "0") {
                    item.status = '不达标';
                    color = '#ff4545';
                } else {
                    item.status = '达标';
                    color = '#8BDDAA';
                }

                var display = 'inline-block';
                if (item.level > 3) {
                    display = 'none';
                }
                item.symbol = {
                    style: {
                        height: 'auto',
                        width: '84px',
                        "flex-direction": 'row',
                        "background-color": 'auto',
                        "border-radius": '3px',
                        "color": "#333",
                        position: 'relative',
                        cursor: 'pointer'
                    },
                    //地图点位背景色控制 #00BFFF
                    html: `<div style="background-color:#00BFFF; border-bottom: 2px solid ${color};border-radius: 3px;display: ${display}; 
                                padding: 1px 3px;">${item.name}</div>`
                    //    <div style="background-color:${color};color:#fff;
                    //      border-bottom-right-radius: 3px;
                    //      border-top-right-radius: 3px;
                    //      padding: 1px 3px;">${item.status}</div>
                    //    <div style="background:rgb(160,155,108);width:5px;height:5px;border-radius: 50%;position:absolute;
                    //    bottom:-10px;right:50%;    transform: translate(50%,0);"></div>`
                }
                return item;
            });

            mapView.addLayer('cantonStatisticsLayer', {
                layerName: me.layerNames.cantonStatistics,
                lngFieldName: 'lng',
                latFieldName: 'lat',
                data: data,
                cantonLevelDictionary: mSet.cantonLevelDictionary,
                onClick: function (evt) {
                    // console.log(evt);
                    var data = evt.data;
                    var titleHtml = `<div class='title-info' >
                    <!--<div class='title-info-log-waterStation'></div>-->
                    <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-size: 16px;height:40px;">${data.name}</div>
                 </div>`;
                    /*var html = `<li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:rgb(171, 247, 140);display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">建成</span><span class="">${data.overDone}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#54D0F3;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">投运</span><span class="">${data.doing}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#FFCB4B;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">开工</span><span class="">${data.noStart}</span>
                                </li>
                                <li style="list-style:none"><span style="width:7px;height:7px;border-radius:100%;background:#F1867E;display: inline-block;margin-right:10px;"></span><span class="name" style="margin-right:10px;">前期</span><span class="">${data.noAccept}</span>
                                </li>`;*/
                    /*mapView.openInfoWindow(evt.getLocation(), {
                        "protCode": "4",
                        "protContent": html,
                        "openTypeCode": "12",
                        "title": titleHtml
                    });*/
                },
                callback: function () {
                }
            });
        }
    };

    removeGraphicLayers() {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        var layerNames = Object.keys(me.layerNames);
        layerNames.map(function (layerName) {
            mapView.removeLayer(layerName)
        })
    }

    closeInfoWindow() {
        var me = this;
        if (!me.mapView) {
            return;
        }
        ;

        var mapView = me.mapView;
        mapView.closeInfoWindow();
    }

    onLoad() {
        var me = this;
        me.refresh();
    };

    refresh() {
        //在该方法中实现的数据渲染，能够被外部调用，提供刷新效率
        var me = this;
        var vars = me.vars;
    };

    onResize() {
        //适应组件父节点大小
        var me = this;
        var vars = me.vars;

        if (vars) {
            //var height = me.fitHeight();
            if (vars.map1) {
            }
            ;
        }
    };

    onDestroy() {
        //该方法必输继承实现，避免内存溢出
        //组件销毁，最后调用父累销毁
        //销毁顺序，建议先定义的后销毁
        this.vars = null;
    };

};

module.exports = Page;