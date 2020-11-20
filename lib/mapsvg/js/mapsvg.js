/**
 * MapSVG 8.0.0 - Interactive Map Plugin
 *
 * Author: Roman S. Stepanov
 * http://codecanyon.net/user/RomanCode/portfolio?ref=RomanCode
 *
 * MapSVG @CodeCanyon: http://codecanyon.net/item/jquery-interactive-svg-map-plugin/1694201?ref=RomanCode
 * Licenses: http://codecanyon.net/licenses/regular_extended?ref=RomanCode
 */
var MapSVG = {};
window.MapSVG = MapSVG;
MapSVG.templatesLoaded = {};


// Create Element.remove() function if not exists
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

Math.hypot = Math.hypot || function() {
        var y = 0;
        var length = arguments.length;

        for (var i = 0; i < length; i++) {
            if (arguments[i] === Infinity || arguments[i] === -Infinity) {
                return Infinity;
            }
            y += arguments[i] * arguments[i];
        }
        return Math.sqrt(y);
    };
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
        return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
    };


(function($, window, MapSVG, Math){


    MapSVG.ResizeSensor = function(element, callback) {

        var _this = this;

        _this.element       = element;
        _this.callback      = callback;

        var  zIndex = parseInt(getComputedStyle(element));
        if(isNaN(zIndex)) { zIndex = 0; };
        zIndex--;

        _this.expand = document.createElement('div');
        _this.expand.style.position = "absolute";
        _this.expand.style.left = "0px";
        _this.expand.style.top = "0px";
        _this.expand.style.right = "0px";
        _this.expand.style.bottom = "0px";
        _this.expand.style.overflow = "hidden";
        _this.expand.style.zIndex = zIndex;
        _this.expand.style.visibility = "hidden";

        var  expandChild = document.createElement('div');
        expandChild.style.position = "absolute";
        expandChild.style.left = "0px";
        expandChild.style.top = "0px";
        expandChild.style.width = "10000000px";
        expandChild.style.height = "10000000px";
        _this.expand.appendChild(expandChild);

        _this.shrink = document.createElement('div');
        _this.shrink.style.position = "absolute";
        _this.shrink.style.left = "0px";
        _this.shrink.style.top = "0px";
        _this.shrink.style.right = "0px";
        _this.shrink.style.bottom = "0px";
        _this.shrink.style.overflow = "hidden";
        _this.shrink.style.zIndex = zIndex;
        _this.shrink.style.visibility = "hidden";

        var  shrinkChild           = document.createElement('div');
        shrinkChild.style.position = "absolute";
        shrinkChild.style.left     = "0px";
        shrinkChild.style.top      = "0px";
        shrinkChild.style.width    = "200%";
        shrinkChild.style.height   = "200%";
        _this.shrink.appendChild(shrinkChild);

        _this.element.appendChild(_this.expand);
        _this.element.appendChild(_this.shrink);

        var  size = element.getBoundingClientRect();

        _this.currentWidth  = size.width;
        _this.currentHeight = size.height;

        _this.setScroll();

        _this.expand.addEventListener('scroll', function(){_this.onScroll()});
        _this.shrink.addEventListener('scroll', function(){_this.onScroll()});
    };
    MapSVG.ResizeSensor.prototype.onScroll = function(){
        var _this = this;
        var  size = _this.element.getBoundingClientRect();

        var  newWidth = size.width;
        var  newHeight = size.height;

        if(newWidth != _this.currentWidth || newHeight != _this.currentHeight) {
            _this.currentWidth = newWidth;
            _this.currentHeight = newHeight;
            _this.callback();
        }

        this.setScroll();
    };
    MapSVG.ResizeSensor.prototype.setScroll = function(){
        this.expand.scrollLeft = 10000000;
        this.expand.scrollTop  = 10000000;
        this.shrink.scrollLeft = 10000000;
        this.shrink.scrollTop  = 10000000;
    };
    MapSVG.ResizeSensor.prototype.destroy = function(){
        this.expand.remove();
        this.shrink.remove();
    };

    MapSVG.userAgent = navigator.userAgent.toLowerCase();

    // Check for iPad/Iphone/Android
    MapSVG.touchDevice =
        (MapSVG.userAgent.indexOf("ipad") > -1) ||
        (MapSVG.userAgent.indexOf("iphone") > -1) ||
        (MapSVG.userAgent.indexOf("ipod") > -1) ||
        (MapSVG.userAgent.indexOf("android") > -1);

    MapSVG.ios =
        (MapSVG.userAgent.indexOf("ipad") > -1) ||
        (MapSVG.userAgent.indexOf("iphone") > -1) ||
        (MapSVG.userAgent.indexOf("ipod") > -1);

    MapSVG.android = MapSVG.userAgent.indexOf("android");

    // MapSVG.isPhone = window.matchMedia("only screen and (min-device-width: 320px) and (max-device-width: 812px)").matches;
    MapSVG.isPhone = window.matchMedia("only screen and (max-width: 812px)").matches;

    MapSVG.browser = {};
    MapSVG.browser.ie = MapSVG.userAgent.indexOf("msie") > -1 || MapSVG.userAgent.indexOf("trident") > -1 || MapSVG.userAgent.indexOf("edge") > -1 ? {} : false;
    MapSVG.browser.firefox = MapSVG.userAgent.indexOf("firefox") > -1;

    if (!String.prototype.trim) {
        String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
    }

    // Create function for retrieving mouse coordinates
    MapSVG.mouseCoords = function(e){
        if(e.clientX){
            return {'x':e.clientX + $(document).scrollLeft(), 'y':e.clientY + $(document).scrollTop()};
        }if(e.pageX){
            return {'x':e.pageX, 'y':e.pageY};
        }else if(MapSVG.touchDevice){
            e = e.originalEvent || e;
            return e.touches && e.touches[0] ?
            {'x':e.touches[0].pageX, 'y':e.touches[0].pageY} :
            {'x':e.changedTouches[0].pageX, 'y':e.changedTouches[0].pageY};
        }
    };


    MapSVG.get = function(index){
        return jQuery('.mapsvg').eq(index).mapSvg();
    };


    MapSVG.extend = function(sub, base) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
    };

    MapSVG.ucfirst = function(string){
        return string.charAt(0).toUpperCase()+string.slice(1);
    };
    MapSVG.parseBoolean = function (string) {
        switch (String(string).toLowerCase()) {
            case "on":
            case "true":
            case "1":
            case "yes":
            case "y":
                return true;
            case "off":
            case "false":
            case "0":
            case "no":
            case "n":
                return false;
            default:
                return undefined;
        }
    };
    MapSVG.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    MapSVG.safeURL = function(url){
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)
            url = "//"+url.split("://").pop();
        return url.replace(/^.*\/\/[^\/]+/, '');
    };

    MapSVG.convertToText = function(obj) {
        //create an array that will later be joined into a string.
        var string = [];

        //is object
        //    Both arrays and objects seem to return "object"
        //    when typeof(obj) is applied to them. So instead
        //    I am checking to see if they have the property
        //    join, which normal objects don't have but
        //    arrays do.
        if (obj == undefined) {
            return String(obj);
        } else if (typeof(obj) == "object" && (obj.join == undefined)) {
            var prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)){
                    var key = prop.search(/[^a-zA-Z]+/) === -1 ?  prop : "'"+prop.replace("'","\\'")+"'";
                    string.push(key + ": " + MapSVG.convertToText(obj[prop]));
                }
            }
            return "{" + string.join(",") + "}";

            //is array
        } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
            var prop;
            for(prop in obj) {
                string.push(MapSVG.convertToText(obj[prop]));
            }
            return "[" + string.join(",") + "]";

            //is function
        } else if (typeof(obj) == "function") {
            string.push(obj.toString().replace('function anonymous','function'));

            //all other values can be done with JSON.stringify
        } else {
            var s = JSON.stringify(obj);
            string.push(s);
        }

        return string.join(",");
    };


    /*
     * CONTROLLER
     */
    MapSVG.Controller = function(options){
        this.container            = options.container;
        this.mapsvg               = options.mapsvg;
        this.template             = options.template;
        this.scrollable           = options.scrollable === undefined ? true : options.scrollable;
        this.withToolbar          = options.withToolbar === undefined ? true : options.withToolbar;
        this.autoresize           = MapSVG.parseBoolean(options.autoresize);
        this.templates            = {
            toolbar: this.getToolbarTemplate(),
            main: this.getMainTemplate()
        };
        this.data                 = options.data;
        this.width = options.width;
        this.color = options.color;
        this.events = {};
        if(options.events){
           for(var i in options.events) {
               if(typeof options.events[i] == 'function'){
                   this.events[i] = options.events[i];
               }
           }
        }
        this._init();
    };
    MapSVG.Controller.prototype.viewDidLoad = function(){
        var _this = this;
        _this.updateScroll();
        if(this.autoresize){
            _this.adjustHeight();
            this.resizeSensor.setScroll();
        }
    };
    MapSVG.Controller.prototype.viewDidAppear    = function(){};
    MapSVG.Controller.prototype.viewDidDisappear = function(){};
    MapSVG.Controller.prototype._viewDidLoad     = function(){
        if(this.scrollable)
            this.updateScroll();
    };
    MapSVG.Controller.prototype.updateScroll = function(){
        var _this = this;
        this.contentWrap.nanoScroller({preventPageScrolling: true, iOSNativeScrolling: true});
        setTimeout(function(){
            _this.contentWrap.nanoScroller({preventPageScrolling: true, iOSNativeScrolling: true});
        },300);
    };

    MapSVG.Controller.prototype.adjustHeight = function() {
        var _this = this;
        _this.container.height(_this.container.find('.mapsvg-auto-height').outerHeight()+_this.toolbarView.outerHeight());
    };

    MapSVG.Controller.prototype.init = function(){};

    MapSVG.Controller.prototype._init = function(){
        var _this = this;
        _this.render();
        _this.init();
    };
    MapSVG.Controller.prototype.getToolbarTemplate = function(){
        return '';
    };
    MapSVG.Controller.prototype.getMainTemplate = function(){
        return this.template;
    };

    MapSVG.Controller.prototype.render = function(){

        var _this = this;
        this.view    = $('<div />').attr('id','mapsvg-controller-'+this.name).addClass('mapsvg-controller-view');

        // Wrap cointainer, includes scrollable container
        this.contentWrap    = $('<div />').addClass('mapsvg-controller-view-wrap');
        this.contentWrap2    = $('<div />');

        // Scrollable container
        this.contentSizer    = $('<div />').addClass('mapsvg-auto-height');
        this.contentView    = $('<div />').addClass('mapsvg-controller-view-content');
        this.contentSizer.append(this.contentView);

        if(this.scrollable){
            this.contentWrap.addClass('nano');
            this.contentWrap2.addClass('nano-content');
        }
        this.contentWrap.append(this.contentWrap2);
        this.contentWrap2.append(this.contentSizer);

        // Add toolbar if it exists in template file
        if(this.templates.toolbar){
            this.toolbarView = $('<div />').addClass('mapsvg-controller-view-toolbar');
            this.view.append(this.toolbarView);
        }

        this.view.append(this.contentWrap);

        // Add view into container
        this.container.append(this.view);
        this.container.data('controller', this);

        if(this.width)
            this.view.css({width: this.width});
        if(this.color)
            this.view.css({'background-color': this.color});

        _this.viewReadyToFill();
        this.redraw();

        setTimeout(function(){
            _this._viewDidLoad();
            _this.viewDidLoad();
            _this.setEventHandlersCommon();
            _this.setEventHandlers();
        },1);
    };

    MapSVG.Controller.prototype.viewReadyToFill = function(){
        var _this = this;
        if(_this.autoresize){
            _this.resizeSensor = new MapSVG.ResizeSensor(this.contentSizer[0], function(){
                _this.adjustHeight();
                _this.updateScroll();
                _this.events['resize'] && _this.events['resize'].call(_this, _this.mapsvg);
            });
        }
    };

    MapSVG.Controller.prototype.redraw = function(){

        this.contentView.html( this.templates.main );

        if(this.templates.toolbar)
            this.toolbarView.html( this.templates.toolbar );

        this.updateTopShift();

        if(this.noPadding)
            this.contentView.css({padding: 0});

        if(this.scrollable)
            this.updateScroll();
    };
    MapSVG.Controller.prototype.updateTopShift = function(){
        var _this = this;
        _this.contentWrap.css({'top': _this.toolbarView.outerHeight(true)+'px'});

        setTimeout(function(){
            _this.contentWrap.css({'top': _this.toolbarView.outerHeight(true)+'px'});
        },500);
    };

    MapSVG.Controller.prototype.setEventHandlersCommon = function(){

    };
    MapSVG.Controller.prototype.setEventHandlers = function(){
    };
    MapSVG.Controller.prototype.destroy = function(){
        this.view.empty().remove();
        if(this.resizeSensor){
            this.resizeSensor.destroy();
        }
    };


    /*
     * Directory Controller
     */
    MapSVG.DirectoryController = function(options){
        this.database = options.database;
        this.noPadding = true;
        this.position = options.position;
        this.search = options.search;
        this.filters = options.filters;
        MapSVG.Controller.call(this, options);
    };
    MapSVG.extend(MapSVG.DirectoryController, MapSVG.Controller);

    MapSVG.DirectoryController.prototype.getToolbarTemplate = function(){
        var _this = this;

        var t = '<div class="mapsvg-directory-search-wrap">';
        // t    += '<input class="mapsvg-directory-search" placeholder="{{menu.searchPlaceholder}}" />';

        if(this.search){
            t    += '<div class="mapsvg-directory-search-wrap-margin" >';
            t    += '<input class="mapsvg-directory-search" placeholder="{{options.menu.searchPlaceholder}}" />';
            t    += '</div>';
        }

        t    += '<div class="mapsvg-directory-filter-wrap"></div>';
        t    += '</div>';
        t    += '</div>';

        return t;
    };

    MapSVG.DirectoryController.prototype.viewDidLoad = function() {

        var _this = this;
        this.menuBtn = $('<div class="mapsvg-button-menu"><i class="mapsvg-icon-menu"></i> ' + this.mapsvg.getData().options.mobileView.labelList + '</div>');
        this.mapBtn  = $('<div class="mapsvg-button-map"><i class="mapsvg-icon-map"></i> '   + this.mapsvg.getData().options.mobileView.labelMap  + '</div>');

        // Make directory hidden by default on mobiles
        this.mapBtn.addClass('active');
        this.container.addClass('closed');

        this.mobileButtons = $('<div class="mapsvg-mobile-buttons"></div>');
        this.mobileButtons.append(this.menuBtn, this.mapBtn);

        if(this.mapsvg.getData().options.menu.on !== false)
            this.mobileButtons.insertAfter(this.mapsvg.getData().$wrap);

        this.events && this.events['shown'] && this.events['shown'].call(this.view);

        if(this.mapsvg.getData().options.filters && this.mapsvg.getData().options.filters.on){
            _this.setFilters();
        }

        if(this.mapsvg.getData().options.colors.directorySearch){
            this.toolbarView.css({'background-color':this.mapsvg.getData().options.colors.directorySearch});
        }
    };

    MapSVG.DirectoryController.prototype.setEventHandlers = function(){

        var _this = this;
        var _data = _this.mapsvg.getData();

        $(window).on('resize',function(){
            _this.updateTopShift();
        });

        this.view.on('keyup.menu.mapsvg', '.mapsvg-directory-search',function () {
            var data = {search: $(this).val()};
            if(_this.mapsvg.getData().options.menu.searchFallback)
                data.searchFallback = true;
            _this.database.getAll(data);
        });

        this.menuBtn.on('click', function(){
            _this.toggle(true);
            // if(!$(this).hasClass('active')){
            //     _this.toggle();
            //     $(this).parent().find('div').removeClass('active');
            //     $(this).addClass('active');
            // }
        });
        this.mapBtn.on('click', function(){
            _this.toggle(false);
            // if(!$(this).hasClass('active')){
            //     _this.toggle();
            //     $(this).parent().find('div').removeClass('active');
            //     $(this).addClass('active');
            // }
        });

        this.view.on('click.menu.mapsvg', '.mapsvg-directory-item', function (e) {

            e.preventDefault();
            var objID  = $(this).data('object-id');

            var regions;
            var marker;
            var detailsViewObject;
            var eventObject;

            _this.deselectItems();
            _this.selectItems(objID);


            if(_this.mapsvg.getData().options.menu.source == 'regions'){
                regions = [_this.mapsvg.getRegion(objID)];
                eventObject = regions[0];
                detailsViewObject = regions[0];
            } else {
                detailsViewObject = _this.database.getLoadedObject(objID);
                eventObject = detailsViewObject;
                if(detailsViewObject.regions){
                    regions = detailsViewObject.regions.map(function(region){
                        return _this.mapsvg.getRegion(region.id);
                    });
                }
            }

            if(detailsViewObject.marker && detailsViewObject.marker.id)
                marker = _this.mapsvg.getMarker(detailsViewObject.marker.id);

            if(_this.mapsvg.getData().options.actions.directoryItem.click.showDetails){
                _this.mapsvg.loadDetailsView(detailsViewObject);
                _this.toggle(false);
            }
            var skipPopover;

            if(regions && regions.length > 0) {

                if(_this.mapsvg.getData().options.actions.directoryItem.click.zoom){
                    _this.mapsvg.zoomTo(regions, _this.mapsvg.getData().options.actions.directoryItem.click.zoomToLevel);
                }

                if(regions.length > 1){
                    _this.mapsvg.setMultiSelect(true);
                }
                regions.forEach(function(region){

                    var center = region.getCenter();
                    e.clientX = center[0];
                    e.clientY = center[1];

                    if(_this.mapsvg.getData().options.actions.directoryItem.click.selectRegion){
                        //region.setSelected(true);
                        _this.mapsvg.selectRegion(region, true);
                    }
                    if(_this.mapsvg.getData().options.actions.directoryItem.click.showRegionPopover){
                        _this.toggle(false);
                        _this.mapsvg.showPopover(region);
                    }
                    if(_this.mapsvg.getData().options.actions.directoryItem.click.fireRegionOnClick){
                        var events = _this.mapsvg.getData().events;
                        if(events && events['click.region'])
                            events && events['click.region'].call(region, e, _this.mapsvg);
                    }
                });
                if(regions.length > 1){
                    _this.mapsvg.setMultiSelect(false, false);
                }

            }
            if(marker){
                if(_this.mapsvg.getData().options.actions.directoryItem.click.showMarkerPopover){
                    _this.mapsvg.showPopover(detailsViewObject);
                    _this.toggle(false);
                }
                if(_this.mapsvg.getData().options.actions.directoryItem.click.fireMarkerOnClick){
                    var events = _this.mapsvg.getData().events;
                    if(events && events['click.marker'])
                        events && events['click.marker'].call(marker, e, _this.mapsvg);
                }
            }

            _this.events['click'] && _this.events['click'].call($(this), e, eventObject, _this.mapsvg);

            var actions = _this.mapsvg.getData().options.actions;


            if(actions.directoryItem.click.goToLink){
                var linkParts = actions.directoryItem.click.linkField.split('.');
                var url;
                if(linkParts.length > 1){
                    var obj = linkParts.shift();
                    var attr = '.'+linkParts.join('.');
                    if(obj == 'Region'){
                        if(regions[0] && regions[0].data)
                            url = eval('regions[0].data'+attr);
                    }else{
                        if(detailsViewObject)
                            url = eval('detailsViewObject'+attr);
                    }

                    if(url){
                        if(actions.directoryItem.click.newTab){
                            var win = window.open(url, '_blank');
                            win.focus();
                        }else{
                            window.location.href = url;
                        }
                    }
                }
            }
        }).on('mouseover.menu.mapsvg',  '.mapsvg-directory-item', function (e) {

            var objID = $(this).data('object-id');
            var regions;

            if(_this.mapsvg.getData().options.menu.source == 'regions'){
                regions = [_this.mapsvg.getRegion(objID)];
            } else {
                var detailsViewObject = _this.database.getLoadedObject(objID);
                if(detailsViewObject.regions){
                    regions = detailsViewObject.regions.map(function(region){
                        return _this.mapsvg.getRegion(region.id);
                    });
                }
            }

            if(regions && regions.length){
                _this.mapsvg.highlightRegions(regions);

                regions.forEach(function(region){
                    if(region && !region.disabled){
                        _this.mapsvg.getData().options.mouseOver && _this.mapsvg.getData().options.mouseOver.call(region, e, _this);
                    }
                });
            }
            _this.events['mouseover'] && _this.events['mouseover'].call($(this), e, eventObject, _this.mapsvg);
        }).on('mouseout.menu.mapsvg',  '.mapsvg-directory-item', function (e) {

            var objID = $(this).data('object-id');
            var regions;

            if(_this.mapsvg.getData().options.menu.source == 'regions'){
                regions = [_this.mapsvg.getRegion(objID)];
            } else {
                var detailsViewObject = _this.database.getLoadedObject(objID);
                if(detailsViewObject.regions){
                    regions = detailsViewObject.regions.map(function(region){
                        return _this.mapsvg.getRegion(region.id);
                    });
                }
            }

            if(regions && regions.length){
                _this.mapsvg.unhighlightRegions(regions);
                regions.forEach(function(region){
                    if(region && !region.disabled){
                        _this.mapsvg.getData().options.mouseOut && _this.mapsvg.getData().options.mouseOut.call(region, e, _this);
                    }
                });
            }

            _this.events['mouseout'] && _this.events['mouseout'].call($(this), e, eventObject, _this.mapsvg);

        }).on('click.menu.mapsvg','.mapsvg-filter-delete',function(e){
            var filterField = $(this).data('filter');
            _this.database.query.filters[filterField] = null;
            delete _this.database.query.filters[filterField];
            _this.mapsvg.deselectAllRegions();
            _this.mapsvg.loadDataObjects();
        });

    };


    MapSVG.DirectoryController.prototype.highlightItems = function(ids){
        var _this = this;
        if(typeof ids != 'object')
            ids = [ids];
        ids.forEach(function(id){
            _this.view.find('#mapsvg-directory-item-'+id).addClass('hover');
        });
    };
    MapSVG.DirectoryController.prototype.unhighlightItems = function(){
        this.view.find('.mapsvg-directory-item').removeClass('hover');
    };
    MapSVG.DirectoryController.prototype.selectItems = function(ids){
        var _this = this;
        if(typeof ids != 'object')
            ids = [ids];
        ids.forEach(function(id){
            _this.view.find('#mapsvg-directory-item-'+id).addClass('selected');
        });
    };
    MapSVG.DirectoryController.prototype.deselectItems = function(){
        this.view.find('.mapsvg-directory-item').removeClass('selected');
    };

    MapSVG.DirectoryController.prototype.addFilter = function(field){
      var schema = this.database.getSchema();
    };
    MapSVG.DirectoryController.prototype.loadItemsToDirectory = function(){
        var items;
        var _this = this;

        // if(this.mapsvg.getData().options.menu.source == 'regions'){
        //     var _items = [];
        //     items = this.mapsvg.getData().regions;
        //     items.forEach(function(item){
        //         if(!item.disabled)
        //             _items.push(item.forTemplate());
        //     });
        //     items = _items;
        // }else{
            items = this.database.getLoaded();

            if(this.database.table == 'regions'){
                items = items.filter(function(item){
                    var status = _this.mapsvg.getData().options.regionStatuses;
                   if(status[item.status]){
                       return !status[item.status].disabled;
                   }else{
                       return true;
                   }
                });
            }
        // }
        this.contentView.html( this.templates.main({'items': items}) );
        if(items.length == 0){
            this.contentView.html('<div class="mapsvg-no-results">'+this.mapsvg.getData().options.menu.noResultsText+'</div>');
        }
        this.setFilters();
        if(this.scrollable)
            this.updateScroll();
    };
    MapSVG.DirectoryController.prototype.getRegion = function(id){
        var _this = this;
        var region;
        if(_this.mapsvg.getData().options.menu.source == 'regions'){
            region = _this.mapsvg.getRegion(id);
        }else{
            var obj = _this.database.getLoadedObject(id);
            if(obj.region_id)
                region = _this.mapsvg.getRegion(obj.region_id);
        }
        return region;
    };
    MapSVG.DirectoryController.prototype.setFilters = function(){
        var _this = this;
        var filters = this.toolbarView.find('.mapsvg-directory-filter-wrap');
        this.toolbarView.find('.mapsvg-filter-tag').remove();

        if(!_this.formBuilder && _this.mapsvg.getData().options.filters && _this.mapsvg.getData().options.filters.on){
            _this.formBuilder = new MapSVG.FormBuilder({
                container: _this.view.find('.mapsvg-directory-filter-wrap'),
                filtersMode: true,
                schema: _this.mapsvg.filtersSchema.getSchema(),
                editMode: false,
                mapsvg: _this.mapsvg,
                // mediaUploader: mediaUploader,
                // data: _dataRecord,
                admin: _this.admin,
                events: {
                    // save: function(data){_this.saveDataObject(data); },
                    // update:  function(data){ _this.updateDataObject(data); },
                    // close: function(){ _this.closeFormHandler(); },
                    // load: function(){_this.updateScroll(); }
                }
            });
            _this.formBuilder.view.on('change','select,input[type="radio"]',function(){
                var filter = {};
                var field = $(this).data('parameter-name');

                // if($(this).data('type')){
                //     filter[field] = {type: $(this).data('type'), value: $(this).val()};
                // }else{
                filter[field] = $(this).val();
                // }


                _this.database.query.setFilters(filter);

                // _this.formBuilder.view.find('select,input[type="radio"]').each(function(index){
                //     var field = $(this).data('parameter-name');
                //     var val = $(this).val();
                //     filters[field] = val;
                // });
                _this.database.getAll(filter);
            });
            setTimeout(
                function(){
                    _this.updateTopShift();
                    if(this.scrollable)
                        _this.updateScroll();

                }, 200);
        }

        if(_this.mapsvg.getData().options.filters && _this.mapsvg.getData().options.filters.on || ( _this.database.query.filters && Object.keys(_this.database.query.filters).length > 0)){

            for(var field_name in _this.database.query.filters){
                var field_value = _this.database.query.filters[field_name];
                var _field_name = field_name;
                var filterField = _this.mapsvg.filtersSchema.getField(_field_name);

                if(_this.mapsvg.getData().options.filters.on && filterField){
                    filters.find('[data-parameter-name="'+_field_name+'"]').val(field_value);
                }else{
                    if(field_name == 'regions'){
                        // check if there is such filter. If there is then change its value
                        // if there isn't then add a tag with close button
                        _field_name = 'region';
                        field_value = _this.mapsvg.getRegion(field_value).title || field_value;
                    }
                    filters.append('<div class="mapsvg-filter-tag">'+_field_name+': '+field_value+' <span class="mapsvg-filter-delete" data-filter="'+field_name+'">×</span></div>');
                }
            }
            this.view.addClass('mapsvg-with-filter');

        }else{
            this.view.removeClass('mapsvg-with-filter');
        }
        this.updateTopShift();
    };

    MapSVG.DirectoryController.prototype.toggle = function(on){
        var _this = this;
        if(on){
            this.container.removeClass('closed');
            this.menuBtn.addClass('active');
            this.mapBtn.removeClass('active');
        }else{
            this.container.toggleClass('closed');
            if(this.container.hasClass('closed')){
                if(MapSVG.isPhone){
                    _this.mapsvg.getData().$wrap.css('height','auto');
                    _this.updateScroll();
                }
            }else{
                if(MapSVG.isPhone && this.container.height() < 400){
                    _this.mapsvg.getData().$wrap.css('height','400px');
                    _this.updateScroll();
                }
            }
            this.menuBtn.removeClass('active');
            this.mapBtn.addClass('active');
        }

        this.updateTopShift();
    };

    MapSVG.DirectoryController.prototype.addPagination = function(pager){
        this.contentView.append('<div class="mapsvg-pagination-container"></div>');
        this.contentView.find('.mapsvg-pagination-container').html(pager);
    };

    /*
     * Details View Controller
     */
    MapSVG.DetailsController = function(options){
        MapSVG.Controller.call(this, options);
    };
    MapSVG.extend(MapSVG.DetailsController, MapSVG.Controller);

    MapSVG.DetailsController.prototype.getToolbarTemplate = function(){
        if(this.withToolbar)
            return '<div class="mapsvg-popover-close mapsvg-details-close"></div>';
        else
            return '';
    };

    MapSVG.DetailsController.prototype.init = function(){
    };

    MapSVG.DetailsController.prototype.viewDidLoad = function(){
        var _this = this;
        this.events && this.events['shown'] && this.events['shown'].call(_this, _this.mapsvg);
    };

    MapSVG.DetailsController.prototype.setEventHandlers = function(){
        var _this = this;
        this.view.on('click touchend','.mapsvg-popover-close',function(){
            _this.destroy();
            _this.events && _this.events['closed'] && _this.events['closed'].call(_this, _this.mapsvg);
        });
    };

    /*
     * Popover View Controller
     */
    MapSVG.PopoverController = function(options){
        options.autoresize = true;
        MapSVG.Controller.call(this, options);
        this.point = options.point;
        this.yShift = options.yShift;
        this.mapObject = options.mapObject;
        this.id = this.mapObject.id+'_'+Math.random();
        this.container.data('popover-id', this.id);
        var _this = this;
    };
    MapSVG.extend(MapSVG.PopoverController, MapSVG.Controller);


    MapSVG.PopoverController.prototype.setPoint = function(point){
        this.point = point;
    };

    MapSVG.PopoverController.prototype.getToolbarTemplate = function(){
        if(this.withToolbar)
            return '<div class="mapsvg-popover-close"></div>';
        else
            return '';
    };

    MapSVG.PopoverController.prototype.init = function(){
    };

    MapSVG.PopoverController.prototype.viewDidLoad = function(){
        MapSVG.Controller.prototype.viewDidLoad.call(this);
        var _this = this;
        this.adjustPosition();
        this.container.toggleClass('mapsvg-popover-animate', true);
        this.container.toggleClass('mapsvg-popover-visible', true);
        _this.adjustHeight();
        _this.updateScroll();
        this.resizeSensor.setScroll();
        this.events && this.events['shown'] && this.events['shown'].call(_this, _this.mapsvg);
    };
    MapSVG.PopoverController.prototype.adjustHeight = function() {
        var _this = this;
        _this.container.height(_this.container.find('.mapsvg-auto-height').outerHeight()+_this.toolbarView.outerHeight());
    };
    MapSVG.PopoverController.prototype.adjustPosition = function() {
        var _this = this;
        var pos   = _this.mapsvg.convertSVGToPixel([_this.point.x, _this.point.y]);
        pos[1]   -= _this.yShift;
        _this.container.css({
            'transform': 'translateX(-50%) translate(' + pos[0] + 'px,' + pos[1]+ 'px)'
        });
    };


    MapSVG.PopoverController.prototype.setEventHandlers = function(){
        var _this = this;
        $('body').off('.popover.mapsvg');

        this.view.on('click touchend','.mapsvg-popover-close',function(){
            _this.close();
        });

        $('body').one('mouseup.popover.mapsvg touchend.popover.mapsvg ', function(e){
            setTimeout(function(){
                if(_this.mapsvg.getData().isScrolling || $(e.target).closest('.mapsvg-popover').length || $(e.target).hasClass('mapsvg-btn-zoom'))
                    return;
                _this.close();
            },50);
        });
    };
    MapSVG.PopoverController.prototype.close = function(){
        var _this = this;
        if((this.container.data('popover-id')!= this.id) || !_this.container.is(':visible'))
            return;
        _this.destroy();
        if(_this.mapObject instanceof MapSVG.Region){
            _this.mapsvg.deselectRegion(_this.mapObject);
        }

        _this.events && _this.events['closed'] && _this.events['closed'].call(_this);
    };
    MapSVG.PopoverController.prototype.destroy = function() {
        var _this = this;
        _this.container.toggleClass('mapsvg-popover-animate', false);
        _this.container.toggleClass('mapsvg-popover-visible', false);
        MapSVG.Controller.prototype.destroy.call(this);

    };
    MapSVG.PopoverController.prototype.show = function(){
        var _this = this;
        // _this.container.toggleClass('mapsvg-popover-animate', true);
        _this.container.toggleClass('mapsvg-popover-visible', true);
    };


})(jQuery, window, MapSVG, Math);



(function( $ ) {

    var mapSVG = {};



    //
    // REGION
    //
    function MapObject(jQueryObject, mapsvg){
        this.id = "";
        this.objects = [];
        this.data = {};
        this.node = jQueryObject;
        this.mapsvg = mapsvg;
        this.nodeType = jQueryObject[0].tagName;
    }

    MapObject.prototype.isMarker = function(){
        return this.mapsvg_type == 'marker';
    };
    MapObject.prototype.isRegion = function(){
        return this.mapsvg_type == 'region';
    };
    MapObject.prototype.setData = function(data){
        var _this = this;
        for(var name in data){
            _this.data[name] = data[name];
        }
    };
    MapObject.prototype.getBBox = function(){
        // var _data = this.mapsvg.getData();
        // var xoffset = _data.$map.offset().left;
        // var yoffset = _data.$map.offset().top;
        //
        //
        // var x = (this.node[0].getBoundingClientRect().left - xoffset + jQuery('body').scrollLeft())/_data.scale  + _data.viewBox[0];
        // var y = (this.node[0].getBoundingClientRect().top - yoffset + jQuery('body').scrollTop())/_data.scale   + _data.viewBox[1];
        // var w = this.node[0].getBoundingClientRect().width/_data.scale;
        // var h = this.node[0].getBoundingClientRect().height/_data.scale;
        var bbox = this instanceof Marker ? {x: this.x, y: this.y, width: this.default.width, height: this.default.height} : this.node[0].getBBox();
        bbox = $.extend(true, {}, bbox);
        // var globalToLocal = this.node[0].getTransformToElement(this.mapsvg.getData().$svg[0]).inverse();
        // var inObjectSpace = globalPoint.matrixTransform( globalToLocal );


        if(!(this instanceof Marker)){
            var matrix = this.node[0].getTransformToElement(this.mapsvg.getData().$svg[0]);
            var x2 = bbox.x+bbox.width;
            var y2 = bbox.y+bbox.height;


            // transform a point using the transformed matrix
            var position = this.mapsvg.getData().$svg[0].createSVGPoint();
            position.x = bbox.x;
            position.y = bbox.y;
            position = position.matrixTransform(matrix);
            bbox.x = position.x;
            bbox.y = position.y;
            // var position = this.mapsvg.getData().$svg[0].createSVGPoint();
            position.x = x2;
            position.y = y2;
            position = position.matrixTransform(matrix);
            bbox.width = position.x - bbox.x;
            bbox.height = position.y - bbox.y;

        }

        // if(!(this instanceof Marker)){
        //     var scale = this.mapsvg.getScale();
        //     var r = this.node[0].getBoundingClientRect();
        //     bbox = {x: r.x*scale, y: r.y*scale, width: r.width*scale, height: r.height*scale};
        // }else{
        //     bbox = {x: this.x, y: this.y, width: this.default.width, height: this.default.height}
        // }

        return [bbox.x,bbox.y,bbox.width,bbox.height];
    };
    MapObject.prototype.getGeoBounds = function(){
        // var _data = this.mapsvg.getData();
        // var xoffset = _data.$map.offset().left;
        // var yoffset = _data.$map.offset().top;
        //
        //
        // var x = (this.node[0].getBoundingClientRect().left - xoffset + jQuery('body').scrollLeft())/_data.scale  + _data.viewBox[0];
        // var y = (this.node[0].getBoundingClientRect().top - yoffset + jQuery('body').scrollTop())/_data.scale   + _data.viewBox[1];
        // var w = this.node[0].getBoundingClientRect().width/_data.scale;
        // var h = this.node[0].getBoundingClientRect().height/_data.scale;
        // var bbox = this.node[0].getBBox();
        var bbox = this.getBBox();
        var sw = this.mapsvg.convertSVGToGeo(bbox.x, (bbox.y + bbox.height));
        var ne = this.mapsvg.convertSVGToGeo((bbox.x + bbox.width), bbox.y);

        return {sw: sw,ne: ne};
    };
    MapObject.prototype.getComputedStyle = function(prop, node){
        node = node || this.node[0];
        var _p1,_p2;
        if(_p1 = node.getAttribute(prop)){
            return _p1;
        }else if(_p2 = node.getAttribute('style')){
            var s = _p2.split(';');
            var z = s.filter(function(e){
                var e = e.trim();
                var attr = e.split(':');
                if (attr[0]==prop)
                    return true;
            });
            if(z.length){
                return z[0].split(':').pop().trim();
            }
        }


        var parent = $(node).parent();
        var nodeType = parent.length ? parent[0].tagName : null;

        if (nodeType && nodeType!='svg')
            return this.getComputedStyle(prop,parent[0]);
        else
            return undefined;
    };
    MapObject.prototype.getStyle = function(prop){
        var _p1, _p2;
        if(_p1 = this.attr(prop)){
            return _p1;

        }else if(_p2 = this.attr('style')){
            var s = _p2.split(';');
            var z = s.filter(function(e){
                var e = e.trim();
                if (e.indexOf(prop)===0)
                    return e;
            });

            return z.length ? z[0].split(':').pop().trim() : undefined;
        }
        return "";
    };
    MapObject.prototype.getCenter = function(){

        // var c = this.getBBox();

        var x = this.node[0].getBoundingClientRect().left;
        var y = this.node[0].getBoundingClientRect().top;
        var w = this.node[0].getBoundingClientRect().width;
        var h = this.node[0].getBoundingClientRect().height;
        return [x+w/2,y+h/2];
    };
    MapObject.prototype.getCenterSVG = function(){
        var _this = this;
        var c = _this.getBBox();
        return {x: c[0]+c[2]/2, y: c[1]+c[3]/2};
    };
    MapObject.prototype.getCenterLatLng = function(yShift){
        yShift = yShift ? yShift : 0;
        var bbox = this.node[0].getBBox();
        var x = bbox.x + bbox.width/2;
        var y = bbox.y + bbox.height/2 - yShift;
        var latlng = this.mapsvg.convertSVGToGeo(x,y);
        return {lat: latlng[0], lng: latlng[1]};
    };
    MapObject.prototype.setTooltip = function(text){
        this.tooltip = text ? text :  undefined;
    };
    MapObject.prototype.setPopover = function(text){
        this.popover = text ? text :  undefined;
    };
    MapObject.prototype.setHref = function(url){
        // if (this.href && this.node.parent('a').length)
        //     this.node.unwrap();
        this.href = url ? url : undefined;
        // if (this.href){
        //     var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";
        //     var a = document.createElementNS(svgNS, "a");
        //     a.setAttributeNS(xlinkNS,"href",this.href);
        //     if(this.target)
        //         a.setAttribute("target",this.target);
        //     this.node.wrap($(a));
        // }
    };
    MapObject.prototype.setTarget = function(target){
        this.target = target ? target : undefined;
    };
    MapObject.prototype.setData = function(data){

        if(data){
            if(typeof data == 'string'){
                if(data.substr(0,1)=='[' || data.substr(0,1)=='{'){
                    try{
                        var tmp;
                        eval('tmp = '+data);
                        this.data = tmp;
                    }catch(err){
                        var error = "MapSVG: Error in Data object for "+this.mapsvg_type+" '"+this.id+"'. Data object was set to empty object {}.";
                        this.data = {};
                        return {_error: error};
                    }
                }else{
                    this.data = data;
                }
            }else{
                this.data = data;
            }
            return this.data;
        }else{
            this.data = undefined;
        }
    };
    MapObject.prototype.attr = function(v1,v2){
        var svgDom = this.node[0];

        if(typeof v1 == "object"){
            $.each(v1,function(key,item){
                if (typeof item == "string" || typeof item == "number"){
                    svgDom.setAttribute(key,item);
                }
            });
        }
        else if(typeof v1 == "string" && (typeof v2 == "string" || typeof v2 == "number")){
            svgDom.setAttribute(v1,v2);
        }
        else if(v2 == undefined) {
            return svgDom.getAttribute(v1);
        }
    };
    MapObject.prototype.setId = function(id){
        if(!id) return false;
        this.id = id;
        this.node[0].setAttribute('id',id);
        if(this.isMarker()){
            this.mapsvg.updateMarkersDict();
        }
    };



    //
    // REGION
    //
    function Region(jQueryObject, globalOptions, regionID, mapsvg){
        MapObject.call(this, jQueryObject);

        this.globalOptions = globalOptions;
        this.mapsvg = mapsvg;


        this.id = this.node.attr('id');

        if(!this.id){
            this.setId(this.nodeType+'_'+regionID.id++);
            this.autoID = true;
        }

        this.id_no_spaces = this.id.replace(' ','_');

        this.title = this.node.attr('title');

        this.node[0].setAttribute('class',(this.node.attr('class')||'')+' mapsvg-region');
        this.style = {fill: this.getComputedStyle('fill')};

        this.style.stroke = this.getComputedStyle('stroke') || '';
        // Make stroke-width always the same:
        // if(!MapSVG.browser.ie)// && !MapSVG.browser.firefox)
        //     this.node.css({'vector-effect' : 'non-scaling-stroke'});
        // else{
            var w;
            if(this.node.data('stroke-width')){
                w = this.node.data('stroke-width');
            }else{
                w = this.getComputedStyle('stroke-width');
                w = w ? w.replace('px','') : '1';
                w = w == "1" ? 1.2 : parseFloat(w);
            }
            this.style['stroke-width'] = w;
            this.node.data('stroke-width', w);
        // }

        var regionOptions  = globalOptions.regions && globalOptions.regions[this.id] ? globalOptions.regions[this.id] : null;

        this.disabled      = this.getDisabledState();
        this.disabled &&   this.attr('class',this.attr('class')+' mapsvg-disabled');

        this.default_attr  = {};
        this.selected_attr = {};
        this.hover_attr    = {};
        this.mapsvg_type   = 'region';
        var selected = false;
        if(regionOptions && regionOptions.selected){
            selected = true;
            delete regionOptions.selected;
        }
        regionOptions &&  this.update(regionOptions);
        this.setFill();
        if(selected)
            this.setSelected(true);
        this.saveState();
    }
    MapSVG.extend(Region, MapObject);

    Region.prototype.saveState = function(){
        this.initialState = JSON.stringify(this.getOptions());
    };
    Region.prototype.changed = function(){
        return JSON.stringify(this.getOptions()) != this.initialState;
    };
    Region.prototype.edit = function(id){
        this.nodeOriginal = this.node.clone();
    };
    Region.prototype.editCommit = function(){
        this.nodeOriginal = null;
    };
    Region.prototype.editCancel = function(){
        // this.node[0].setAttribute('d', )
        this.nodeOriginal.appendTo(_this.mapsvg.getData().$svg);
        this.node = this.nodeOriginal;
        this.nodeOriginal = null;
    };

    Region.prototype.getOptions = function(forTemplate){
        var globals = this.globalOptions.regions[this.id];
        var o = {
            id: this.id,
            id_no_spaces: this.id_no_spaces,
            title: this.title,
            disabled: this.disabled === this.getDisabledState(true) ? undefined : this.disabled,
            fill: this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill,
            tooltip: this.tooltip,
            popover: this.popover,
            href: this.href,
            target: this.target,
            data: this.data,
            gaugeValue: this.gaugeValue
        };
        if(forTemplate){
            o.disabled  = this.disabled;
            o.dataCounter = (this.data && this.data.length) || 0;
        }
        $.each(o,function(key,val){
            if(val == undefined){
                delete o[key];
            }
        });
        if(this.customAttrs){
            var that = this;
            this.customAttrs.forEach(function(attr){
                o[attr] = that[attr];
            });
        }
        return o;
    };
    Region.prototype.forTemplate = function(){
        var data = {
            id: this.id,
            title: this.title,
            objects: this.objects,
            data: this.data
        };
        for(var key in this.data){
            if(key!='title' && key!='id')
                data[key] = this.data[key];
        }

        return data;
    };

    Region.prototype.update = function(options){
        for(var key in options){
            // check if there's a setter for a property
            var setter = 'set'+MapSVG.ucfirst(key);
            if (setter in this)
                this[setter](options[key]);
            else{
                this[key] = options[key];
                this.customAttrs = this.customAttrs || [];
                this.customAttrs.push(key);
            }
        }
    };
    Region.prototype.setId = function(id){
        this.id = id;
        this.node.prop('id', id);
    };
    Region.prototype.setTitle = function(title){
        this.title = title;
    };
    Region.prototype.setStyle = function(style){
        $.extend(true, this.style, style);
        this.setFill();
    };
    Region.prototype.getChoroplethColor = function(){
        var o = this.globalOptions.gauge;
        var w = (parseFloat(this.data[this.globalOptions.regionChoroplethField]) - o.min) / o.maxAdjusted;

        return {
            r: Math.round(o.colors.diffRGB.r * w + o.colors.lowRGB.r),
            g: Math.round(o.colors.diffRGB.g * w + o.colors.lowRGB.g),
            b: Math.round(o.colors.diffRGB.b * w + o.colors.lowRGB.b),
            a: Math.round(o.colors.diffRGB.a * w + o.colors.lowRGB.a)
        };
    };

    Region.prototype.setFill = function(fill){

        var _this = this;


        if(this.globalOptions.colorsIgnore){
            this.node.css(this.style);
            return;
        }

        if(fill){
            var regions = {};
            regions[this.id] = {fill: fill};
            $.extend(true, this.globalOptions, {regions: regions});
        }else if(!fill && fill!==undefined && this.globalOptions.regions && this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill){
            delete this.globalOptions.regions[this.id].fill;
        }


        // Priority: gauge > options.fill > disabled > base > svg
        if(this.globalOptions.gauge.on && this.gaugeValue){
            var o = this.globalOptions.gauge;
            var w = (this.gaugeValue - o.min) / o.maxAdjusted;

            var rgb = {
                r: Math.round(o.colors.diffRGB.r * w + o.colors.lowRGB.r),
                g: Math.round(o.colors.diffRGB.g * w + o.colors.lowRGB.g),
                b: Math.round(o.colors.diffRGB.b * w + o.colors.lowRGB.b),
                a: Math.round(o.colors.diffRGB.a * w + o.colors.lowRGB.a)
            };
            this.default_attr['fill'] = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a+')';
        }else if(this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill) {
            this.default_attr['fill'] = this.globalOptions.regions[this.id].fill;
        }else if(this.disabled && this.globalOptions.colors.disabled){
            this.default_attr['fill'] = this.globalOptions.colors.disabled;
        }else if(this.globalOptions.colors.base){
            this.default_attr['fill'] = this.globalOptions.colors.base;

        }else if(this.style.fill!='none'){
            this.default_attr['fill'] = this.style.fill ? this.style.fill : this.globalOptions.colors.baseDefault;

        }else{
            this.default_attr['fill'] = 'none';
        }


        if(MapSVG.isNumber(this.globalOptions.colors.selected))
            this.selected_attr['fill'] = MapSVG.tinycolor(this.default_attr.fill).lighten(parseFloat(this.globalOptions.colors.selected)).toRgbString();
        else
            this.selected_attr['fill'] = this.globalOptions.colors.selected;

        if(MapSVG.isNumber(this.globalOptions.colors.hover))
            this.hover_attr['fill'] = MapSVG.tinycolor(this.default_attr.fill).lighten(parseFloat(this.globalOptions.colors.hover)).toRgbString();
        else
            this.hover_attr['fill'] = this.globalOptions.colors.hover;


        this.node.css('fill',this.default_attr['fill']);
        this.fill = this.default_attr['fill'];

        if(this.style.stroke!='none' && this.globalOptions.colors.stroke != undefined){
            this.node.css('stroke',this.globalOptions.colors.stroke);
        }else{
            var s = this.style.stroke == undefined ? '' : this.style.stroke;
            this.node.css('stroke', s);
        }

        if(this.selected)
            this.select();

    };
    Region.prototype.setDisabled = function(on, skipSetFill){
        on = on !== undefined ? MapSVG.parseBoolean(on) : this.getDisabledState(); // get default disabled state if undefined
        var prevDisabled = this.disabled;
        this.disabled = on;
        on ? this.attr('class',this.attr('class')+' mapsvg-disabled') : this.attr('class',this.attr('class').replace(' mapsvg-disabled',''));
        if(this.disabled != prevDisabled)
            this.mapsvg.deselectRegion(this);
        !skipSetFill && this.setFill();
    };
    Region.prototype.setStatus = function(status){
        var statusOptions;
        if(statusOptions = this.globalOptions.regionStatuses && this.globalOptions.regionStatuses[status]){
            this.status = status;
            this.data.status = status;
            this.setDisabled(statusOptions.disabled, true);
        }else{
            this.status = undefined;
            this.data.status = undefined;
            this.setDisabled(false, true);
        }
        this.setFill();
    };
    Region.prototype.setSelected = function(on){
        //this.selected = MapSVG.parseBoolean(on);
        this.mapsvg.selectRegion(this);
    };
    Region.prototype.setGaugeValue = function(val){
        this.gaugeValue = $.isNumeric(val) ? parseFloat(val) : undefined;
    };
    Region.prototype.getDisabledState = function(asDefault){
        var opts = this.globalOptions.regions[this.id];
        if(!asDefault && opts && opts.disabled !== undefined){
            return opts.disabled;
        }else if(
            this.globalOptions.disableAll || this.style.fill == 'none' || this.id == 'labels' || this.id == 'Labels'
        ){
            return true;
        }else{
            return false;
        }
    };
    Region.prototype.highlight = function(){
        this.node.css({'fill' : this.hover_attr.fill});
    };
    Region.prototype.unhighlight = function(){
        this.node.css({'fill' : this.default_attr.fill});
    };
    Region.prototype.select = function(){
        this.node.css({'fill' : this.selected_attr.fill});
        this.selected = true;
    };
    Region.prototype.deselect = function(){
        this.node.css({'fill' : this.default_attr.fill});
        this.selected = false;
    };

    //
    // MARKER
    //
    function Marker(options, scale, mapsvg){

        if(!options.id || !options.src) return false;

        var img = $('<img id="'+options.id+'" src="'+options.src+'"/>').css({
            width: options.width+'px',
            height: options.height+'px'
            // ,
            // left: -options.width/2+'px',
            // 'margin-top': -options.height+'px'
        }).addClass('mapsvg-marker');

        MapObject.call(this, img);

        this.mapsvg = mapsvg;

        this.src = options.src;
        this.setId(options.id);
        this.mapsvg_type = 'marker';
        this.x = parseFloat(options.x);
        this.y = parseFloat( options.y);
        this.xy = [this.x,this.y];
        this.width = parseFloat( options.width);
        this.height = parseFloat( options.height);
        this.tooltip =  options.tooltip;
        this.popover =  options.popover;
        this.href =  options.href;
        this.target =  options.target;
        this.default = {x: this.x, y:this.y, width:this.width, height: this.height};
        this.geoCoords = options.geoCoords;
        this.attached = options.attached == undefined ? true : MapSVG.parseBoolean(options.attached);
        this.isLink = options.isLink == undefined ? false : MapSVG.parseBoolean(options.isLink);
        this.urlField = options.urlField;
        this.dataId = options.dataId == undefined ? null : parseInt(options.dataId);

        this.adjustPosition();

        // this.data = options.data;
    }
    MapSVG.extend(Marker, MapObject);

    Marker.prototype.getOptions = function(){
        var o = {
            id: this.id,
            attached: this.attached,
            isLink: this.isLink,
            urlField: this.urlField,
            dataId: this.dataId,
            tooltip: this.tooltip,
            popover: this.popover,
            href: this.href,
            target: this.target,
            data: this.data,
            src: this.src,
            width: this.default.width,
            height: this.default.height,
            x: this.x,
            y: this.y,
            geoCoords: this.geoCoords
        };
        $.each(o,function(key,val){
            if(val == undefined){
                delete o[key];
            }
        });
        return o;
    };

    Marker.prototype.update = function(data, mapScale){
        for(var key in data){
            // check if there's a setter for a property
            var setter = 'set'+MapSVG.ucfirst(key);
            if (setter in this)
                this[setter](data[key],mapScale);
        }
    };
    Marker.prototype.setSrc = function(src, mapScale){
        if(!src)
            return false;
        src = MapSVG.safeURL(src);
        mapScale = mapScale || this.mapScale;
        var img  = new Image();
        var marker = this;
        this.src = src;
        img.onload = function(){
            marker.default.width = this.width;
            marker.default.height = this.height;
            marker.attr({x: marker.x, y: marker.y, width: this.width, height: this.height});
            marker.width = this.width;
            marker.height = this.height;
            marker.node[0].setAttribute('src', src);
            marker.adjustPosition(mapScale);
        };
        img.src  = src;
    };

    Marker.prototype.setXy = function(xy){
        this.x = xy[0];
        this.y = xy[1];
        this.xy = [this.x, this.y];
        // this.node[0].setAttribute('x',  this.x);
        // this.node[0].setAttribute('y',  this.y);
        // this.adjustPosition(this.mapScale);
        // this.node.css({
        //     left:xy[0],
        //     bottom: xy[1]
        // });
        if(this.mapsvg.getData().mapIsGeo)
            this.geoCoords = this.mapsvg.convertSVGToGeo(xy[0], xy[1]);

        this.adjustPosition();
        if(this.onChange)
            this.onChange.call(this);
    };
    Marker.prototype.moveToClick = function(xy){

        var _data = this.mapsvg.getData();
        var markerOptions = {};

        xy[0] = xy[0] + _data.viewBox[0];
        xy[1] = xy[1] + _data.viewBox[1];


        if(_data.mapIsGeo)
            this.geoCoords = this.mapsvg.convertSVGToGeo(xy[0], xy[1]);

        markerOptions.xy = xy;
        this.update(markerOptions);
    };

    Marker.prototype.adjustPosition = function(mapScale){
        // var w = this.default.cx !== undefined ? this.default.cx : this.default.width/2;
        // var h = this.default.cy !== undefined ? this.default.cy : this.default.height;
        // var dx = w - w/mapScale;
        // var dy = h - h/mapScale;
        // this.attr('width',this.default.width/(mapScale));
        // this.attr('height',this.default.height/(mapScale));
        // this.attr('transform','translate('+dx+','+dy+')');
        // this.mapScale = mapScale;
        var _this = this;
        var pos = _this.mapsvg.convertSVGToPixel([this.x, this.y]);

        // pos[0] = pos[0] - (_data.layers.popovers.offset().left - _data.$map.offset().left);
        // pos[1] = pos[1] - (_data.layers.popovers.offset().top - _data.$map.offset().top);

        this.node.css({
            'transform': 'translate(-50%,-100%) translate('+pos[0]+'px,'+pos[1]+'px)'
        });

    };
    Marker.prototype.setGeoCoords = function(coords){
        if(typeof coords == "string"){
            coords = coords.trim().split(',');
            coords = [parseFloat(coords[0]),parseFloat(coords[1])];
        }
        if(typeof coords == 'object' && coords.length==2){
            if($.isNumeric(coords[0]) && $.isNumeric(coords[1])){
                var xy = this.mapsvg.convertGeoToSVG(coords);
                this.setXy(xy);
            }
        }
    };
    // GET MARKER COORDINATES TRANSLATED TO 1:1 SCALE (used when saving new added markers)
    Marker.getDefaultCoords = function(markerX, markerY, markerWidth, markerHeight, mapScale){
        markerX       = parseFloat(markerX);
        markerY       = parseFloat(markerY);
        markerWidth   = parseFloat(markerWidth);
        markerHeight  = parseFloat(markerHeight);
        // markerX       = markerX + markerWidth/(2*mapScale) - markerWidth/2;
        // markerY       = markerY + markerHeight/mapScale - markerHeight;


        return [markerX, markerY];
    };
    Marker.prototype.drag = function(startCoords, scale, endCallback, clickCallback){
        var _this = this;
        this.ox = this.x;
        this.oy = this.y;

        $('body').on('mousemove.drag.mapsvg',function(e){
            e.preventDefault();
            _this.mapsvg.getData().$map.addClass('no-transitions');
            //$('body').css('cursor','move');
            var mouseNew = MapSVG.mouseCoords(e);
            var dx = mouseNew.x - startCoords.x;
            var dy = mouseNew.y - startCoords.y;
            _this.setXy([_this.ox + dx/scale, _this.oy + dy/scale])
            // _this.x = ;
            // _this.y = ;

            // _this.attr({x:_this.x, y:_this.y});
            //_this.attr('transform','translate('+dx/scale+','+dy/scale+')');
        });
        $('body').on('mouseup.drag.mapsvg',function(e){
            e.preventDefault();
            _this.undrag();
            var mouseNew = MapSVG.mouseCoords(e);
            var dx = mouseNew.x - startCoords.x;
            var dy = mouseNew.y - startCoords.y;
            _this.setXy([_this.ox + dx/scale, _this.oy + dy/scale])

            // _this.x = _this.ox + dx/scale;
            // _this.y = _this.oy + dy/scale;
            // _this.attr({x:_this.x, y:_this.y});
            endCallback.call(_this);
            if(_this.ox == _this.x && _this.oy == _this.y)
                clickCallback.call(_this);
        });
    };
    Marker.prototype.undrag = function(){
        //this.node.closest('svg').css('pointer-events','auto');
        //$('body').css('cursor','default');
        $('body').off('.drag.mapsvg');
        this.mapsvg.getData().$map.removeClass('no-transitions');
    };
    Marker.prototype.delete = function(){
        if(this.href)
            this.node.parent('a').empty().remove();
        this.mapsvg.getData().$map.find('#'+this.id).empty().remove();
    };
    Marker.prototype.setObject = function(obj){
        this.object = obj;
        this.databaseObject  = obj;
        this.objects = [obj];
    };

    MapSVG.MapObject = MapObject;
    MapSVG.Region = Region;
    MapSVG.Marker = Marker;

    // Get plugin's path
    var scripts       = document.getElementsByTagName('script');
    var myScript      = scripts[scripts.length - 1].src.split('/');
    myScript.pop();
    var pluginJSURL   =  myScript.join('/')+'/';
    myScript.pop();
    var pluginRootURL =  myScript.join('/')+'/';




    var instances = {};
    var globalID  = 0;

    // Default options
    var defaults = {
        markerLastID        : 0,
        googleMaps          : {on: false},
        events              : {},
        regionLastID        : 0,
        dataLastID          : 1,
        disableAll          : false,
        width               : null,
        height              : null,
        lockAspectRatio     : true,
        padding             : {top: 0, left: 0, right: 0, bottom: 0},
        maxWidth            : null,
        maxHeight           : null,
        minWidth            : null,
        minHeight           : null,
        loadingText         : 'Loading map...',
        //colors              : {base: "#E1F1F1", background: "#eeeeee", hover: "#548eac", selected: "#065A85", stroke: "#7eadc0"},
        colorsIgnore              : false,
        colors              : {baseDefault: "#000000",
                               background: "#eeeeee",
                               selected: 40,
                               hover: 20,
                               directory: '#fafafa',
                               status: {}},
        regions             : {},
        markers             : [],
        //markerGroups        : {}, // {group_id: [marker_id, marker_id2], group_id2: [...]}
        //regionGroups        : {},
        viewBox             : [],
        cursor              : 'default',
        onClick             : null,
        mouseOver           : null,
        mouseOut            : null,
        menuOnClick         : null,
        beforeLoad          : null,
        afterLoad           : null,
        zoom                : {on: false, limit: [0,10], delta: 2, buttons: {on: true, location: 'right'}, mousewheel: true},
        scroll              : {on: false, limit: false, background: false, spacebar: false},
        responsive          : true,
        tooltips            : {mode: 'off', on: false, priority: 'local', position: 'bottom-right'},
        popovers            : {mode: "off", on: false, priority: 'local', position: 'top', centerOn: true, width: 300, maxWidth: 50, maxHeight: 50, resetViewboxOnClose: true, mobileFullscreen: true},
        multiSelect         : false,
        regionStatuses      : {
            '1': {"label": "Enabled", "value": '1', "color": "", "disabled": false},
            '0': {"label": "Disabled", "value": '0', "color": "", "disabled": true}
        },
        events              : {
            'afterLoad' : null,
            'beforeLoad' : null,
            'databaseLoaded' : null,
            'click.region' : null,
            'mouseover.region' : null,
            'mouseout.region' : null,
            'click.marker' : null,
            'mouseover.marker' : null,
            'mouseout.marker' : null,
            'click.directoryItem' : null,
            'mouseover.directoryItem' : null,
            'mouseout.directoryItem' : null,
            'shown.popover' : null,
            'shown.detailsView' : null,
            'closed.popover' : null,
            'closed.detailsView' : null
        },
        templates           : {
            popoverRegion: '',
            popoverMarker: '',
            tooltipRegion: '',
            tooltipMarker: '',
            directoryItem: '',
            detailsView: '',
            detailsViewRegion: ''

        },
        gauge               : {on: false, labels: {low: "low", high: "high"}, colors: {lowRGB: null, highRGB: null, low: "#550000", high: "#ee0000"}, min: 0, max: 0},
        filters: {on: false},
        menu                : {
            on: false,
            search: false,
            customContainer: false,
            containerId: '',
            searchPlaceholder: "Search...",
            searchFallback: false,
            source: 'database',
            width: '200px',
            position: 'left',
            sortBy: 'id',
            sortDirection: 'desc',
            clickActions: {
                region: 'default',
                marker: 'default',
                directoryItem: {
                    triggerClick: true,
                    showPopover: false,
                    showDetails: true
                }
            },
            detailsViewLocation: 'overDirectory',
            noResultsText: 'No results found'
        },
        database: {
            pagination: {
                on: true,
                perpage: 30,
                next: "Next",
                prev: "Prev."
            },
            table: ''
        },
        actions: {
            region: {
                click: {
                    showDetails: false,
                    showDetailsFor: 'region',
                    filterDirectory: false,
                    loadObjects: false,
                    showPopover: false,
                    showPopoverFor: 'region',
                    goToLink: false
                }
            },
            marker: {
                click: {
                    showDetails: false,
                    showPopover: false,
                    goToLink: false
                }
            },
            directoryItem: {
                click: {
                    showDetails: true,
                    showPopover: false,
                    goToLink: false,
                    selectRegion: true,
                    fireRegionOnClick: true
                }
            }
        },
        detailsView : {
            location: 'top', // top || slide || custom
            containerId: '',
            width: '100%'
        },
        mobileView: {
            labelMap: 'Map',
            labelList: 'List'
        },
        googleMaps: {
            on: false,
            apiKey: '',
            loaded: false,
            center: 'auto', // or {lat: 12, lon: 13}
            type: 'roadmap',
            minZoom: 1
        },
        groups: [],
        floors: [],
        layersControl: {
            on: false,
            position: 'top-left',
            label: 'Show on map',
            expanded: true,
            maxHeight: '100%'
        },
        floorsControl: {
            on: false,
            position: 'top-left',
            label: 'Floors',
            expanded: false,
            maxHeight: '100%'
        },
        svgFileVersion: 1,
        menu                : {on: false, containerId: "mapsvg-menu-regions", template: function(region){
    return '<li><a href="#' + region.id + '">' + (region.title||region.id) + '</a></li>'
}},
        menuMarkers         : {on: false, containerId: "mapsvg-menu-markers", template: function(marker){
        return '<li><a href="#' + marker.id + '">' + marker.id + '</a></li>'
    }}
    };

    // Default marker style
    var markerOptions = {'src': pluginRootURL+'markers/pin1_red.png'};


    /** Main Class **/
    mapSVG = function(elem, options){

        var _data;

        this.methods = {
            prototypes : {'MapObject': MapObject, 'Region': Region, 'Marker': Marker},
            setMarkersClickAsLink: function(){
                this.database.loadSchema().done(function(schema){
                    if(schema){
                        schema.forEach(function(field){
                            if(field.type == 'marker'){
                                _data.markerIsLink = MapSVG.parseBoolean(field.isLink);
                                _data.markerUrlField = field.urlField;
                            }
                        });
                    }
                });
            },
            setGroups: function(){
                _data.groups = _data.options.groups;
                _data.groups.forEach(function(g){
                    g.objects.forEach(function(obj){
                        _data.$svg.find('#'+obj.value).toggle(g.visible);
                    });
                });
            },
            setLayersControl : function(options){
                if(options)
                    $.extend(true, _data.options.layersControl, options);
                if(_data.options.layersControl.on){
                    if(!_data.$layersControl){
                        _data.$layersControl = $('<div class="mapsvg-layers-control"></div>');
                        _data.$layersControlLabel = $('<div class="mapsvg-layers-label"></div>').appendTo(_data.$layersControl);
                        _data.$layersControlListWrap = $('<div class="mapsvg-layers-list-wrap"></div>').appendTo(_data.$layersControl);
                        _data.$layersControlListNano = $('<div class="nano"></div>').appendTo(_data.$layersControlListWrap);
                        _data.$layersControlList = $('<div class="mapsvg-layers-list nano-content"></div>').appendTo(_data.$layersControlListNano);
                        _data.$layersControl.appendTo(_data.$map);
                    }
                    _data.$layersControlLabel.html(_data.options.layersControl.label);
                    _data.$layersControlList.empty();
                    _data.$layersControl.removeClass('mapsvg-top-left mapsvg-top-right mapsvg-bottom-left mapsvg-bottom-right')
                    _data.$layersControl.addClass('mapsvg-'+_data.options.layersControl.position);
                    // if(!_data.options.layersControl.expanded && !_data.$layersControl.hasClass('closed')){
                    //     _data.$layersControl.addClass('closed')
                    // }
                    _data.$layersControl.css({'max-height': _data.options.layersControl.maxHeight});

                    _data.options.groups.forEach(function(g){
                        var item = $('<div class="mapsvg-layers-item" data-group-id="'+g.id+'">' +
                            '<input type="checkbox" class="ios8-switch ios8-switch-sm" '+(g.visible?'checked':'')+' />' +
                            '<label>'+g.title+'</label> ' +
                            '</div>').appendTo(_data.$layersControlList);
                    });
                    _data.$layersControlListNano.nanoScroller({preventPageScrolling: true});
                    _data.$layersControl.off();
                    _data.$layersControl.on('click','.mapsvg-layers-item', function() {
                        var id = $(this).data('group-id');
                        var input = $(this).find('input');
                        input.prop('checked', !input.prop('checked'));
                        _data.options.groups.forEach(function(g){
                           if(g.id == id) g.visible = !g.visible;
                        });
                        _this.setGroups();
                    });
                    _data.$layersControlLabel.on('click',function(){
                        _data.$layersControl.toggleClass('closed');
                    });

                    _data.$layersControl.toggleClass('closed',!_data.options.layersControl.expanded);

                }else{
                    _data.$layersControl && _data.$layersControl.hide();
                }

            },
            setFloorsControl : function(options){
                if(options)
                    $.extend(true, _data.options.floorsControl, options);
                if(_data.options.floorsControl.on){
                    if(!_data.$floorsControl){
                        _data.$floorsControl = $('<div class="mapsvg-floors-control"></div>');
                        _data.$floorsControlLabel = $('<div class="mapsvg-floors-label"></div>').appendTo(_data.$floorsControl);
                        _data.$floorsControlListWrap = $('<div class="mapsvg-floors-list-wrap"></div>').appendTo(_data.$floorsControl);
                        _data.$floorsControlListNano = $('<div class="nano"></div>').appendTo(_data.$floorsControlListWrap);
                        _data.$floorsControlList = $('<div class="mapsvg-floors-list nano-content"></div>').appendTo(_data.$floorsControlListNano);
                        _data.$floorsControl.appendTo(_data.$map);
                    }
                    _data.$floorsControlLabel.html(_data.options.floorsControl.label);
                    _data.$floorsControlList.empty();
                    _data.$floorsControl.removeClass('mapsvg-top-left mapsvg-top-right mapsvg-bottom-left mapsvg-bottom-right')
                    _data.$floorsControl.addClass('mapsvg-'+_data.options.floorsControl.position);
                    // if(!_data.options.floorsControl.expanded && !_data.$floorsControl.hasClass('closed')){
                    //     _data.$floorsControl.addClass('closed')
                    // }
                    _data.$floorsControl.css({'max-height': _data.options.floorsControl.maxHeight});

                    _data.options.floors.forEach(function(f){
                        var item = $('<div class="mapsvg-floors-item" data-floor-id="'+f.object_id+'">' +
                            '<label>'+f.title+'</label> ' +
                            '</div>').appendTo(_data.$floorsControlList);
                    });
                    _data.$floorsControlListNano.nanoScroller({preventPageScrolling: true});
                    _data.$floorsControl.off();
                    _data.$floorsControl.on('click','.mapsvg-floors-item', function() {
                        var id = $(this).data('floor-id');
                        _this.setFloor(id);
                    });
                    _data.$floorsControlLabel.on('click',function(){
                        _data.$floorsControl.toggleClass('closed');
                    });

                    _data.$floorsControl.toggleClass('closed',!_data.options.floorsControl.expanded);

                }else{
                    _data.$floorsControl && _data.$floorsControl.hide();
                }

            },
            setFloor: function(id){
                _data.$floorsControl.find('.mapsvg-floors-item').toggleClass('active',false);
                _data.$floorsControl.find('[data-floor-id="'+id+'"]').toggleClass('active',true);
                _data.options.floors.forEach(function(floor){
                   _data.$svg.find('#'+floor.object_id).hide();
                });
                var floor = _data.$svg.find('#'+id);
                floor.show();
                floor = new MapObject(floor, _this);
                var bbox = floor.getBBox();
                _data._viewBox = bbox;
                _this.setViewBox(_data._viewBox);
                _data.zoomLevels = null;
                _data.zoomLevel = 1;
                _this.setZoom();
                floor = null;
            },
            getGroupSelectOptions: function(){
                var id;
                var optionGroups = [];
                var options = [];
                var options2 = [];

                _data.$svg.find('g').each(function(index){
                    if(id = $(this)[0].getAttribute('id')){
                        // _data.groups.push(id);
                        options.push({label: id, value: id});
                    }
                });
                optionGroups.push({title: "SVG Layers / Groups", options: options});

                _data.$svg.find('path,ellipse,circle,polyline,polygon,rectangle,img,text').each(function(index){
                    if(id = $(this)[0].getAttribute('id')){
                        // _data.groups.push(id);
                        options2.push({label: id, value: id});
                    }
                });
                optionGroups.push({title: "Other SVG objects", options: options2});


                return optionGroups;
            },
            loadDataObjects: function(params){
                var _this = this;
                return _this.database.getAll(params);
            },
            loadDirectory: function(){
                var _this = this;
                if(!_data.editMode){
                    if(_data.options.menu.on){
                        _data.controllers.directory.loadItemsToDirectory();
                        // _data.controllers.directory.toggle(true);
                    }
                    if( _data.options.database.pagination.on){
                        var pager = _this.getPagination();
                        if(_data.options.menu.on){
                            _data.controllers.directory.addPagination(pager);
                        }else{
                            _data.$map.append(pager);
                        }
                    }
                }
            },
            getPagination : function(callback){

                _data.pager && (_data.pager.empty().remove());
                _data.pager = $('<nav class="mapsvg-pagination"><ul class="pager"><!--<li class="mapsvg-first"><a href="#">First</a></li>--><li class="mapsvg-prev"><a href="#">&larr; Prev. '+_data.options.database.pagination.perpage+'</a></li><li class="mapsvg-next"><a href="#">Next '+_data.options.database.pagination.perpage+' &rarr;</a></li><!--<li class="mapsvg-last"><a href="#">Last</a></li>--></ul></nav>');

                if(_this.database.onFirstPage() && _this.database.onLastPage()){
                    _data.pager.hide();
                }else{
                    _data.pager.find('.mapsvg-prev').removeClass('disabled');
                    _data.pager.find('.mapsvg-first').removeClass('disabled');
                    _data.pager.find('.mapsvg-last').removeClass('disabled');
                    _data.pager.find('.mapsvg-next').removeClass('disabled');

                    _this.database.onLastPage() &&
                    (_data.pager.find('.mapsvg-next').addClass('disabled') && _data.pager.find('.mapsvg-last').addClass('disabled'));

                    _this.database.onFirstPage() &&
                    (_data.pager.find('.mapsvg-prev').addClass('disabled') && _data.pager.find('.mapsvg-first').addClass('disabled'));
                }

                _data.pager.on('click','.mapsvg-next:not(.disabled)',function(e){
                    e.preventDefault();
                    if(_this.database.onLastPage())
                        return;
                    _this.database.getAll({page: _this.database.page+1}).done(function(){
                        callback && callback();
                    });
                }).on('click','.mapsvg-prev:not(.disabled)',function(e){
                    e.preventDefault();
                    if(_this.database.onFirstPage())
                        return;
                    _this.database.getAll({page: _this.database.page-1}).done(function(){
                        callback && callback();
                    });
                }).on('click','.mapsvg-first:not(.disabled)',function(e){
                    e.preventDefault();
                    if(_this.database.onFirstPage())
                        return;
                    _this.database.getAll({page: 1}).done(function(){
                        callback && callback();
                    });
                }).on('click','.mapsvg-last:not(.disabled)',function(e){
                    e.preventDefault();
                    if(_this.database.onLastPage())
                        return;
                    _this.database.getAll({lastpage: true}).done(function(){
                        callback && callback();
                    });
                });

                return _data.pager;
            },
            deleteMarkers: function(){
                while(_data.markers.length){
                    _this.markerDelete(_data.markers[0]);
                }
            },
            addDataObjectsAsMarkers: function(){

                var data  = this.database.getLoaded();
                var _this = this;

                _this.deleteMarkers();

                data && data.forEach(function(obj){
                    if(obj.marker && !(obj instanceof Marker)){
                        obj.marker.id = 'marker_'+obj.id;
                        obj.marker.attached = true;
                        var marker = _this.markerAdd(obj.marker);
                        marker && marker.setObject(obj);
                    }
                });

            },
            getCssUrl: function(){
                return MapSVG.urls.root+'css/mapsvg.css';
            },
            isGeo: function(){
                return _data.mapIsGeo;
            },
            functionFromString: function(string){
                var func;
                var error = false;
                var fn = string.trim();
                if(fn.indexOf("{")==-1 || fn.indexOf("function")!==0 || fn.indexOf("(")==-1){
                    return {error: "MapSVG user function error: no function body."};
                }
                var fnBody = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"));
                var params = fn.substring(fn.indexOf("(") + 1, fn.indexOf(")"));
                try{
                    func = new Function(params,fnBody);
                }catch(err){
                    error = err;
                }

                if (!error)
                    return func;
                else
                    return error;//{error: {line: error.line, text: "MapSVG user function error: (line "+error.line+"): "+error.message}};
            },
            getOptions: function(forTemplate, forWeb, optionsDelta){
                optionsDelta = optionsDelta || {};
                var options = $.extend(true, {}, _data.options);
                // for(var key in optionsDelta){
                //     options[key] = optionsDelta[key];
                // }
                $.extend(true, options, optionsDelta);

                options.viewBox = _data._viewBox;

                delete options.markers;
                //var region = {id: "", title: "", disabled: false, selected: false,
                if (forTemplate){
                    options.regions = [];
                    _data.regions.forEach(function(r){
                        options.regions.push(r.getOptions(forTemplate));
                    });
                    options.markers = _data.options.markers;
                }else{
                    _data.regions.forEach(function(r){
                        r.changed() && (options.regions[r.id] = r.getOptions());
                    });
                    if(_data.markers.length > 0)
                        options.markers = [];
                    _data.markers.forEach(function(m){
                        options.markers.push(m.getOptions());
                    });
                }


                if(forWeb)
                    $.each(options,function(key,val){
                        if(JSON.stringify(val)==JSON.stringify(defaults[key]))
                            delete options[key];
                    });
                return options;
            },
            // SETTERS
            on : function(event, callback) {
                this.lastChangeTime = Date.now();
                if (!_data.events[event])
                    _data.events[event] = [];
                _data.events[event].push(callback);
            },
            off : function(event, callback) {
                _data.events[event] = [];
            },
            // trigger : function(event){
            //     var _this = this;
            //     if(_data.events[event] && _data.events[event].length)
            //         _data.events[event].forEach(function(callback){
            //             callback && callback.call(_this);
            //         });
            // },
            trigger: function(event){
                _data.eventHandlers && _data.eventHandlers[event] && _data.eventHandlers[event]();
            },

            setEvents: function(functions){
                _data.events = _data.events || {};

                for (var i in functions) {
                    if (typeof functions[i] === 'string') {
                        var func = functions[i] != "" ? this.functionFromString(functions[i]) : null;

                        if (func && !func.error && !(func instanceof TypeError || func instanceof SyntaxError) )
                            _data.events[i] = func;
                        else
                            _data.events[i] = null;
                    } else if(typeof functions[i] === 'function') {
                        _data.events[i] = functions[i];
                    }
                }

                $.extend(true, _data.options.events, functions);
            },
            setActions : function(options){
                $.extend(true, _data.options.actions, options);
            },
            setDetailsView: function(options){
                $.extend(true, _data.options.detailsView, options);
            },
            setMobileView: function(options){
                $.extend(true, _data.options.mobileView, options);
            },
            deleteDataField: function(name){
                _data.options.data.forEach(function(obj){
                    delete obj[name];
                });
            },
            addZeroDataField: function(name){
                _data.options.data.forEach(function(obj){
                    obj[name] = '';
                });
            },
            attachDataToRegions: function(){
                _data.regions.forEach(function(region){
                    region.objects = [];
                });
                _this.database.getLoaded().forEach(function(obj, index){
                    if(obj.regions && obj.regions.length){
                        if(typeof obj.regions == 'object'){
                            obj.regions.forEach(function(region){
                                var r = _this.getRegion(region.id);
                                if(r)
                                    r.objects.push(obj);
                            });
                        }
                    }
                });
            },
            setTemplates: function(templates){
                var _this = this;
                _data.templates = _data.templates || {};
                for (var name in templates){
                    if(name != undefined){
                        _data.options.templates[name] = templates[name];
                        var t = _data.options.templates[name];
                        if(name == 'directoryItem'){
                            t = '{{#each items}}<div id="mapsvg-directory-item-{{id}}" class="mapsvg-directory-item" data-object-id="{{id}}">'+t+'</div>{{/each}}';
                            name = 'directory';
                        }

                        _data.templates[name] = Handlebars.compile(t);
                    }
                }
            },
            setRegionStatus : function(region, status){
                var status = _this.regionsDatabase.getSchemaField('status').optionsDict[status];
                if(status.disabled)
                    region.setDisabled(true);
                else
                    region.setDisabled(false);

                if(status.color)
                    region.setFill(status.color);
                else
                    region.setFill();

            },
            update : function(options){
                for (var key in options){
                    if (key == "regions"){
                        $.each(options.regions,function(id,regionOptions){
                            var region = _this.getRegion(id);
                            region && region.update(regionOptions);
                            if(regionOptions.gaugeValue!=undefined){
                                _this.updateGaugeMinMax();
                                _this.regionsRedrawColors();
                            }
                            if(regionOptions.disabled!=undefined){
                                _this.deselectRegion(region);
                                _data.options.regions[id] = _data.options.regions[id] || {};
                                _data.options.regions[id].disabled = region.disabled;
                            }
                        });
                    }else if (key == "markers"){
                        $.each(options.markers,function(id,markerOptions){
                            var marker = _this.getMarker(id);
                            marker && marker.update(markerOptions);
                        });
                    }else{
                        var setter = 'set'+MapSVG.ucfirst(key);
                        if (_this.hasOwnProperty(setter))
                            this[setter](options[key]);
                        else{
                            _data.options[key] = options[key];
                        }
                    }
                }
            },
            setTitle: function(title){
                title && (_data.options.title = title);
            },
            setExtension: function(extension){
                if(extension){
                    _data.options.extension = extension;
                }else{
                    delete _data.options.extension;
                }
            },
            setDisableLinks: function(on){
                on = MapSVG.parseBoolean(on);
                if(on){
                    _data.$map.on('click.a.mapsvg','a',function(e){
                        e.preventDefault();
                    });
                }else{
                    _data.$map.off('click.a.mapsvg');
                }
                _data.disableLinks = on;
            },
            setLoadingText: function(val){_data.options.loadingText = val},
            setLockAspectRatio: function(val){ _data.options.lockAspectRatio =  MapSVG.parseBoolean(val);},
            setOnClick: function(h){_data.options.onClick = h || undefined;},
            setMouseOver: function(h){_data.options.mouseOver = h || undefined;},
            setMouseOut: function(h){_data.options.mouseOut = h || undefined;},
            setBeforeLoad: function(h){_data.options.beforeLoad = h || undefined;},
            setAfterLoad: function(h){_data.options.afterLoad = h || undefined;},
            setPopoverShown: function(h){_data.options.popoverShown = h || undefined;},
            on: function(event, handler){
                _data.eventHandlers = _data.eventHandlers || {};
                _data.eventHandlers[event] = handler;
            },
            setMarkerEditHandler : function(handler){
                _data.markerEditHandler = handler;
            },
            setRegionChoroplethField : function(field){
                _data.options.regionChoroplethField = field;
                _this.redrawGauge();
            },
            setRegionEditHandler : function(handler){
                _data.regionEditHandler = handler;
            },
            setDisableAll: function(on){
                on = MapSVG.parseBoolean(on);
                $.extend(true, _data.options, {disableAll:on});
                _data.regions.forEach(function(r){
                    r.setDisabled();
                });
            },
            setRegionStatuses : function(_statuses){
                _data.options.regionStatuses = _statuses;
                var colors = {};
                for(var status in _data.options.regionStatuses){
                    colors[status] = _data.options.regionStatuses[status].color.length ? _data.options.regionStatuses[status].color : undefined;
                }
                _this.setColors({status: colors});
            },
            setColorsIgnore : function(val){
                _data.options.colorsIgnore = MapSVG.parseBoolean(val);
                _this.regionsRedrawColors();
            },
            setColors : function(colors){
                $.extend(true, _data.options, {colors:colors});

                if(colors.status)
                    _data.options.colors.status = colors.status;

                //_data.$map.css({'background': _data.options.colors.background});
                //if(colors.stroke)
                //    _data.regions.forEach(function(r){
                //        //if (r.default_attr['stroke'] == _data.options.colors.stroke)
                //        //    r.default_attr['stroke'] = color;
                //        r.node.css('stroke',colors.stroke);
                //    });
                $.each(_data.options.colors,function(key, color){
                    if(color === null || color == "")
                        delete _data.options.colors[key];
                });
                if(colors.background)
                    _data.$map.css({'background': _data.options.colors.background});
                if(colors.hover)
                    _data.options.colors.hover = (colors.hover == ""+parseInt(colors.hover)) ? parseInt(colors.hover) : colors.hover;
                if(colors.selected)
                    _data.options.colors.selected = (colors.selected == ""+parseInt(colors.selected)) ? parseInt(colors.selected) : colors.selected;
                _this.regionsRedrawColors();
            },
            setTooltips : function (options) {

                if(options.on !== undefined)
                    options.on = MapSVG.parseBoolean(options.on);

                $.extend(true, _data.options, {tooltips: options});

                _data.tooltip = _data.tooltip || {posOriginal: {}, posShifted: {}, posShiftedPrev: {}, mirror: {}};
                _data.tooltip.posOriginal    = {};
                _data.tooltip.posShifted     = {};
                _data.tooltip.posShiftedPrev = {};
                _data.tooltip.mirror         = {};


                if(_data.tooltip.container){
                    _data.tooltip.container[0].className = _data.tooltip.container[0].className.replace(/(^|\s)mapsvg-tt-\S+/g, '');
                }else{
                    _data.tooltip.container = $('<div />').addClass('mapsvg-tooltip');
                    _data.$map.append(_data.tooltip.container);
                }


                var ex = _data.options.tooltips.position.split('-');
                if(ex[0].indexOf('top')!=-1 || ex[0].indexOf('bottom')!=-1){
                    _data.tooltip.posOriginal.topbottom = ex[0];
                }
                if(ex[0].indexOf('left')!=-1 || ex[0].indexOf('right')!=-1){
                    _data.tooltip.posOriginal.leftright = ex[0];
                }
                if(ex[1]){
                    _data.tooltip.posOriginal.leftright = ex[1];
                }

                var event = 'mousemove.tooltip.mapsvg-'+_data.$map.attr('id');
                _data.tooltip.container.addClass('mapsvg-tt-'+_data.options.tooltips.position);

                $('body').off(event).on(event, function(e) {

                    MapSVG.mouse = MapSVG.mouseCoords(e);

                    _data.tooltip.container[0].style.left = (e.clientX + $(window).scrollLeft() - _data.$map.offset().left) +'px';
                    _data.tooltip.container[0].style.top  = (e.clientY + $(window).scrollTop()  - _data.$map.offset().top)  +'px';

                    var m = {x: e.clientX + $(window).scrollLeft(), y: e.clientY + $(window).scrollTop()};

                    var tbbox = _data.tooltip.container[0].getBoundingClientRect();
                    var mbbox = _data.$wrap[0].getBoundingClientRect();
                    tbbox = {
                        top: tbbox.top + $(window).scrollTop(),
                        bottom: tbbox.bottom + $(window).scrollTop(),
                        left: tbbox.left + $(window).scrollLeft(),
                        right: tbbox.right + $(window).scrollLeft(),
                        width: tbbox.width,
                        height: tbbox.height
                    };
                    mbbox = {
                        top: mbbox.top + $(window).scrollTop(),
                        bottom: mbbox.bottom + $(window).scrollTop(),
                        left: mbbox.left + $(window).scrollLeft(),
                        right: mbbox.right + $(window).scrollLeft(),
                        width: mbbox.width,
                        height: mbbox.height
                    };

                    if(m.x > mbbox.right || m.y > mbbox.bottom || m.x < mbbox.left || m.y < mbbox.top){
                        return;
                    }

                    if(_data.tooltip.mirror.top || _data.tooltip.mirror.bottom){
                    // may be cancel mirroring
                        if(_data.tooltip.mirror.top && m.y > _data.tooltip.mirror.top){
                            _data.tooltip.mirror.top    = false;
                            delete _data.tooltip.posShifted.topbottom;
                        }else if(_data.tooltip.mirror.bottom && m.y < _data.tooltip.mirror.bottom){
                            _data.tooltip.mirror.bottom = false;
                            delete _data.tooltip.posShifted.topbottom;
                        }
                    }else{
                    // may be need mirroring

                        if(tbbox.bottom < mbbox.top + tbbox.height){
                            _data.tooltip.posShifted.topbottom = 'bottom';
                            _data.tooltip.mirror.top    = m.y;
                        }else if(tbbox.top > mbbox.bottom - tbbox.height){
                            _data.tooltip.posShifted.topbottom = 'top';
                            _data.tooltip.mirror.bottom = m.y;
                        }
                    }

                    if(_data.tooltip.mirror.right || _data.tooltip.mirror.left){
                    // may be cancel mirroring

                        if(_data.tooltip.mirror.left && m.x > _data.tooltip.mirror.left){
                            _data.tooltip.mirror.left  = false;
                            delete _data.tooltip.posShifted.leftright;
                        }else if(_data.tooltip.mirror.right && m.x < _data.tooltip.mirror.right){
                            _data.tooltip.mirror.right = false;
                            delete _data.tooltip.posShifted.leftright;
                        }
                    }else{
                    // may be need mirroring
                        if(tbbox.right < mbbox.left + tbbox.width){
                            _data.tooltip.posShifted.leftright = 'right';
                            _data.tooltip.mirror.left = m.x;
                        }else if(tbbox.left > mbbox.right - tbbox.width){
                            _data.tooltip.posShifted.leftright = 'left';
                            _data.tooltip.mirror.right = m.x;
                        }
                    }

                    var pos  = $.extend({}, _data.tooltip.posOriginal, _data.tooltip.posShifted);
                    var _pos = [];
                    pos.topbottom && _pos.push(pos.topbottom);
                    pos.leftright && _pos.push(pos.leftright);
                    pos = _pos.join('-');

                    if(_data.tooltip.posShifted.topbottom!=_data.tooltip.posOriginal.topbottom  || _data.tooltip.posShifted.leftright!=_data.tooltip.posOriginal.leftright){
                        _data.tooltip.container[0].className = _data.tooltip.container[0].className.replace(/(^|\s)mapsvg-tt-\S+/g, '');
                        _data.tooltip.container.addClass('mapsvg-tt-'+pos);
                        _data.tooltip.posShiftedPrev = pos;
                    }
                });
            },
            setPopovers : function (options){
                if (typeof options.mode == "string" && options.mode.indexOf("function") == 0){
                    options.mode = _this.functionFromString(options.mode);
                }

                $.extend(true, _data.options, {popovers: options});
                _data.options.popovers.on = _data.options.popovers.mode!='off';
                _data.options.popovers.centerOn = MapSVG.parseBoolean(_data.options.popovers.centerOn);

                if(!_data.$popover) {
                    _data.$popover = $('<div />').addClass('mapsvg-popover');
                    // _data.$popover.closeButton = $('<div class="mapsvg-popover-close"></div>');
                    // _data.$popover.contentDiv = $('<div class="mapsvg-popover-content"></div>');
                    // _data.$popover.append(_data.$popover.contentDiv);
                    // _data.$popover.append(_data.$popover.closeButton);
                    _data.layers.popovers.append(_data.$popover);
                }
                _data.$popover.css({
                    width: _data.options.popovers.width + (_data.options.popovers.width == 'auto' ? '' : 'px'),
                    'max-width': _data.options.popovers.maxWidth + '%',
                    'max-height': _data.options.popovers.maxHeight*_data.$wrap.outerHeight()/100+'px'
                });


                // if(_data.options.popovers.centerOn && !_data.popoverResizeSensor){
                //     _data.popoverResizeSensor = new MapSVG.ResizeSensor(_data.$popover[0], function(){
                //         if(_data.options.popovers.centerOn){
                //             _this.centerOn();
                //         }
                //     });
                // }

                if(_data.options.popovers.mobileFullscreen && MapSVG.isPhone){
                    $('body').toggleClass('mapsvg-fullscreen-popovers', true);
                    _data.$popover.appendTo('body');
                }
                // _data.$popover.closeButton.off();
                // _data.$popover.closeButton.on('click touchend', function(e){
                //     _this.hidePopover();
                //     _this.deselectRegion();
                //     if(_data.events['closed.popover']){
                //         _data.events['closed.popover'].call(_data.$popover, _this);
                //     }
                // });
            },
            setRegionPrefix : function(prefix){
                _data.options.regionPrefix = prefix;
            },
            setInitialViewBox : function(v){
                if(typeof v == 'string')
                    v = v.trim().split(' ');
                _data._viewBox = [parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]), parseFloat(v[3])];
                _data.zoomLevel = 0;
            },
            setViewBoxOnStart : function(){
                _data.viewBoxFull = _data.svgDefault.viewBox;
                _data.viewBoxFake = _data.viewBox;
                _data.whRatioFull = _data.viewBoxFull[2] / _data.viewBox[2];
                _data.$svg[0].setAttribute('viewBox',_data.viewBoxFull.join(' '));
                _data.vbstart = 1;
            },
            setViewBox : function(v,skipAdjustments){

                if(typeof v == 'string'){
                    v = v.trim().split(' ');
                }
                var d = (v && v.length==4) ? v : _data.svgDefault.viewBox;
                var isZooming = parseFloat(d[2]) != _data.viewBox[2] || parseFloat(d[3]) != _data.viewBox[3];
                _data.viewBox = [parseFloat(d[0]), parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3])];
                _data.whRatio = _data.viewBox[2] / _data.viewBox[3];

                !_data.vbstart && _this.setViewBoxOnStart();

                if(!v){
                    _data._viewBox = _data.viewBox;
                    _data._scale = 1;
                }

                var p = _data.options.padding;

                if(p.top){
                    _data.viewBox[1] -= p.top;
                    _data.viewBox[3] += p.top;
                }
                if(p.right){
                    _data.viewBox[2] += p.right;
                }
                if(p.bottom){
                    _data.viewBox[3] += p.bottom;
                }
                if(p.left){
                    _data.viewBox[0] -= p.left;
                    _data.viewBox[2] += p.left;
                }

                _data.scale = _this.getScale();
                _data.superScale = _data.whRatioFull*_data.svgDefault.viewBox[2]/_data.viewBox[2];

                _data.scroll = _data.scroll || {};
                _data.scroll.tx = (_data.svgDefault.viewBox[0]-_data.viewBox[0])*_data.scale;
                _data.scroll.ty = (_data.svgDefault.viewBox[1]-_data.viewBox[1])*_data.scale;


                _data.$scrollpane.css({
                    'transform': 'translate('+_data.scroll.tx+'px,'+_data.scroll.ty+'px)'
                });
                _data.$svg.css({
                    'transform': 'scale('+_data.superScale+')'
                });
                if(isZooming && !skipAdjustments){
                    _this.updateSize();
                }

                isZooming && _this.trigger('zoom');

                return true;
            },
            setViewBoxReal : function(bbox){
                _data.viewBoxFull = bbox;
                _data.viewBoxFake = bbox;
                _data.whRatioFull = _data.viewBoxFull[2] / _data.viewBox[2];

                _data.viewBox = bbox;
                _data.svgDefault.viewBox = _data.viewBox;
                _data.viewBoxFull = bbox;
                _data.viewBoxFake = _data.viewBox;
                _data.whRatioFull = _data.viewBoxFull[2] / _data.viewBox[2];
                _data.$svg[0].setAttribute('viewBox',_data.viewBoxFull.join(' '));

                _data.scale   = _this.getScale();

                var tx = (-bbox[0])*_data.scale;
                var ty = (-bbox[1])*_data.scale;
                _data.$layers.css({
                    'transform': 'translate('+tx+'px,'+ty+'px)'
                });
                _data.zoomLevel = 0;
                _this.setViewBox(bbox);
            },
            setViewBoxByGoogleMapBounds : function(){

                var googleMapBounds = _data.googleMaps.map.getBounds();

                var ne = [googleMapBounds.getNorthEast().lat(), googleMapBounds.getNorthEast().lng()];
                var sw = [googleMapBounds.getSouthWest().lat(), googleMapBounds.getSouthWest().lng()];
                var xyNE = _this.convertGeoToSVG(ne);
                var xySW = _this.convertGeoToSVG(sw);

                // check if map on border between 180/-180 longitude
                if(xyNE[0] < xySW[0]){
                    var mapPointsWidth = (_data.svgDefault.viewBox[2] / _data.mapLonDelta) * 360;
                    xySW[0] = -(mapPointsWidth - xySW[0]);
                }

                var width  = xyNE[0] - xySW[0];
                var height = xySW[1] - xyNE[1];
                _this.setViewBox([xySW[0], xyNE[1], width, height]);


            },
            redraw: function(){
                _data.$wrap.css({
                    width: _data.$wrap.width(),
                    height: _data.$wrap.width() / _data.whRatio
                });
                if(!MapSVG.browser.ie) {
                    _data.$wrap.css({
                        width: 'auto',
                        height: 'auto'
                    });
                }else{
                    _data.$wrap.css({
                        width: 'auto'
                    });
                }
                _this.updateSize();
            },
            setPadding: function(options){
                options = options || _data.options.padding;
                for(var i in options){
                    options[i] = options[i] ? parseInt(options[i]) : 0;
                }
                $.extend(_data.options.padding, options);


                // var p = _data.options.padding;
                //
                // var v = $.extend([],_data._viewBox);
                //
                // if(p.top){
                //     v[1] -= p.top;
                //     v[3] += p.top;
                // }
                // if(p.right){
                //     v[2] += p.right;
                // }
                // if(p.bottom){
                //     v[3] += p.bottom;
                // }
                // if(p.left){
                //     v[0] -= p.left;
                //     v[2] += p.left;
                // }
                _this.setViewBox();
                _this.trigger('sizeChange');
            },
            // trigger: function(event){
            //     _data.eventHandlers && _data.eventHandlers[event] && _data.eventHandlers[event]();
            // },
            setSize : function( width, height, responsive ){

                // Convert strings to numbers
                _data.options.width      = parseFloat(width);
                _data.options.height     = parseFloat(height);
                _data.options.responsive = responsive!=null && responsive!=undefined  ? MapSVG.parseBoolean(responsive) : _data.options.responsive;

                // Calculate width and height
                if ((!_data.options.width && !_data.options.height)){
                    _data.options.width	 = _data.svgDefault.width;
                    _data.options.height = _data.svgDefault.height;
                }else if (!_data.options.width && _data.options.height){
                    _data.options.width	 = parseInt(_data.options.height * _data.svgDefault.width / _data.svgDefault.height);
                }else if (_data.options.width && !_data.options.height){
                    _data.options.height = parseInt(_data.options.width * _data.svgDefault.height/_data.svgDefault.width);
                }

                //if(_data.options.responsive){
                //    var maxWidth  = _data.options.width;
                //    var maxHeight = _data.options.height;
                //    _data.options.width	 = _data.svgDefault.width;
                //    _data.options.height = _data.svgDefault.height;
                //}

                _data.whRatio      = _data.options.width / _data.options.height;
                _data.scale        = _this.getScale();

                _this.setResponsive(responsive);

                if(_data.markers)
                    _this.markersAdjustPosition();


                return [_data.options.width, _data.options.height];
            },
            setResponsive : function(on,force){

                on = on!=undefined ? MapSVG.parseBoolean(on) : _data.options.responsive;
                $(window).off('resize.mapsvg');

                _data.$map.css({
                    'width': '100%',
                    // 'height': 'auto'
                    'height': '0',
                    'padding-bottom': (_data.viewBox[3]*100/_data.viewBox[2])+'%'
                });
                if(MapSVG.browser.ie){
                    _data.whRatio2 = _data.svgDefault.viewBox[2] / _data.svgDefault.viewBox[3];
                    _data.$svg.height(_data.$map.outerWidth() / _data.whRatio2);
                }
                if(!_data.resizeSensor){
                    _data.resizeSensor = new MapSVG.ResizeSensor(_data.$map[0], function(){

                        if(MapSVG.browser.ie){
                            _data.whRatio2 = _data.svgDefault.viewBox[2] / _data.svgDefault.viewBox[3];
                            _data.$svg.height(_data.$map.outerWidth() / _data.whRatio2);
                        }

                        if(_data.options.googleMaps.on && _data.googleMaps.map){
                            var center = _data.googleMaps.map.getCenter();
                            google.maps.event.trigger(_data.googleMaps.map, 'resize');
                            _data.googleMaps.map.setCenter(center);
                            _this.setViewBoxByGoogleMapBounds();
                        }else{
                            _this.setViewBox(_data.viewBox);
                        }
                        _data.$popover && _data.$popover.css({
                            'max-height': _data.options.popovers.maxHeight*_data.$wrap.outerHeight()/100+'px'
                        });
                        _this.updateSize();
                    });
                }

                if(on){

                    _data.$wrap.css({
                        'width': '100%',
                        'height': 'auto'
                    });


                }else{
                    _data.$wrap.css({
                        'width': _data.options.width+'px',
                        'height': _data.options.height+'px'
                    });
                }
                $.extend(true, _data.options, {responsive: on});
                _this.setViewBox(_data.viewBox);
                _this.updateSize();

            },
            setScroll : function(options, skipEvents){
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));
                options.limit != undefined && (options.limit = MapSVG.parseBoolean(options.limit));
                $.extend(true, _data.options, {scroll: options});
                !skipEvents && _this.setEventHandlers();
            },
            setZoom : function (options){
                options = options || {};
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));
                options.mousewheel != undefined && (options.mousewheel = MapSVG.parseBoolean(options.mousewheel));

                // delta = 1.2 changed to delta = 2 since introducing Google Maps + smooth zoom
                options.delta = 2;

                // options.delta && (options.delta = parseFloat(options.delta));

                if(options.limit){
                    if(typeof options.limit == 'string')
                        options.limit = options.limit.split(';');
                    options.limit = [parseInt(options.limit[0]),parseInt(options.limit[1])];
                }
                if(!_data.zoomLevels){
                    _data.zoomLevels = {};

                    var _scale = 1;
                    for(var i = 0; i <= 20; i++){
                        _data.zoomLevels[i+''] = {
                            _scale: _scale,
                            viewBox: [0,0,_data._viewBox[2] /_scale, _data._viewBox[3] /_scale]
                        };
                        _scale = _scale * _data.options.zoom.delta;

                    }
                    _scale = 1;
                    for(var i = 0; i >= -20; i--){
                        _data.zoomLevels[i+''] = {
                            _scale: _scale,
                            viewBox: [0,0,_data._viewBox[2] /_scale, _data._viewBox[3] /_scale]
                        };
                        _scale = _scale / _data.options.zoom.delta;

                    }
                }

                $.extend(true, _data.options, {zoom: options});
                //(options.buttons && options.buttons.on) && (options.buttons.on = MapSVG.parseBoolean(options.buttons.on));
                _data.$map.off('mousewheel.mapsvg');


                if(_data.options.zoom.on && _data.options.zoom.mousewheel){
                    // var lastZoomTime = 0;
                    // var zoomTimeDelta = 0;


                    if(MapSVG.browser.firefox){
                        _data.firefoxScroll = { insideIframe: false };

                        _data.$map.on('mouseenter', function() {
                            _data.firefoxScroll.insideIframe = true;
                            _data.firefoxScroll.scrollX = window.scrollX;
                            _data.firefoxScroll.scrollY = window.scrollY;
                        }).on('mouseleave', function() {
                            _data.firefoxScroll.insideIframe = false;
                        });

                        $(document).scroll(function() {
                            if (_data.firefoxScroll.insideIframe)
                                window.scrollTo(_data.firefoxScroll.scrollX, _data.firefoxScroll.scrollY);
                        });
                    }

                    _data.$map.on('mousewheel.mapsvg',function(event, delta, deltaX, deltaY) {
                        if($(event.target).hasClass('mapsvg-popover') || $(event.target).closest('.mapsvg-popover').length)
                            return;
                        // zoomTimeDelta = Date.now() - lastZoomTime;
                        // lastZoomTime = Date.now();
                        event.preventDefault();
                        var d = delta > 0 ? 1 : -1;
                        var m = MapSVG.mouseCoords(event);
                        m.x = m.x - _data.$svg.offset().left;
                        m.y = m.y - _data.$svg.offset().top;

                        var center = _this.convertPixelToSVG([m.x, m.y]);
                        d > 0 ? _this.zoomIn(center) : _this.zoomOut(center);
                        // _this.zoom(d);
                        return false;
                    });
                }
                _this.setZoomButtons();
                _data.canZoom = true;
            },
            setZoomButtons : function(){
                var loc = _data.options.zoom.buttons.location || 'hide';
                if(! _data.zoomButtons){

                    var buttons = $('<div />').addClass('mapsvg-buttons');

                    buttons.zoomIn = $('<div />').addClass('mapsvg-btn-zoom in');
                    var event = MapSVG.touchDevice? 'touchend' : 'click';
                    buttons.zoomIn.on(event,function(e){
                        e.stopPropagation();
                        _this.zoomIn();
                    });

                    buttons.zoomOut = $('<div />').addClass('mapsvg-btn-zoom out');
                    buttons.zoomOut.on(event,function(e){
                        e.stopPropagation();
                        _this.zoomOut();
                    });
                    buttons.append(buttons.zoomIn).append(buttons.zoomOut);
                    _data.zoomButtons = buttons;
                    _data.$map.append(_data.zoomButtons);
                }
                _data.zoomButtons.removeClass('left');
                _data.zoomButtons.removeClass('right');
                loc == 'right' && _data.zoomButtons.addClass('right')
                ||
                loc == 'left' && _data.zoomButtons.addClass('left');

                (_data.options.zoom.on &&  loc!='hide') ? _data.zoomButtons.show() : _data.zoomButtons.hide();
            },
            setCursor : function(type){
                type = type == 'pointer' ? 'pointer' : 'default';
                _data.options.cursor = type;
                if(type == 'pointer')
                    _data.$map.addClass('mapsvg-cursor-pointer');
                else
                    _data.$map.removeClass('mapsvg-cursor-pointer');
            },
            setPreloaderText : function(text){
                _data.options.loadingText = text;
            },
            setMultiSelect : function (on, deselect){
                _data.options.multiSelect = MapSVG.parseBoolean(on);
                if(deselect !== false)
                    _this.deselectAllRegions();
            },
            setGauge : function (options){

                options = options || _data.options.gauge;
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));
                $.extend(true, _data.options, {gauge: options});

                var needsRedraw = false;

                if(!_data.$gauge){
                    _data.$gauge = {};
                    _data.$gauge.gradient = $('<td>&nbsp;</td>').addClass('mapsvg-gauge-gradient');
                    _this.setGaugeGradientCSS();
                    _data.$gauge.container = $('<div />').addClass('mapsvg-gauge').hide();
                    _data.$gauge.table = $('<table />');
                    var tr = $('<tr />');
                    _data.$gauge.labelLow = $('<td>'+_data.options.gauge.labels.low+'</td>');
                    _data.$gauge.labelHigh = $('<td>'+_data.options.gauge.labels.high+'</td>');
                    tr.append(_data.$gauge.labelLow);
                    tr.append(_data.$gauge.gradient);
                    tr.append(_data.$gauge.labelHigh);
                    _data.$gauge.table.append(tr);
                    _data.$gauge.container.append(_data.$gauge.table);
                    _data.$map.append(_data.$gauge.container);
                }

                if (!_data.options.gauge.on && _data.$gauge.container.is(":visible")){
                    _data.$gauge.container.hide();
                    needsRedraw = true;
                }else if(_data.options.gauge.on && !_data.$gauge.container.is(":visible")){
                    _data.$gauge.container.show();
                    needsRedraw = true;
                }

                if(options.colors){
                    _data.options.gauge.colors.lowRGB = MapSVG.tinycolor(_data.options.gauge.colors.low).toRgb();
                    _data.options.gauge.colors.highRGB = MapSVG.tinycolor(_data.options.gauge.colors.high).toRgb();
                    _data.options.gauge.colors.diffRGB = {
                        r: _data.options.gauge.colors.highRGB.r - _data.options.gauge.colors.lowRGB.r,
                        g: _data.options.gauge.colors.highRGB.g - _data.options.gauge.colors.lowRGB.g,
                        b: _data.options.gauge.colors.highRGB.b - _data.options.gauge.colors.lowRGB.b,
                        a: _data.options.gauge.colors.highRGB.a - _data.options.gauge.colors.lowRGB.a
                    };
                    needsRedraw = true;
                    _data.$gauge && _this.setGaugeGradientCSS();
                }

                if(options.labels){
                    _data.$gauge.labelLow.html(_data.options.gauge.labels.low);
                    _data.$gauge.labelHigh.html(_data.options.gauge.labels.high);
                }

                needsRedraw && _this.redrawGauge();
            },
            redrawGauge : function(){
                _this.updateGaugeMinMax();
                _this.regionsRedrawColors();
            },
            updateGaugeMinMax : function(){
                _data.options.gauge.min = 0;
                _data.options.gauge.max = false;
                var values = [];
                _data.regions.forEach(function(r){
                    if(r.gaugeValue!=null && r.gaugeValue!=undefined) values.push(r.gaugeValue);
                });
                if(values.length>0){
                    _data.options.gauge.min = values.length == 1 ? 0 : Math.min.apply(null,values);
                    _data.options.gauge.max = Math.max.apply(null,values);
                    _data.options.gauge.maxAdjusted = _data.options.gauge.max - _data.options.gauge.min;
                }
            },
            setGaugeGradientCSS: function(){
                _data.$gauge.gradient.css({
                    background: _data.options.gauge.colors.low,
                    background: '-moz-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    background: '-webkit-gradient(linear, left top, right top, color-stop(1%,' + _data.options.gauge.colors.low + '), color-stop(100%,' + _data.options.gauge.colors.high + '))',
                    background: '-webkit-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    background: '-o-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100% 100%)',
                    background: '-ms-linear-gradient(left,  ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100% 100%)',
                    background: 'linear-gradient(to right,' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    'filter': 'progid:DXImageTransform.Microsoft.gradient( startColorstr="' + _data.options.gauge.colors.low + '", endColorstr="' + _data.options.gauge.colors.high + '",GradientType=1 )'
                });
            },
            setCss : function(css){
                _data.options.css = css;
            },
            setMenu : function(options){
                options = options || _data.options.menu;
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));
                $.extend(true, _data.options, {menu: options});

                _data.$menu && _data.$menu.off('click.menu.mapsvg');


                if(_data.options.menu.on){
                    var menuContainer = $('#'+_data.options.menu.containerId);

                    if(menuContainer.length){

                        if(!_data.$menu){
                            if(!menuContainer.is('ul')){
                                _data.$menu = $('<ul />').appendTo(menuContainer);
                            }else{
                                _data.$menu = menuContainer;
                            }

                            if(!_data.$menu.hasClass('mapsvg-menu'))
                                _data.$menu.addClass('mapsvg-menu');
                        }

                        if(_data.$menu.children().length===0)
                            // Add links into navigation container
                            _data.regions.forEach(function (region, i) {
                                if(!region.disabled)
                                    _data.$menu.append(_data.options.menu.template(region));
                            });

                        _data.$menu.on('click.menu.mapsvg','a',function(e){
                            e.preventDefault();
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            var center = region.getCenter();
                            //e = {clientX: center[0], clientY: center[1]};
                            e.clientX = center[0];
                            e.clientY = center[1];

                            _this.regionClickHandler(e,region);
                        }).on('mouseover.menu.mapsvg','a',function(e){
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            if (!region.selected)
                                region.highlight();
                        }).on('mouseout.menu.mapsvg','a',function(e){
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            if (!region.selected)
                                region.unhighlight();
                        });

                    }
                }
            },
            setGoogleMaps : function(options){
                var _this = this;

                options    = options || _data.options.googleMaps;
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));

                if(!_data.googleMaps){
                    _data.googleMaps = {loaded: false, initialized: false, map: null};
                }

                $.extend(true, _data.options, {googleMaps: options});

                if(_data.options.googleMaps.on){
                    _data.$map.toggleClass('mapsvg-with-google-map', true);
                    // _this.setResponsive(false);
                    // if(!_data.googleMaps.loaded){
                    if(!MapSVG.googleMapsApiLoaded){
                        _this.loadGoogleMapsAPI(
                            function(){
                            _this.setGoogleMaps();
                            },
                            function(){
                              _this.setGoogleMaps({on:false});
                            }
                            );
                    } else {
                        if(!_data.googleMaps.map){
                            _data.$googleMaps = $('<div class="mapsvg-layer mapsvg-layer-gm" id="mapsvg-google-maps-'+_this.id+'"></div>').prependTo(_data.$map);
                            _data.$googleMaps.css({
                                position: 'absolute',
                                top:0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                'z-index': '0'
                            });
                            _data.googleMaps.map = new google.maps.Map(_data.$googleMaps[0], {
                                mapTypeId: options.type,
                                fullscreenControl: false,
                                keyboardShortcuts: false,
                                mapTypeControl: false,
                                scaleControl: false,
                                scrollwheel: false,
                                streetViewControl: false,
                                zoomControl: false

                            });
                            var overlay;
                            USGSOverlay.prototype = new google.maps.OverlayView();


                            /** @constructor */
                            function USGSOverlay(bounds, map) {
                                // Initialize all properties.
                                this.bounds_ = bounds;
                                this.map_ = map;
                                this.setMap(map);
                            }
                            USGSOverlay.prototype.onAdd = function() {

                                // var div = document.createElement('div');
                                // div.style.borderStyle = 'none';
                                // div.style.borderWidth = '0px';
                                // div.style.position = 'absolute';
                                // div.style.background = 'rgba(255,0,0,.5)';
                                //
                                // this.div_ = div;
                                // Add the element to the "overlayLayer" pane.
                                // var panes = this.getPanes();
                                // panes.overlayLayer.appendChild(div);
                            };

                            USGSOverlay.prototype.draw = function() {
                                var overlayProjection = this.getProjection();
                                var sw  = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
                                var ne  = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
                                var sw2 = overlayProjection.fromLatLngToContainerPixel(this.bounds_.getSouthWest());
                                var ne2 = overlayProjection.fromLatLngToContainerPixel(this.bounds_.getNorthEast());
                                var scale = (ne2.x - sw2.x)/_data.svgDefault.viewBox[2];
                                var vb = [
                                    _data.svgDefault.viewBox[0] - sw2.x/scale,
                                    _data.svgDefault.viewBox[1] - ne2.y/scale,
                                    _data.$map.width()/scale,
                                    _data.$map.outerHeight()/scale
                                ];
                                _this.setViewBox(vb);
                                // var div = this.div_;
                                // div.style.left   = sw.x + 'px';
                                // div.style.top    = ne.y + 'px';
                                // div.style.width  = (ne.x - sw.x) + 'px';
                                // div.style.height = (sw.y - ne.y) + 'px';
                            };

                            var southWest = new google.maps.LatLng(_data.geoViewBox.bottomLat, _data.geoViewBox.leftLon);
                            var northEast = new google.maps.LatLng(_data.geoViewBox.topLat, _data.geoViewBox.rightLon);
                            var bounds = new google.maps.LatLngBounds(southWest,northEast);

                            _data.googleMaps.overlay = new USGSOverlay(bounds, _data.googleMaps.map);

                            if(!_data.options.googleMaps.center || !_data.options.googleMaps.zoom){
                                var southWest = new google.maps.LatLng(_data.geoViewBox.bottomLat, _data.geoViewBox.leftLon);
                                var northEast = new google.maps.LatLng(_data.geoViewBox.topLat, _data.geoViewBox.rightLon);
                                var bounds = new google.maps.LatLngBounds(southWest,northEast);
                                _data.googleMaps.map.fitBounds(bounds);
                            }else{
                                _data.googleMaps.map.setZoom(_data.options.googleMaps.zoom);
                                _data.googleMaps.map.setCenter(_data.options.googleMaps.center);
                            }
                            _data.options.googleMaps.initialized = true;
                            _data.googleMaps.map.addListener('idle',function(){
                                _data.isZooming = false;
                            });
                            google.maps.event.addListenerOnce(_data.googleMaps.map, 'idle', function(){
                                setTimeout(function() {
                                    _data.$map.addClass('mapsvg-fade-in');
                                    setTimeout(function() {
                                        _data.$map.removeClass('mapsvg-google-map-loading');
                                        _data.$map.removeClass('mapsvg-fade-in');
                                        _data.googleMaps.overlay.draw();
                                        if(!_data.options.googleMaps.center || !_data.options.googleMaps.zoom) {
                                            _data.options.googleMaps.center = _data.googleMaps.map.getCenter().toJSON();
                                            _data.options.googleMaps.zoom = _data.googleMaps.map.getZoom();
                                        }
                                    }, 300);
                                }, 1);
                            });
                            setTimeout(function(){
                                _data.googleMaps.map.addListener('bounds_changed',function(){
                                    // _data.googleMaps.overlay.draw();
                                    setTimeout(function(){
                                        if (!_data.isScrolling)
                                            _data.googleMaps.overlay.draw();
                                            // _this.setViewBoxByGoogleMapBounds();
                                    },100);
                                });
                                // _data.googleMaps.map.addListener('zoom_changed',function(){
                                //     setTimeout(function(){
                                //         _this.trigger('zoom');
                                //     },200);
                                // });

                                _this.setViewBoxByGoogleMapBounds();
                            },200);

                        }else{
                            _data.$map.toggleClass('mapsvg-with-google-map', true);
                            _data.$googleMaps && _data.$googleMaps.show();
                            if(options.type){
                                _data.googleMaps.map.setMapTypeId(options.type);
                            }
                        }
                    }
                }else{
                    // TODO: destroy google maps
                    _data.$map.toggleClass('mapsvg-with-google-map', false);
                    _data.$googleMaps && _data.$googleMaps.hide();
                    _data.googleMaps.initialized = false;

                }

            },
            loadGoogleMapsAPI : function(callback, fail){
                window.gm_authFailure = function() {
                    if(MapSVG.GoogleMapBadApiKey){
                        MapSVG.GoogleMapBadApiKey();
                    }else{
                        alert("Google maps API key is incorrect.");
                    }
                };
                _data.googleMapsScript = document.createElement('script');
                _data.googleMapsScript.onload = function(){
                    MapSVG.googleMapsApiLoaded = true;
                    if(typeof callback == 'function')
                        callback();
                };
                _data.googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?key='+_data.options.googleMaps.apiKey+'&v=3.31';//+'&callback=initMap';

                document.head.appendChild(_data.googleMapsScript);
            },

            loadDetailsView : function(obj){
                // var slide = true;
                var _this = this;
                _this.popover && _this.popover.close();
                if(_this.detailsController)
                    _this.detailsController.destroy();

                _this.detailsController = new MapSVG.DetailsController({
                    color: _data.options.colors.detailsView,
                    autoresize: MapSVG.isPhone ? false : _data.options.detailsView.autoresize,
                    container: _data.$details,
                    template: obj instanceof Region ?  _data.templates.detailsViewRegion : _data.templates.detailsView,
                    mapsvg: _this,
                    data: obj instanceof Region ? obj.forTemplate() : obj,
                    scrollable: _data.options.detailsView.location != 'custom',
                    withToolbar: _data.options.detailsView.location != 'custom',
                    width: _data.options.detailsView.width,
                    events: {
                            'shown': function(){
                                if(_data.events['shown.detailsView']) {
                                    _data.events['shown.detailsView'].call(_this, _this);
                                }
                                _this.trigger('detailsShown');
                            },
                            'closed' : function(){
                            _this.deselectAllRegions();
                            // _this.controlles.
                            _data.controllers && _data.controllers.directory && _data.controllers.directory.deselectItems();
                            if(_data.events['closed.detailsView']){
                                _data.events['closed.detailsView'].call(_this, _this);
                            }
                            _this.trigger('detailsClosed');
                        }
                    }
                });
            },
            setMenuMarkers : function(options){
                options = options || _data.options.menuMarkers;
                options.on != undefined && (options.on = MapSVG.parseBoolean(options.on));
                $.extend(true, _data.options, {menuMarkers: options});

                _data.$menuMarkers && _data.$menuMarkers.off('click.menuMarkers.mapsvg');


                if(_data.options.menuMarkers.on){
                    var menuContainer = $('#'+_data.options.menuMarkers.containerId);
                    if(menuContainer.length){
                        if(!_data.$menuMarkers){
                            if(!menuContainer.is('ul')){
                                _data.$menuMarkers = $('<ul />').appendTo(menuContainer);
                            }else{
                                _data.$menuMarkers = menuContainer;
                            }

                            if(!_data.$menuMarkers.hasClass('mapsvg-menu-markers'))
                                _data.$menuMarkers.addClass('mapsvg-menu-markers');
                        }

                        if(_data.$menuMarkers.children().length===0)
                        // Add links into navigation container
                            _data.markers.sort(function(a,b){
                                return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                            });

                        _data.markers.forEach(function (marker, i) {
                            _data.$menuMarkers.append(_data.options.menuMarkers.template(marker));
                        });

                        _data.$menuMarkers.on('click.menuMarkers.mapsvg','a',function(e){
                            e.preventDefault();
                            var markerID = $(this).attr('href').replace('#','');
                            var marker = _this.getMarker(markerID);
                            var center = marker.getCenter();
                            e = {clientX: center[0], clientY: center[1]};
                            _this.regionClickHandler(e,marker);
                        }).on('mouseover.menuMarkers.mapsvg','a',function(e){
                            e.preventDefault();
                            var markerID = $(this).attr('href').replace('#','');
                            var marker = _this.getMarker(markerID);
                            _data.options.mouseOver && _data.options.mouseOver.call(marker, e, _this);
                        }).on('mouseout.menuMarkers.mapsvg','a',function(e){
                            e.preventDefault();
                            var markerID = $(this).attr('href').replace('#','');
                            var marker = _this.getMarker(markerID);
                            _data.options.mouseOut && _data.options.mouseOut.call(marker, e, _this);
                        });
                    }
                }
            },
            /*
             *
             * END SETTERS
             *
             * */
            getRegion : function(id){
                return _data.regions[_data.regionsDict[id]];
            },
            getMarker : function(id){
                return _data.markers[_data.markersDict[id]];
            },
            checkId : function(id){
                if(_this.getRegion(id))
                    return {error: "This ID is already being used by a Region"};
                else if(_this.getMarker(id))
                    return {error: "This ID is already being used by another Marker"};
                else
                    return true;

            },
            regionsRedrawColors: function(){
                _data.regions.forEach(function(region){
                    region.setFill();
                });
            },
            // destroy
            destroy : function(){
                _data.$map.empty().insertBefore(_data.$wrap).attr('style','').removeClass('mapsvg mapsvg-responsive');
                _data.$wrap.remove();
                delete instances[_data.$map.attr('id')];
                return _this;
            },
            getData : function(){
                return _data;
            },
            fitBounds : function(){

            },
            // GET SCALE VALUE
            getScale: function(){

                // var ratio_def = _data.svgDefault.width / _data.svgDefault.height;
                // var ratio_new = _data.options.width / _data.options.height;
                // var scale1, scale2;

                // var size = [_data.$map.width(), _data.$map.outerHeight()];

                // scale2 = size[0] / _data.viewBox[2];
                var scale2 = _data.$map.width() / _data.viewBox[2];

                // if scale = 0 it means that map width = 0 which means that map is hidden.
                // so we set scale = 1 to avoid problems with marker positioning.
                // proper scale will be set after map show up
                return scale2 || 1;
            },
            updateSize : function(){
                _data.scale = _this.getScale();
                _this.popover && _this.popover.adjustPosition();
                _this.markersAdjustPosition();
                _this.mapAdjustStrokes();
                if(_data.directoryWrap)
                    _data.directoryWrap.height(_data.$wrap.outerHeight());
            },
            // GET VIEBOX [x,y,width,height]
            getViewBox : function(){
                return _data.viewBox;
            },
            // SET VIEWBOX BY SIZE
            viewBoxSetBySize : function(width,height){

                width = parseFloat(width);
                height = parseFloat(height);
                _this.setSize(width,height);
                _data._viewBox = _this.viewBoxGetBySize(width,height);
                // _data.options.width = parseFloat(width);
                // _data.options.height = parseFloat(height);

                _this.setViewBox(_data._viewBox);
                $(window).trigger('resize');
                _this.setSize(width,height);

                // _data.whRatio = _data.viewBox[2] / _data.viewBox[3];
                // if(!_data.options.responsive)
                //     _this.setResponsive();

                return _data.viewBox;
            },
            viewBoxGetBySize : function(width, height){


                var new_ratio = width / height;
                var old_ratio = _data.svgDefault.viewBox[2] / _data.svgDefault.viewBox[3];

                var vb = $.extend([],_data.svgDefault.viewBox);

                if (new_ratio != old_ratio){
                    //vb[2] = width*_data.svgDefault.viewBox[2] / _data.svgDefault.width;
                    //vb[3] = height*_data.svgDefault.viewBox[3] / _data.svgDefault.height;
                    if (new_ratio > old_ratio){
                        vb[2] = _data.svgDefault.viewBox[3] * new_ratio;
                        vb[0] = _data.svgDefault.viewBox[0] - ((vb[2] - _data.svgDefault.viewBox[2])/2);
                    }else{
                        vb[3] = _data.svgDefault.viewBox[2] / new_ratio;
                        vb[1] = _data.svgDefault.viewBox[1] - ((vb[3] - _data.svgDefault.viewBox[3])/2);
                    }

                }

                return vb;
            },
            viewBoxReset : function(toInitial){
                if(_data.options.googleMaps.on){
                    if(!_data.options.googleMaps.center || !_data.options.googleMaps.zoom){
                        var southWest = new google.maps.LatLng(_data.geoViewBox.bottomLat, _data.geoViewBox.leftLon);
                        var northEast = new google.maps.LatLng(_data.geoViewBox.topLat, _data.geoViewBox.rightLon);
                        var bounds = new google.maps.LatLngBounds(southWest,northEast);
                        _data.googleMaps.map.fitBounds(bounds);
                        _data.options.googleMaps.center = _data.googleMaps.map.getCenter().toJSON();
                        _data.options.googleMaps.zoom = _data.googleMaps.map.getZoom();
                    }else{
                        _data.googleMaps.map.setZoom(_data.options.googleMaps.zoom);
                        _data.googleMaps.map.setCenter(_data.options.googleMaps.center);
                    }
                }else{
                    if(toInitial){
                        var v = _data._viewBox || _data.svgDefault.viewBox;
                        _data.zoomLevel = 0;
                        _data._scale = 1;
                        _this.setViewBox(v);
                    }else{
                        _this.setViewBox();
                    }
                }
            },
            getGeoViewBox : function(){
                var v         = _data.viewBox;
                var leftLon   = _this.convertSVGToGeo(v[0],v[1])[1];
                var rightLon  = _this.convertSVGToGeo(v[0]+v[2],v[1])[1];
                var topLat    = _this.convertSVGToGeo(v[0],v[1])[0];
                var bottomLat = _this.convertSVGToGeo(v[0],v[1]+v[3])[0];
                return [leftLon, topLat, rightLon, bottomLat];
            },
            mapAdjustStrokes : function(){
                var _this = this;
                _data.$svg.find('path, polygon, circle, ellipse, rect').each(function(index){
                        if($(this).data('stroke-width')) {
                            $(this).css('stroke-width', $(this).data('stroke-width') / _data.scale);
                        }
                });
            },
            // ZOOM
            zoomIn: function(center){
                if(_data.googleMaps.map){
                    if(!_data.isZooming){
                        _data.isZooming = true;
                        var zoom = _data.googleMaps.map.getZoom()+1;
                        zoom = zoom > 20 ? 20 : zoom;
                        _data.googleMaps.map.setZoom(zoom);
                    }
                }else if(_data.canZoom){
                    _data.canZoom = false;
                    setTimeout(function(){
                        _data.canZoom = true;
                    }, 700);
                    _this.zoom(1, center);
                }
            },
            zoomOut: function(center){
                if(_data.googleMaps.map){
                    if(!_data.isZooming && _data.googleMaps.map.getZoom()-1 >= _data.options.googleMaps.minZoom) {
                        _data.isZooming = true;
                        var zoom = _data.googleMaps.map.getZoom() - 1;
                        zoom = zoom < 1 ? 1 : zoom;
                        _data.googleMaps.map.setZoom(zoom);
                    }
                }else if(_data.canZoom){
                    _data.canZoom = false;
                    setTimeout(function(){
                        _data.canZoom = true;
                    }, 700);
                    _this.zoom(-1, center);
                }
            },
            touchZoomStart : function (touchScale){

                var touchZoomStart = _data._scale;
                _data.scale  = _data.scale * zoom_k;
                var zoom   = _data._scale;
                _data._scale = _data._scale * zoom_k;


                var vWidth     = _data.viewBox[2];
                var vHeight    = _data.viewBox[3];
                var newViewBox = [];

                newViewBox[2]  = _data._viewBox[2] / _data._scale;
                newViewBox[3]  = _data._viewBox[3] / _data._scale;

                newViewBox[0]  = _data.viewBox[0] + (vWidth - newViewBox[2]) / 2;
                newViewBox[1]  = viewBox[1] + (vHeight - newViewBox[3]) / 2;

                _this.setViewBox(newViewBox);

            },
            touchZoomMove : function(){

            },
            touchZoomEnd : function(){

            },
            zoomTo : function (region, zoomToLevel){

                zoomToLevel = zoomToLevel!=undefined ? parseInt(zoomToLevel) : false;


                if(_data.googleMaps.map) {
                    var bounds = region.getGeoBounds();
                    var southWest = new google.maps.LatLng(bounds.sw[0], bounds.sw[1]);
                    var northEast = new google.maps.LatLng(bounds.ne[0], bounds.ne[1]);
                    var bounds = new google.maps.LatLngBounds(southWest,northEast);
                    _data.googleMaps.map.fitBounds(bounds);
                    return;
                }

                // if(_regionOrCenter.length && _regionOrCenter.length==2){
                //     zoomLevel = zoomLevel || 0;
                //     center = _regionOrCenter;
                //     xy = _this.convertGeoToPixel(center);
                //     var z = _data.zoomLevels[zoomLevel];
                //     _this.setViewBox([xy[0]- z.viewBox[2]/2,xy[1]- z.viewBox[3]/2, z.viewBox[2], z.viewBox[3]]);
                //     _this.updateSize();
                //     _data._scale = z._scale;
                //     _data.zoomLevel = zoomLevel;
                // }else{

                var bbox = [], viewBox, viewBoxPrev = [];

                if(typeof region == 'string') {
                    region = _this.getRegion(region);
                }

                if(typeof region == 'object' && region.length !== undefined){
                // multiple objects
                    var _bbox;
                    bbox = region[0].getBBox();
                    var xmin = [bbox[0]];
                    var ymin = [bbox[1]];

                    var w = (bbox[0]+bbox[2]);
                    var xmax = [w];
                    var h = (bbox[1]+bbox[3]);
                    var ymax = [h];
                    if (region.length > 1){
                        for (var i = 1; i < region.length; i++){
                            _bbox = region[i].getBBox();
                            xmin.push(_bbox[0]);
                            ymin.push(_bbox[1]);
                            var _w = _bbox[0]+_bbox[2];
                            var _h = _bbox[1]+_bbox[3];
                            xmax.push(_w);
                            ymax.push(_h);
                        }
                    }
                    xmin = Math.min.apply(Math, xmin);
                    ymin = Math.min.apply(Math, ymin);

                    var w = Math.max.apply(Math, xmax) - xmin;
                    var h = Math.max.apply(Math, ymax) - ymin;
                    bbox = [xmin, ymin, w, h];

                }else{
                // single object
                    bbox = region.getBBox();
                }

                var viewBoxPrev = [];
                $.each(_data.zoomLevels, function(key, level){
                    if(viewBoxPrev.length){
                        if(bbox[2]>bbox[3] && ((viewBoxPrev[2] > bbox[2]) && (bbox[2] > level.viewBox[2]))){
                            _data.zoomLevel = zoomToLevel ? zoomToLevel :  parseInt(key)-1;
                            var vb = _data.zoomLevels[_data.zoomLevel].viewBox;

                            _this.setViewBox([bbox[0]-vb[2]/2+bbox[2]/2,
                                              bbox[1]-vb[3]/2+bbox[3]/2,
                                              vb[2],
                                              vb[3]]);
                            // _this.updateSize();
                            _data._scale = _data.zoomLevels[_data.zoomLevel]._scale;
                        }else if (bbox[2]<bbox[3] && ((viewBoxPrev[3] > bbox[3]) && (bbox[3] > level.viewBox[3]))){
                            _data.zoomLevel = zoomToLevel ? zoomToLevel :  parseInt(key)-1;
                            var vb = _data.zoomLevels[_data.zoomLevel].viewBox;
                            _this.setViewBox([bbox[0]-vb[2]/2+bbox[2]/2,
                                              bbox[1]-vb[3]/2+bbox[3]/2,
                                              vb[2],
                                              vb[3]]);
                            // _this.updateSize();
                            _data._scale = _data.zoomLevels[_data.zoomLevel]._scale;
                        }
                    }
                    viewBoxPrev = level.viewBox;
                });

            },
            centerOn : function(region, yShift){


                if(_data.options.googleMaps.on){
                    yShift = yShift ? (yShift+12)/_this.getScale() : 0;
                    _data.$map.addClass('scrolling');
                    var latLng = region.getCenterLatLng(yShift);
                    _data.googleMaps.map.setCenter(latLng);
                    setTimeout(function(){
                        _data.$map.removeClass('scrolling');
                    },100);
                }else{
                    yShift = yShift ? (yShift+12)/_this.getScale() : 0;
                    var bbox = region.getBBox();
                    var vb   = _data.viewBox;
                    _this.setViewBox(
                        [bbox[0]-vb[2]/2+bbox[2]/2,
                            bbox[1]-vb[3]/2+bbox[3]/2 - yShift,
                            vb[2],
                            vb[3]]);
                    // _this.updateSize();
                    // _data._scale = _data.zoomLevels[_data.zoomLevel]._scale;
                }

            },
            zoom : function (delta, center, exact){

                var vWidth     = _data.viewBox[2];
                var vHeight    = _data.viewBox[3];
                var newViewBox = [];

                var isInZoomRange = _data.zoomLevel >= _data.options.zoom.limit[0] && _data.zoomLevel <= _data.options.zoom.limit[1];

                if(!exact){
                    // check for zoom limit
                    var d = delta > 0 ? 1 : -1;

                    if(!_data.zoomLevels[_data.zoomLevel+d])
                        return;

                    _data._zoomLevel = _data.zoomLevel;
                    _data._zoomLevel += d;

                    if(isInZoomRange && (_data._zoomLevel > _data.options.zoom.limit[1] || _data._zoomLevel < _data.options.zoom.limit[0]))
                        return false;

                    _data.zoomLevel = _data._zoomLevel;
                    //
                    //var zoom_k = d * _data.options.zoom.delta;
                    //if (zoom_k < 1) zoom_k = -1/zoom_k;
                    //
                    //_data._scale         = _data._scale * zoom_k;
                    //newViewBox[2]  = _data._viewBox[2] / _data._scale;
                    //newViewBox[3]  = _data._viewBox[3] / _data._scale;

                    var z = _data.zoomLevels[_data.zoomLevel];
                    _data._scale         = z._scale;
                    newViewBox           = z.viewBox;
                }else{
                    // var foundZoomLevel = false, i = 1, prevScale, newScale;
                    // prevScale = _data.zoomLevels[0]._scale;
                    // while(!foundZoomLevel){
                    //     if(exact >= prevScale && exact <= _data.zoomLevels[i]._scale){
                    //         foundZoomLevel = _data.zoomLevels[i];
                    //     }
                    //     i++;
                    // }
                    // if(isInZoomRange && (foundZoomLevel > _data.options.zoom.limit[1] || foundZoomLevel < _data.options.zoom.limit[0]))
                    //     return false;

                    // _data._scale    = exact;
                    // _data.zoomLevel = foundZoomLevel;


                    newViewBox[2]  = _data._viewBox[2] / exact;
                    newViewBox[3]  = _data._viewBox[3] / exact;
                }

                var shift = [];
                if(center){
                    var koef = d > 0 ? 0.5 : -1; // 1/2 * (d=1) || 2 * (d=-1)
                    shift = [((center[0] - _data.viewBox[0]) * koef), ((center[1] - _data.viewBox[1]) * koef)];
                    newViewBox[0] = _data.viewBox[0] + shift[0];
                    newViewBox[1] = _data.viewBox[1] + shift[1];
                }else{
                    shift = [(vWidth - newViewBox[2]) / 2, (vHeight - newViewBox[3]) / 2];
                    newViewBox[0]  = _data.viewBox[0] + shift[0];
                    newViewBox[1]  = _data.viewBox[1] + shift[1];
                }
                // Limit scroll to map's boundaries
                if(_data.options.scroll.limit)
                {
                    if(newViewBox[0] < _data.svgDefault.viewBox[0])
                        newViewBox[0] = _data.svgDefault.viewBox[0];
                    else if(newViewBox[0] + newViewBox[2] > _data.svgDefault.viewBox[0] + _data.svgDefault.viewBox[2])
                        newViewBox[0] = _data.svgDefault.viewBox[0]+_data.svgDefault.viewBox[2]-newViewBox[2];

                    if(newViewBox[1] < _data.svgDefault.viewBox[1])
                        newViewBox[1] = _data.svgDefault.viewBox[1];
                    else if(newViewBox[1] + newViewBox[3] > _data.svgDefault.viewBox[1] +_data.svgDefault.viewBox[3])
                        newViewBox[1] = _data.svgDefault.viewBox[1]+_data.svgDefault.viewBox[3]-newViewBox[3];
                }

                _this.setViewBox(newViewBox);
                // _this.trigger('zoom');

            },
            // MARK : DELETE
            markerDelete: function(marker){

                var id = marker.id;
                if (!(marker instanceof Marker)){
                    marker = _this.getMarker(marker.id);
                }

                if(_data.editingMarker && _data.editingMarker.id == marker.id){
                    _data.editingMarker = null;
                    delete _data.editingMarker;
                }

                marker.delete();
                _data.markers.splice(_data.markersDict[id],1);

                _this.updateMarkersDict();

                if (_data.markers.length == 0)
                    _data.options.markerLastID = 0;
            },
            // MARK : ADD
            markerAdd : function(opts, create) {

                // Join default marker options with user-defined options
                var options = $.extend(true, {}, markerOptions, opts);

                if(!options.src)
                    return false;

                options.src = MapSVG.safeURL(options.src);

                if (options.width && options.height){
                    if(options.geoCoords) {
                    // Add marker by lat-lon coordinates
                        var xy = _this.convertGeoToSVG(options.geoCoords);
                    }else if (options.xy || (MapSVG.isNumber(options.x) && MapSVG.isNumber(options.y))){
                    // Add marker by SVG x-y coordinates
                        var xy = options.xy || [options.x, options.y];
                    }else{
                        return false;
                    }

                    options.x = xy[0];
                    options.y = xy[1];
                    options.xy = xy;
                    options.id  = options.id || _this.markerId();
                    if(!options.geoCoords && _data.mapIsGeo){
                        options.geoCoords = _this.convertSVGToGeo(options.x, options.y);
                    }

                    var marker = new Marker(options, _data.scale, _this);


                    // TODO add dataobjectsasmarekrs
                    _data.layers.markers.append(marker.node);
                    marker.href && marker.setHref(marker.href);
                    _data.markers.push(marker);
                    _data.markersDict[marker.id] = _data.markers.length - 1;

                    if(create){
                        if(typeof create == 'function'){
                            create(marker);
                        }else{
                            _data.markerEditHandler && _data.markerEditHandler.call(marker);
                        }
                    }


                    return marker;
                }else{
                    var img = new Image();
                    img.onload = function(){
                        options.width = this.width;
                        options.height = this.height;
                        return _this.markerAdd(options, create);
                    };
                    img.src = options.src;
                }
            },
            markerId: function(){
                _data.options.markerLastID = _data.options.markerLastID + 1;
                var id = 'marker_'+(_data.options.markerLastID);
                if(_data.markersDict[id] != undefined)
                    return _this.markerId();
                else
                    return id;
            },
            markersAdjustPosition : function(){
                // We want a marker "tip" to be on bottom side (like a pin)
                // But Raphael starts to draw an image from left top corner.
                // At the same time we don't want a marker to be scaled in size when map scales;
                // Mark always should stay the same size.
                // In this case coordinates of bottom point of image will vary with map scaling.
                // So we have to calculate the offset.
                var dx, dy;
                _data.markers.forEach(function(marker){
                    marker.adjustPosition(_data.scale);
                });
            },
            // MARK MOVE & EDIT HANDLERS
            markerMoveStart : function(){
                // storing original coordinates
                this.data('ox', parseFloat(this.attr('x')));
                this.data('oy', parseFloat(this.attr('y')));
            },
            markerMove : function (dx, dy) {
                dx = dx/_data.scale;
                dy = dy/_data.scale;
                this.attr({x: this.data('ox') + dx, y: this.data('oy') + dy});
            },
            markerMoveEnd : function () {
                // if coordinates are same then it was a "click" and we should start editing
                if(this.data('ox') == this.attr('x') && this.data('oy') == this.attr('y')){
                    options.markerEditHandler.call(this);
                }
            },
            setEditingMarker : function (marker_id) {
                _data.editingMarker = _this.getMarker(marker_id);
            },
            unsetEditingMarker : function(){
                _data.editingMarker = null;
            },
            getEditingMarker : function(){
                return _data.editingMarker;
            },
            scrollStart : function (e,mapsvg){

                if($(e.target).hasClass('mapsvg-btn-zoom') || $(e.target).closest('.mapsvg-gauge').length)
                    return false;

                if(_data.editMarkers.on && $(e.target).hasClass('class')=='mapsvg-marker')
                    return false;

                _data.isScrolling = true;

                // _data.$map.css('pointer-events','none');
                _data.$map.addClass('scrolling');

                e.preventDefault();
                if(MapSVG.touchDevice){
                    var ce = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0] : e;
                }else{
                    var ce = e;
                }

                _data.scroll = _data.scroll || {};

                // initial viewbox when scrollning started
                _data.scroll.vxi = _data.viewBox[0];
                _data.scroll.vyi = _data.viewBox[1];
                // mouse coordinates when scrolling started
                _data.scroll.x  = ce.clientX;
                _data.scroll.y  = ce.clientY;
                // mouse delta
                _data.scroll.dx = 0;
                _data.scroll.dy = 0;
                // new viewbox x/y
                _data.scroll.vx = 0;
                _data.scroll.vy = 0;

                // for google maps scroll
                _data.scroll.gx  = ce.clientX;
                _data.scroll.gy  = ce.clientY;

                _data.scroll.tx = _data.scroll.tx || 0;
                _data.scroll.ty = _data.scroll.ty || 0;

                // var max = _this.convertSVGToPixel(_this.convertGeoToSVG([-85,180]));
                // var min = _this.convertSVGToPixel(_this.convertGeoToSVG([85,-180]));
                // _data.scroll.limit = {
                //     maxX: max[0]+_data.$map.width(),
                //     maxY: max[1]+_data.$map.outerHeight(),
                //     minX: min[0],
                //     minY: min[1]
                // };

                if(e.type.indexOf('mouse') === 0 ){
                    $(document).on('mousemove.scroll.mapsvg', _this.scrollMove);
                    if(_data.options.scroll.spacebar){
                        $(document).on('keyup.scroll.mapsvg', function (e) {
                            if (e.keyCode == 32) {
                                _this.scrollEnd(e, mapsvg);
                            }
                        });
                    }else{
                        $(document).on('mouseup.scroll.mapsvg', function(e){
                            _this.scrollEnd(e,mapsvg);
                        });
                    }
                }

                //else
                //    $('body').on('touchmove.scroll.mapsvg', _this.scrollMove).on('touchmove.scroll.mapsvg', function(e){_this.scrollEnd(e,mapsvg);});
            },
            scrollMove :  function (e){

                e.preventDefault();


                // $('body').css({'cursor': 'hand'});

                var ce = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0] : e;


                // TODO: на каждый зум лев считать допустимые translate xy при данном scale
                if(_this.panBy((_data.scroll.gx - ce.clientX),(_data.scroll.gy - ce.clientY))){
                    if(_data.googleMaps.map){
                        _data.googleMaps.map.panBy((_data.scroll.gx - ce.clientX),(_data.scroll.gy - ce.clientY));
                    }
                }

                _data.scroll.gx  = ce.clientX;
                _data.scroll.gy  = ce.clientY;

                // delta x/y
                _data.scroll.dx = (_data.scroll.x - ce.clientX);
                _data.scroll.dy = (_data.scroll.y - ce.clientY);

                // new viewBox x/y
                var vx = parseInt(_data.scroll.vxi + _data.scroll.dx /_data.scale);
                var vy = parseInt(_data.scroll.vyi + _data.scroll.dy /_data.scale);

                // Limit scroll to map boundaries
                if(_data.options.scroll.limit){

                    if(vx < _data.svgDefault.viewBox[0])
                        vx = _data.svgDefault.viewBox[0];
                    else if(_data.viewBox[2] + vx > _data.svgDefault.viewBox[0] + _data.svgDefault.viewBox[2])
                        vx = (_data.svgDefault.viewBox[0]+_data.svgDefault.viewBox[2]-_data.viewBox[2]);

                    if(vy < _data.svgDefault.viewBox[1])
                        vy = _data.svgDefault.viewBox[1];
                    else if(_data.viewBox[3] + vy > _data.svgDefault.viewBox[1] + _data.svgDefault.viewBox[3])
                        vy = (_data.svgDefault.viewBox[1]+_data.svgDefault.viewBox[3]-_data.viewBox[3]);

                }


                _data.scroll.vx = vx;
                _data.scroll.vy = vy;


                // set new viewBox
                // _this.setViewBox([_data.scroll.vx,  _data.scroll.vy, _data.viewBox[2], _data.viewBox[3]]);

            },
            scrollEnd : function (e,mapsvg, noClick){

                // _data.scroll.tx = (_data.scroll.tx - _data.scroll.dx);
                // _data.scroll.ty = (_data.scroll.ty - _data.scroll.dy);

                _data.isScrolling = false;
                _data.$map.removeClass('scrolling');
                $(document).off('keyup.scroll.mapsvg');
                $(document).off('mousemove.scroll.mapsvg');
                $(document).off('mouseup.scroll.mapsvg');


                // call regionClickHandler if mouse did not move more than 5 pixels
                if (noClick !== true && Math.abs(_data.scroll.dx)<5 && Math.abs(_data.scroll.dy)<5){
                    // _this.popoverOffHandler(e);
                    if(_data.editMarkers.on)
                        _data.clickAddsMarker && _this.markerAddClickHandler(e);
                    else if (_data.region_clicked)
                        _this.regionClickHandler(e, _data.region_clicked);
                }


                _data.viewBox[0] = _data.scroll.vx || _data.viewBox[0];
                _data.viewBox[1] = _data.scroll.vy || _data.viewBox[1] ;


                // _data.$map.css('pointer-events','auto');
                // $('body').css({'cursor': 'default'});

                // if(_data.googleMaps.map) {
                    // fix shift
                    // _this.setViewBoxByGoogleMapBounds();
                // }


            },
            panBy : function(x, y){

                // _data.scroll.tx -= x;
                // _data.scroll.ty -= y;
                var tx = _data.scroll.tx - x;
                var ty = _data.scroll.ty - y;

                if(!_data.options.googleMaps.on && _data.options.scroll.limit){
                    var svg = _data.$svg[0].getBoundingClientRect();
                    var bounds = _data.$map[0].getBoundingClientRect();
                    if(svg.left-x > bounds.left || svg.right-x < bounds.right){
                        tx = _data.scroll.tx;
                    }
                    if(svg.top-y > bounds.top || svg.bottom-y < bounds.bottom){
                        ty = _data.scroll.ty;
                    }
                }

                _data.$scrollpane.css({
                    'transform': 'translate('+tx+'px,'+ty+'px)'
                });

                _data.scroll.tx = tx;
                _data.scroll.ty = ty;
                return true;

            },
            panTo : function(x,y){

            },
            // REMEMBER WHICH REGION WAS CLICKED BEFORE START PANNING
            scrollRegionClickHandler : function (e, region) {
                _data.region_clicked = region;
            },
            touchStart : function (_e,mapsvg){
                // if($(_e.target).hasClass('mapsvg-popover') || $(_e.target).closest('.mapsvg-popover').length ){
                //     return true;
                // }
                _e.preventDefault();
                // _e.stopPropagation();

                // stop scroll and cancel click event
                if(_data.isScrolling){
                    _this.scrollEnd(_e, mapsvg, true);
                }
                var e = _e.originalEvent;

                if(_data.options.zoom.on && e.touches && e.touches.length == 2){
                    _data.touchZoomStartViewBox = _data.viewBox;
                    _data.touchZoomStartScale =  _data.scale;
                    _data.touchZoomEnd   =  1;
                    _data.scaleDistStart = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY);
                }else if(e.touches && e.touches.length == 1){
                    _this.scrollStart(_e,mapsvg);
                }

                $(document).on('touchmove.scroll.mapsvg', function(e){
                    e.preventDefault(); _this.touchMove(e,_this);
                }).on('touchend.scroll.mapsvg', function(e){
                    e.preventDefault(); _this.touchEnd(e,_this);
                });


            },
            touchMove : function (_e, mapsvg){
                // if($(_e.target).hasClass('mapsvg-popover') || $(_e.target).closest('.mapsvg-popover').length ){
                //     return true;
                // }
                _e.preventDefault();
                var e = _e.originalEvent;

                if(_data.options.zoom.on && e.touches && e.touches.length == 2){
                    if(!MapSVG.ios){
                        e.scale = Math.hypot(
                                e.touches[0].pageX - e.touches[1].pageX,
                                e.touches[0].pageY - e.touches[1].pageY)/_data.scaleDistStart;
                    }

                    if(e.scale!=1 && _data.canZoom) {
                        var d = e.scale > 1 ? 1 : -1;

                        var cx = e.touches[0].pageX >= e.touches[1].pageX ? e.touches[0].pageX - (e.touches[0].pageX - e.touches[1].pageX)/2 - _data.$svg.offset().left : e.touches[1].pageX - (e.touches[1].pageX - e.touches[0].pageX)/2 - _data.$svg.offset().left;
                        var cy = e.touches[0].pageY >= e.touches[1].pageY ? e.touches[0].pageY - (e.touches[0].pageY - e.touches[1].pageY) - _data.$svg.offset().top : e.touches[1].pageY - (e.touches[1].pageY - e.touches[0].pageY) - _data.$svg.offset().top;
                        var center = _this.convertPixelToSVG([cx, cy]);

                        if (d > 0)
                            _this.zoomIn(center);
                        else
                            _this.zoomOut(center);
                    }
                }else if(_data.isScrolling){
                    _this.scrollMove(_e);
                }
            },
            touchEnd : function (_e, mapsvg){
                // if($(_e.target).hasClass('mapsvg-popover') || $(_e.target).closest('.mapsvg-popover').length ){
                //     return true;
                // }
                _e.preventDefault();
                var e = _e.originalEvent;
                if(_data.touchZoomStart){
                    _data.touchZoomStart  = false;
                    _data.touchZoomEnd    = false;
                }else if(_data.isScrolling){
                    _this.scrollEnd(_e, mapsvg);
                }

                $(document).off('touchmove.scroll.mapsvg');
                $(document).off('touchend.scroll.mapsvg');


            },
            markersGroupHide : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].hide();
                }
            },
            markersGroupShow : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].show();
                }
            },
            regionsGroupSelect : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].hide();
                }
            },
            regionsGroupUnselect : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].show();
                }
            },
            // GET ALL MARKERS
            markersGet : function(){
                return _data.markers;
            },
            // GET SELECTED REGION OR ARRAY OF SELECTED REGIONS
            getSelected : function(){
                return _data.selected_id;
            },
            // SELECT REGION
            selectRegion :    function(id, skipDirectorySelection){
                // _this.hidePopover();
                if(typeof id == "string"){
                    var region = _this.getRegion(id);
                }else{
                    var region = id;
                }
                if(!region) return false;
                if(_data.options.multiSelect && !_data.editRegions.on){
                    if(region.selected){
                        _this.deselectRegion(region);
                        return;
                    }
                }else if(_data.selected_id.length>0){
                    _this.deselectAllRegions();
                }
                _data.selected_id.push(region.id);
                region.select();
            },
            deselectAllRegions : function(){
                $.each(_data.selected_id, function(index,id){
                    _this.deselectRegion(_this.getRegion(id));
                });
            },
            deselectRegion : function (region){
                if(!region)
                    region = _this.getRegion(_data.selected_id[0]);
                if(region){
                    region.deselect();
                    var i = $.inArray(region.id, _data.selected_id);
                    _data.selected_id.splice(i,1);
                    // if(MapSVG.browser.ie)//|| MapSVG.browser.firefox)
                    //     _this.mapAdjustStrokes();
                }
            },
            highlightRegions : function(regions){
                regions.forEach(function(region){
                    if(!region.selected && !region.disabled){
                        _data.highlightedRegions.push(region);
                        region.highlight();
                    }
                })
            },
            unhighlightRegions : function(){
                _data.highlightedRegions.forEach(function(region){
                    if(!region.selected && !region.disabled)
                        region.unhighlight();
                });
                _data.highlightedRegions = [];
            },
            convertMouseToSVG : function(e){
                var mc = MapSVG.mouseCoords(e);
                var x = mc.x - _data.$svg.offset().left;
                var y = mc.y - _data.$svg.offset().top;
                return _this.convertPixelToSVG([x,y]);
            },
            convertSVGToPixel : function(xy){
                var scale = _this.getScale();
                return [(xy[0]-_data.svgDefault.viewBox[0])*scale, (xy[1]-_data.svgDefault.viewBox[1])*scale];
            },
            convertPixelToSVG : function(xy){
                var scale = _this.getScale();
                return [(xy[0])/scale+_data.svgDefault.viewBox[0], (xy[1])/scale+_data.svgDefault.viewBox[1]];
            },
            convertGeoToSVG: function (coords){

                var lat = parseFloat(coords[0]);
                var lon = parseFloat(coords[1]);
                var x = (lon - _data.geoViewBox.leftLon) * (_data.svgDefault.viewBox[2] / _data.mapLonDelta);

                var lat = lat * 3.14159 / 180;
                // var worldMapWidth = ((_data.svgDefault.width / _data.mapLonDelta) * 360) / (2 * 3.14159);
                var worldMapWidth = ((_data.svgDefault.viewBox[2] / _data.mapLonDelta) * 360) / (2 * 3.14159);
                var mapOffsetY = (worldMapWidth / 2 * Math.log((1 + Math.sin(_data.mapLatBottomDegree)) / (1 - Math.sin(_data.mapLatBottomDegree))));
                var y = _data.svgDefault.viewBox[3] - ((worldMapWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - mapOffsetY);

                x += _data.svgDefault.viewBox[0];
                y += _data.svgDefault.viewBox[1];

                return [x, y];
            },
            convertSVGToGeo: function (tx, ty){
                tx -= _data.svgDefault.viewBox[0];
                ty -= _data.svgDefault.viewBox[1];
                /* called worldMapWidth in Raphael's Code, but I think that's the radius since it's the map width or circumference divided by 2*PI  */
                var worldMapRadius = _data.svgDefault.viewBox[2] / _data.mapLonDelta * 360/(2 * Math.PI);
                var mapOffsetY = ( worldMapRadius / 2 * Math.log( (1 + Math.sin(_data.mapLatBottomDegree) ) / (1 - Math.sin(_data.mapLatBottomDegree))  ));
                var equatorY = _data.svgDefault.viewBox[3] + mapOffsetY;
                var a = (equatorY-ty)/worldMapRadius;
                var lat = 180/Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI/2);
                var lon = _data.geoViewBox.leftLon+tx/_data.svgDefault.viewBox[2]*_data.mapLonDelta;
                lat  = parseFloat(lat.toFixed(6));
                lon  = parseFloat(lon.toFixed(6));
                return [lat,lon];
            },
            convertGeoBoundsToViewBox: function (sw, ne){

                var lat = parseFloat(coords[0]);
                var lon = parseFloat(coords[1]);
                var x = (lon - _data.geoViewBox.leftLon) * (_data.svgDefault.viewBox[2] / _data.mapLonDelta);

                var lat = lat * 3.14159 / 180;
                // var worldMapWidth = ((_data.svgDefault.width / _data.mapLonDelta) * 360) / (2 * 3.14159);
                var worldMapWidth = ((_data.svgDefault.viewBox[2] / _data.mapLonDelta) * 360) / (2 * 3.14159);
                var mapOffsetY = (worldMapWidth / 2 * Math.log((1 + Math.sin(_data.mapLatBottomDegree)) / (1 - Math.sin(_data.mapLatBottomDegree))));
                var y = _data.svgDefault.viewBox[3] - ((worldMapWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - mapOffsetY);

                x += _data.svgDefault.viewBox[0];
                y += _data.svgDefault.viewBox[1];

                return [x, y];
            },
            // PICK COLOR FROM GRADIENT
            pickGaugeColor: function(gaugeValue) {
                var w = (gaugeValue - _data.options.gauge.min) / _data.options.gauge.maxAdjusted;
                var rgb = [
                    Math.round(_data.options.gauge.colors.diffRGB.r * w + _data.options.gauge.colors.lowRGB.r),
                    Math.round(_data.options.gauge.colors.diffRGB.g * w + _data.options.gauge.colors.lowRGB.g),
                    Math.round(_data.options.gauge.colors.diffRGB.b * w + _data.options.gauge.colors.lowRGB.b),
                    Math.round(_data.options.gauge.colors.diffRGB.a * w + _data.options.gauge.colors.lowRGB.a)
                ];
                return rgb;
            },
            // CHECK IF REGION IS DISABLED
            isRegionDisabled : function (id, svgfill){

                if(_data.options.regions[id] && (_data.options.regions[id].disabled || svgfill == 'none') ){
                    return true;
                }else if(
                    (_data.options.regions[id] == undefined || MapSVG.parseBoolean(_data.options.regions[id].disabled)) &&
                    (_data.options.disableAll || svgfill == 'none' || id == 'labels' || id == 'Labels')

                ){
                    return true;
                }else{
                    return false;
                }
            },
            regionClickHandler : function(e, region, skipPopover){

                _data.region_clicked = null;
                var actions = _data.options.actions;

                if(region.mapsvg_type=='region')
                    _this.selectRegion(region.id);
                if(_data.editRegions.on){
                    _data.regionEditHandler.call(region);
                    return;
                }
                // _this.hidePopover();


                _this.showPopover(region);

                if(_data.options.onClick)
                    _data.options.onClick.call(region, e, _this);

                if(region.href && !_data.disableLinks){
                    if(region.target=='blank'){
                        var win = window.open(region.href, '_blank');
                        win.focus();
                    }else{
                        window.location.href = region.href;
                    }
                }

            },
            fileExists : function(url){
                if(url.substr(0,4)=="data")
                    return true;
                var http = new XMLHttpRequest();
                http.open('HEAD', url, false);
                http.send();
                return http.status!=404;
            },
            getStyle : function(elem,prop){
                if (elem.currentStyle) {
                    var res= elem.currentStyle.margin;
                } else if (window.getComputedStyle) {
                    if (window.getComputedStyle.getPropertyValue){
                        var res= window.getComputedStyle(elem, null).getPropertyValue(prop)}
                    else{var res =window.getComputedStyle(elem)[prop] };
                }
                return res;
            },
            search: function(str){
                var results = [];
                str = str.toLowerCase();
                _data.regions.forEach(function(r){
                    if(r.id.toLowerCase().indexOf(str) === 0 || r.id.toLowerCase().indexOf('-'+str) !== -1 || (r.title && r.title.toLowerCase().indexOf(str) === 0))
                        results.push({id: r.id, id_no_spaces: r.id_no_spaces});
                });
                return results;
            },
            searchMarkers: function(str){
                var results = [];
                str = str.toLowerCase();
                _data.markers.forEach(function(m){
                    if(m.id.toLowerCase().indexOf(str) === 0)
                        results.push(m.id);
                });
                return results;
            },
            searchData: function(field, str){
                var results = [];
                str = str.toLowerCase();
                _data.options.data.forEach(function(params){
                    for(var i in params){
                        if((''+params[i]).toLowerCase().indexOf(str) === 0 && results.indexOf(params.id)==-1)
                            results.push(params.id);
                    }
                });
                return results;
            },
            hideMarkersExceptOne: function(id){
                _data.markers.forEach(function(m){
                    if(m.id!=id)
                        m.node.addClass('mapsvg-marker-hidden');
                });
            },
            showMarkers: function(){
                _data.markers.forEach(function(m){
                    m.node.removeClass('mapsvg-marker-hidden');
                });
            },
            markerAddClickHandler : function(e){

                // Don't add marker if marker was clicked
                if($(e.target).hasClass('mapsvg-marker')) return false;

                var mc = MapSVG.mouseCoords(e);
                var x = mc.x - _data.$svg.offset().left;
                var y = mc.y - _data.$svg.offset().top;
                var xy = _this.convertPixelToSVG([x,y]);

                if(!$.isNumeric(x) || !$.isNumeric(y))
                    return false;

                var data = {xy: xy};

                // When Form Builder is opened in MapSVG Builder, there could be created marker
                // already so we want to move the marker to a new position on map click
                // instead of creating a new marker
                if(_data.editingMarker){
                    // _data.editingMarker.moveToClick([x,y]);
                    _data.editingMarker.setXy(xy);
                    return;
                }

                if(window.defaultMarkerImage)
                    data.src = window.defaultMarkerImage;

                _this.markerAdd(data, true);
            },
            setMarkersEditMode : function(on, clickAddsMarker){
                _data.clickAddsMarker = true;
                _data.editMarkers.on = MapSVG.parseBoolean(on);
                _this.deselectAllRegions();
                _this.setEventHandlers();
            },
            setRegionsEditMode : function(on){
                _data.editRegions.on = MapSVG.parseBoolean(on);
                _this.deselectAllRegions();
                _this.setEventHandlers();
            },
            setEditMode: function(on){
                _data.editMode = on;
            },
            setDataEditMode : function(on){
                _data.editData.on = MapSVG.parseBoolean(on);
                _this.deselectAllRegions();
                _this.setEventHandlers();
            },
            // Adding markers
            setMarkers : function (markers){
                $.each(markers, function(i, marker){
                    _this.markerAdd(marker);
                });
                _data.markers.sort(function(a,b){
                    return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
                _data.markers.forEach(function(marker, index){
                    _data.markersDict[marker.id] = index;
                });


            },
            setEventHandler : function(){

            },
            textBr: function(text){
                var htmls = [];
                var lines = text.split(/\n/);
                var tmpDiv = jQuery(document.createElement('div'));
                for (var i = 0 ; i < lines.length ; i++) {
                    htmls.push(tmpDiv.text(lines[i]).html());
                }
                return htmls.join("<br />");
            },
            runUserFunction : function(func){
                try{
                    func();
                }catch(error){
                    console.log("MapSVG user-defined function error: (line "+error.line+"): "+error.message);
                }
            },
            download: function(){

                if(!_data.downloadForm) {
                    _data.downloadForm = $('<form id="mdownload" action="/wp-content/plugins/mapsvg-dev/download.php" method="POST"><input type="hidden" name="svg_file" value="0" /><input type="hidden" name="svg_title"></form>');
                    _data.downloadForm.appendTo('body');
                }
                _data.downloadForm.find('input[name="svg_file"]').val(_data.$svg.prop('outerHTML'));
                _data.downloadForm.find('input[name="svg_title"]').val(_data.options.title);
                setTimeout(function() {
                    jQuery('#mdownload').submit();
                }, 500);
            },
            showTooltip : function(region){
                if(region.disabled)
                    return false;

                var tip;
                if (_data.options.tooltips.priority == "global"){
                    tip =
                        (typeof _data.options.tooltips.mode == "function") && _data.options.tooltips.mode.call(region,_data.tooltip.container, region, _this)
                        ||
                        _data.options.tooltips.mode!='off' && region[_data.options.tooltips.mode]
                        ||
                        region.tooltip
                }else{
                    tip =
                        region.tooltip
                        ||
                        (typeof _data.options.tooltips.mode == "function") && _data.options.tooltips.mode.call(region,_data.tooltip.container, region, _this)
                        ||
                        _data.options.tooltips.mode!='off' && region[_data.options.tooltips.mode];
                }
                if (tip && tip.length){
                    _data.tooltip.container.html(tip);
                    _data.tooltip.container.addClass('mapsvg-tooltip-visible');
                }
            },
            getPopoverBody: function(region){
                var popover;
                if(_data.options.popovers.priority == 'global'){
                    popover = typeof _data.options.popovers.mode == 'function' ? _data.options.popovers.mode.call(region, _data.mapPopover, region, _this) : region.popover;
                }else{
                    popover = region.popover || (typeof _data.options.popovers.mode == 'function' ? _data.options.popovers.mode.call(region, _data.mapPopover, region, _this) : null);
                }

                return popover;
            },
            popoverAdjustPosition: function(){
                if(!_data.$popover || !_data.$popover.data('point')) return;

                var pos = _this.convertSVGToPixel(_data.$popover.data('point'));

                // pos[0] = pos[0] - (_data.layers.popovers.offset().left - _data.$map.offset().left);
                // pos[1] = pos[1] - (_data.layers.popovers.offset().top - _data.$map.offset().top);

                _data.$popover.css({
                    'transform': 'translateX(-50%) translate('+pos[0]+'px,'+pos[1]+'px)'
                });
            },
            showPopover : function (mapObject){

                // TODO check why need this:
                // var popoverShown = false;

                // var mapObject = object instanceof Region ? object : (object.marker&&object.marker.id ? _this.getMarker(object.marker.id) : null);
                if(!mapObject)
                    return;

                var _this = this;

                var template  = _this.getPopoverBody(mapObject);
                if(!template)
                    return;

                var point;
                if(mapObject instanceof Marker){
                    point = {x: mapObject.x, y: mapObject.y};
                }else{
                    point = mapObject.getCenterSVG();
                }
                _this.popover && _this.popover.destroy();
                _this.popover = new MapSVG.PopoverController({
                    container: _data.$popover,
                    point: point,
                    yShift: mapObject instanceof Marker ? mapObject.height : 0,
                    template: template,
                    mapsvg: _this,
                    data: template,//object instanceof Region ? object.forTemplate() : object,
                    mapObject: mapObject,
                    scrollable: true,
                    withToolbar: true,
                    events: {
                        'shown': function(){
                            if(_data.options.popovers.centerOn){
                                var shift = this.container.height()/2;
                                if(_data.options.popovers.centerOn && !(MapSVG.isPhone && _data.options.popovers.mobileFullscreen)){
                                    _this.centerOn(mapObject, shift);
                                }
                            }
                            // _data.events['shown.popover'] && _data.events['shown.popover'].call(this);
                            // _this.trigger('popoverShown');
                        },
                        'closed': function(){
                            _data.options.popovers.centerOn && _data.options.popovers.resetViewboxOnClose && _this.viewBoxReset(true);
                            // _data.events['closed.popover'] && _data.events['closed.popover'].call(this);
                            // _this.trigger('popoverClosed');
                        },
                        'resize': function(){
                            if(_data.options.popovers.centerOn){
                                var shift = this.container.height()/2;
                                if(_data.options.popovers.centerOn && !(MapSVG.isPhone && _data.options.popovers.mobileFullscreen)){
                                    _this.centerOn(mapObject, shift);
                                }
                            }
                         }
                    }
                });

                // var center = mapObject.getCenterSVG();
                // _data.$popover.data('point', [center.x,center.y]);
                // _this.popoverAdjustPosition();

                // _data.$popover.addClass('mapsvg-popover-visible');
                // _data.$popover.addClass('mapsvg-popover-animate');
                //
                // popoverShown = true;

                // $('body').toggleClass('mapsvg-popover-open', popoverShown);
            },
            hidePopover : function(){
                _this.popover && _this.popover.close();
                // $('body').toggleClass('mapsvg-popover-open', false);
            },
            hideTip : function (){
                _data.tooltip.container.removeClass('mapsvg-tooltip-visible');
                //_data.tooltip.container.html('');
            },
            popoverOffHandler : function(e){

                if(_data.isScrolling || $(e.target).closest('.mapsvg-popover').length || $(e.target).hasClass('mapsvg-btn-zoom'))
                    return;
                this.popover && this.popover.close();
            },
            mouseOverHandler : function(e){
                //if (this.disabled)
                //    return false;
                if(this instanceof Region) {
                    if (!this.selected)
                        this.highlight();
                }
                _this.showTooltip(this);
                //// TODO как-то убрать
                //if(!_data.editRegions.on && !_data.editMarkers.on)
                return _data.options.mouseOver && _data.options.mouseOver.call(this, e, _this);
            },
            mouseOutHandler : function(e){
                //if (this.disabled)
                //    return false;
                if(this instanceof Region) {
                    if (!this.selected)
                        this.unhighlight();
                }
                _this.hideTip();
                //// todo remove
                //if(!_data.editRegions.on && !_data.editMarkers.on)
                return _data.options.mouseOut && _data.options.mouseOut.call(this, e, _this);
            },
            updateOptions : function(options){
                $.extend(true,_data.options,options);
            },
            updateMarkersDict : function(){
                _data.markersDict = {};
                _data.markers.forEach(function(marker, i){
                    _data.markersDict[marker.id] = i;
                });
            },
            eventsPrevent: function(event){
                _data.eventsPrevent[event] = true;
            },
            eventsRestore: function(event){
                if(event){
                    _data.eventsPrevent[event] = false;
                } else {
                    _data.eventsPrevent = {};
                }

            },
            setEventHandlers : function(){

                _data.$map.off('.common.mapsvg');
                _data.$scrollpane.off('.common.mapsvg');
                $(document).off('keydown.scroll.mapsvg');
                $(document).off('mousemove.scrollInit.mapsvg');
                $(document).off('mouseup.scrollInit.mapsvg');

                if(_data.editMarkers.on){

                    // var event2 = MapSVG.touchDevice ? 'touchstart.common.mapsvg' : 'mousedown.common.mapsvg';
                    _data.$map.on('touchstart.common.mapsvg mousedown.common.mapsvg', '.mapsvg-marker',function(e){
                        e.originalEvent.preventDefault();
                        var marker = _this.getMarker($(this).attr('id'));
                        var startCoords = MapSVG.mouseCoords(e);
                        marker.drag(startCoords, _data.scale, function() {
                            if (_data.mapIsGeo){
                                this.geoCoords = _this.convertSVGToGeo(this.x + this.width / 2, this.y + (this.height-1));
                            }
                            _data.markerEditHandler && _data.markerEditHandler.call(this,true);
                            if(this.onChange)
                                this.onChange.call(this);
                        },function(){
                            _data.markerEditHandler && _data.markerEditHandler.call(this);
                            if(this.onChange)
                                this.onChange.call(this);
                        });
                    });
                }

                // REGIONS
                // if (!MapSVG.touchDevice) {
                    if(!_data.editMarkers.on) {
                        _data.$map.on('mouseover.common.mapsvg', '.mapsvg-region', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOverHandler.call(_this.getRegion(id), e, _this, options);
                        }).on('mouseleave.common.mapsvg', '.mapsvg-region', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOutHandler.call(_this.getRegion(id), e, _this, options);
                        });
                    }
                    if(!_data.editRegions.on){
                        _data.$map.on('mouseover.common.mapsvg', '.mapsvg-marker', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOverHandler.call(_this.getMarker(id), e, _this, options);
                        }).on('mouseleave.common.mapsvg', '.mapsvg-marker', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOutHandler.call(_this.getMarker(id), e, _this, options);
                        });
                    }
                // }

                if(_data.options.scroll.spacebar){
                    $(document).on('keydown.scroll.mapsvg', function(e) {
                        if(!_data.isScrolling && e.keyCode == 32){
                            e.preventDefault();
                            _data.$map.addClass('mapsvg-scrollable');
                            $(document).on('mousemove.scrollInit.mapsvg', function(e) {
                                _data.isScrolling = true;
                                $(document).off('mousemove.scrollInit.mapsvg');
                                _this.scrollStart(e,_this);
                            }).on('keyup.scroll.mapsvg', function (e) {
                                if (e.keyCode == 32) {
                                    $(document).off('mousemove.scrollInit.mapsvg');
                                    _data.$map.removeClass('mapsvg-scrollable');
                                }
                            });
                        }
                    });
                }else if (!_data.options.scroll.on) {
                    var event = MapSVG.touchDevice ? 'touchstart.common.mapsvg' : 'click.common.mapsvg';
                    if(!_data.editMarkers.on) {
                        // if(MapSVG.touchDevice){
                        //     _data.$map.on('touchstart.common.mapsvg', '.mapsvg-region', function (e) {
                        //         _data.touchScrollStart = $('body').scrollTop();
                        //     });
                        //     _data.$map.on('touchend.common.mapsvg', '.mapsvg-region', function (e) {
                        //         if(_data.touchScrollStart == $('body').scrollTop()){
                        //             _this.regionClickHandler.call(_this, e, _this.getRegion($(this).attr('id')));
                        //         }
                        //     });
                        //     _data.$map.on('touchstart.common.mapsvg', '.mapsvg-marker', function (e) {
                        //         _data.touchScrollStart = $('body').scrollTop();
                        //     });
                        //     _data.$map.on('touchend.common.mapsvg', '.mapsvg-marker', function (e) {
                        //         if(_data.touchScrollStart == $('body').scrollTop()){
                        //             _this.regionClickHandler.call(_this, e, _this.getMarker($(this).attr('id')));
                        //         }
                        //     });
                        // }else{
                            _data.$map.on('touchstart.common.mapsvg', '.mapsvg-region', function (e) {
                                _data.touchScrollStart = $('body').scrollTop();
                            });
                            _data.$map.on('touchstart.common.mapsvg', '.mapsvg-marker', function (e) {
                                _data.touchScrollStart = $('body').scrollTop();
                            });

                            _data.$map.on('touchend.common.mapsvg mouseup.common.mapsvg', '.mapsvg-region', function (e) {
                                e.preventDefault();
                                if(!_data.touchScrollStart || _data.touchScrollStart == $('body').scrollTop()){
                                    _this.regionClickHandler.call(_this, e, _this.getRegion($(this).attr('id')));
                                }
                                // _this.regionClickHandler.call(_this, e, _this.getRegion($(this).attr('id')));
                            });
                            _data.$map.on('touchend.common.mapsvg mouseup.common.mapsvg','.mapsvg-marker',  function (e) {
                                e.preventDefault();
                                if(!_data.touchScrollStart || _data.touchScrollStart == $('body').scrollTop()) {
                                    _this.regionClickHandler.call(_this, e, _this.getMarker($(this).attr('id')));
                                }
                            });
                        // }
                    }else{
                        if(_data.clickAddsMarker)
                            _data.$map.on('touchend.common.mapsvg mouseup.common.mapsvg', function (e) {
                                e.preventDefault();
                                _this.markerAddClickHandler(e);
                            });
                    }
                } else {

                    _data.$map.on('touchstart.common.mapsvg mousedown.common.mapsvg', function(e){

                        if($(e.target).hasClass('mapsvg-popover')||$(e.target).closest('.mapsvg-popover').length){
                            return;
                        }
                        if(e.type=='touchstart'){
                            e.preventDefault();
                        }

                        if(e.target && $(e.target).attr('class') && $(e.target).attr('class').indexOf('mapsvg-region')!=-1){
                            var obj = _this.getRegion($(e.target).attr('id'));
                            _this.scrollRegionClickHandler.call(_this, e, obj);
                        }else if(e.target && $(e.target).attr('class') && $(e.target).attr('class').indexOf('mapsvg-marker')!=-1){
                            if(_data.editMarkers.on){
                                return;
                            }
                            var obj = _this.getMarker($(e.target).attr('id'));
                            _this.scrollRegionClickHandler.call(_this, e, obj);
                        }
                        if(e.type=='mousedown'){
                            _this.scrollStart(e,_this);
                        }else{
                            _this.touchStart(e,_this);
                        }
                    });

                }
            },
            addLayer: function(name){
                _data.layers[name] = $('<div class="mapsvg-layer mapsvg-layer-'+name+'"></div>');
                _data.$layers.append(_data.layers[name]);
            },
            getDatabaseService: function(){
                return this.database;
            },
            regionAdd: function(svgObject){
                var region = new Region($(svgObject), _data.options, _data.regionID, _this);
                region.setStatus(1);
                _data.regions.push(region);
                _data.regions.sort(function(a,b){
                    return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
                _data.regions.forEach(function(region, index){
                    _data.regionsDict[region.id] = index;
                });
                return region;
            },
            regionDelete: function(id){
                var index = _data.regionsDict[id];
                if(index !== undefined){
                    var r = _this.getRegion(id);
                    r.node && r.node.remove();
                    _data.regions.splice(index,1);
                    delete _data.regionsDict[id];
                }else{
                    if($('#'+id).length){
                        $('#'+id).remove();
                    }
                }
            },
            regionSetFill: function(id, fill){
	            var regions = {};
	            regions[id] = {fill: fill};
	            $.extend(true, this.globalOptions, {regions: regions});
          	},
            reloadRegions : function(){
                var _this = this;
                _data.regions = [];
                _data.regionsDict = {};
                _data.$svg.find('.mapsvg-region').removeClass('mapsvg-region');
                _data.$svg.find('.mapsvg-region-disabled').removeClass('mapsvg-region-disabled');
                _data.$svg.find('path, polygon, circle, ellipse, rect').each(function(index){
                    if($(this).closest('defs').length)
                        return;
                    if($(this)[0].getAttribute('id')) {
                        var region = new Region($(this), _data.options, _data.regionID, _this);
                        _data.regions.push(region);
                    }
                    // if($(this).css('stroke-width')){
                    //     $(this).data('stroke-width', $(this).css('stroke-width').replace('px',''));
                    // }
                });
                _data.regions.sort(function(a,b){
                    return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
                _data.regions.forEach(function(region, index){
                    _data.regionsDict[region.id] = index;
                });
            },
            reloadRegionsFull : function(){
                var statuses = _this.regionsDatabase.getSchemaFieldByType('status');
                _this.regionsDatabase.getLoaded().forEach(function(object){
                    var region = _this.getRegion(object.id);
                    if(region){
                        region.data = object;
                        if(statuses && object.status !== undefined && object.status!==null){
                            region.setStatus(object.status);
                            // _this.setRegionStatus(region, object.status);
                        }
                    }
                });
                _this.loadDirectory();
                _this.setGauge();
                _this.setLayersControl();
                _this.setGroups();
            },
            // INIT
            init: function(opts, elem) {

                if(!opts.source) {
                    throw new Error('MapSVG: please provide SVG file source.');
                    return false;
                }


                if(opts.beforeLoad)
                    try{opts.beforeLoad.call(_this);}catch(err){}

                // cut domain to avoid cross-domain errors
                if(opts.source.indexOf('//')===0)
                    opts.source = opts.source.replace(/^\/\/[^\/]+/, '').replace('//','/');
                else
                    opts.source = opts.source.replace(/^.*:\/\/[^\/]+/, '').replace('//','/');

                /** Setting _data **/
                _data  = {};

                _data.editMode = opts.editMode;
                delete opts.editMode;
                _data.options = $.extend(true, {}, defaults, opts);

                _this.id = _data.options.db_map_id;
                if(_this.id == 'new')
                    _this.id = null;
                _data.highlightedRegions = [];
                _data.editRegions = {on:false};
                _data.editMarkers = {on:false};
                _data.editData    = {on:false};
                _data.map  = elem;
                _data.$map = $(elem);
                _data.$scrollpane = $('<div class="mapsvg-scrollpane"></div>').appendTo(_data.$map);
                _data.$layers = $('<div class="mapsvg-layers-wrap"></div>').appendTo(_data.$scrollpane);

                _data.whRatio = 0;
                _data.isScrolling = false;
                _data.markerOptions = {};
                _data.svgDefault = {};
                _data.refLength = 0;
                _data.scale  = 1;         // absolute scale
                _data._scale = 1;         // relative scale starting from current zoom level
                _data.selected_id    = [];
                _data.mapData        = {};
                _data.regions        = [];
                _data.regionsDict    = {};
                _data.regionID       = {id: 0};
                _data.markers        = [];
                _data.markersDict    = {};
                _data._viewBox       = []; // initial viewBox
                _data.viewBox        = []; // current viewBox
                _data.viewBoxZoom    = [];
                _data.viewBoxFind    = undefined;
                _data.zoomLevel      = 0;
                _data.scroll         = {};
                _data.layers         = {};
                _data.geoCoordinates = false;
                _data.geoViewBox     = {leftLon:0, topLat:0, rightLon:0, bottomLat:0};
                _data.eventsPrevent  = {};

                _data.geoCoordinates = false,
                    _data.geoViewBox     = {leftLon:0, topLat:0, rightLon:0, bottomLat:0},


                // Set background
                _data.$map.addClass('mapsvg').addClass('no-transitions').css('background',_data.options.colors.background);

                _data.$wrap = $('<div class="mapsvg-wrap"></div>');
                _data.$wrap.insertBefore(_data.$map);
                _data.$wrap.append(_data.$map);

                if(!_data.editMode){

                    // if(_data.options.menu.on){
                    //
                    // }

                    if(_data.options.detailsView.location != 'custom'){
                        _data.$details   = $('<div class="mapsvg-details-container"></div>');
                        if(MapSVG.isPhone){
                            $('body').append(_data.$details);
                        }else{
                            _data.$wrap.append(_data.$details);
                            if(!_data.options.menu.customContainer){
                                if(_data.options.menu.on && _data.options.detailsView.location == 'near'){
                                    _data.$details.css({left: _data.options.menu.width});
                                    _data.$details.addClass('near');
                                }else if(!_data.options.menu.on || _data.options.detailsView.location == 'top'){
                                    _data.$details.addClass('top');
                                }
                                if(_data.options.detailsView.margin){
                                    _data.$details.css('margin',_data.options.detailsView.margin);
                                }
                            }
                        }
                    }else{
                        _data.$details = $('#'+_data.options.detailsView.containerId);
                    }


                }


                // _data.$ratio = $('<div class="mapsvg-ratio"></div>');
                // _data.$ratio.insertBefore(_data.$map);
                // _data.$ratio.append(_data.$map);

                var loading = $('<div>'+_data.options.loadingText+'</div>').addClass('mapsvg-loading');
                _data.$map.append(loading);

                // _data.$mapRatioSize = $('<div class="mapsvg-ratio"></div>').insertBefore(_data.$map);
                // _data.$map.appendTo(_data.$mapRatioSize);

                _this.addLayer('markers');
                _this.addLayer('popovers');

                loading.css({
                    'margin-left': function () {
                        return -($(this).outerWidth(false) / 2)+'px';
                    },
                    'margin-top': function () {
                        return -($(this).outerHeight(false) / 2)+'px';
                    }
                });
                if(_data.options.googleMaps.on){
                    _data.$map.addClass('mapsvg-google-map-loading');
                }

                // Load extension (common things)
                if(_data.options.extension && $().mapSvg.extensions && $().mapSvg.extensions[_data.options.extension]){
                    var ext = $().mapSvg.extensions[_data.options.extension];
                    ext && ext.common(_this);
                }


                // GET the map by ajax request
                $.ajax({url: _data.options.source+'?v='+_data.options.svgFileVersion})
                    .done(function(xmlData){

                        // Default width/height/viewBox from SVG
                        var svgTag               = $(xmlData).find('svg');
                        _data.$svg               = svgTag;

                        _data.svgDefault.width   = svgTag.attr('width');
                        _data.svgDefault.height  = svgTag.attr('height');
                        _data.svgDefault.viewBox = svgTag.attr('viewBox');

                        if(_data.svgDefault.width && _data.svgDefault.height){
                            _data.svgDefault.width   = parseFloat(_data.svgDefault.width.replace(/px/g,''));
                            _data.svgDefault.height  = parseFloat(_data.svgDefault.height.replace(/px/g,''));
                            _data.svgDefault.viewBox = _data.svgDefault.viewBox ? _data.svgDefault.viewBox.split(' ') : [0,0, _data.svgDefault.width, _data.svgDefault.height];
                        }else if(_data.svgDefault.viewBox){
                            _data.svgDefault.viewBox = _data.svgDefault.viewBox.split(' ');
                            _data.svgDefault.width   = parseFloat(_data.svgDefault.viewBox[2]);
                            _data.svgDefault.height  = parseFloat(_data.svgDefault.viewBox[3]);
                        }else{
                            alert('MapSVG needs width/height or viewBox parameter to be present in SVG file.')
                            return false;
                        }
                        // Get geo-coordinates view  box from SVG file
                        var geo               = svgTag.attr("mapsvg:geoViewBox") || svgTag.attr("mapsvg:geoviewbox");
                        if (geo) {
                            geo = geo.split(" ");
                            if (geo.length == 4){
                                _data.mapIsGeo = true;
                                _data.geoCoordinates = true;

                                _data.geoViewBox = {leftLon: parseFloat(geo[0]),
                                    topLat: parseFloat(geo[1]),
                                    rightLon: parseFloat(geo[2]),
                                    bottomLat: parseFloat(geo[3])
                                };
                                _data.mapLonDelta = _data.geoViewBox.rightLon - _data.geoViewBox.leftLon;
                                _data.mapLatBottomDegree = _data.geoViewBox.bottomLat * 3.14159 / 180;

                            }

                        }

                        $.each(_data.svgDefault.viewBox, function(i,v){
                            _data.svgDefault.viewBox[i] = parseFloat(v);
                        });

                        _data._viewBox  = (_data.options.viewBox.length==4 && _data.options.viewBox ) || _data.svgDefault.viewBox;

                        $.each(_data._viewBox, function(i,v){
                            _data._viewBox[i] = parseFloat(v);
                        });

                        svgTag.attr('preserveAspectRatio','xMidYMid meet');
                        svgTag.removeAttr('width');
                        svgTag.removeAttr('height');

                        //// Adding moving sticky draggable image on background
                        //if(_data.options.scrollBackground)
                        //    _data.background = _data.R.rect(_data.svgDefault.viewBox[0],_data.svgDefault.viewBox[1],_data.svgDefault.viewBox[2],_data.svgDefault.viewBox[3]).attr({fill: _data.options.colors.background});

                        _this.reloadRegions();

                        _data.$scrollpane.append(svgTag);


                        // Set size
                        _this.setSize(_data.options.width, _data.options.height, _data.options.responsive);


                        if(_data.options.disableAll){
                            _this.setDisableAll(true);
                        }



                        // Set viewBox
                        _this.setViewBox(_data._viewBox);
                        _this.setResponsive(_data.options.responsive,true);

                        // SET Gauge colors
                        _this.setGauge();

                        // If there are markers, put them to the map
                        var markers = _data.options.markers || _data.options.marks || [];
                        _this.setMarkers(markers);

                        _this.setScroll(_data.options.scroll, true);

                        _this.setZoom(_data.options.zoom);
                        _this.setGoogleMaps();

                        // _this.setViewBox([0,0,_data.svgDefault.viewBox[0]*2+_data.svgDefault.viewBox[2],_data.svgDefault.viewBox[1]*2+_data.svgDefault.viewBox[3]]);


                        // Set tooltips
                        // tooltipsMode is deprecated, need this for backward compatibility
                        if (_data.options.tooltipsMode)
                            _data.options.tooltips.mode = _data.options.tooltipsMode;
                        _this.setTooltips(_data.options.tooltips);

                        // Set popovers
                        // popover is deprecated (now it's popoverS), need this for backward compatibility
                        if (_data.options.popover)
                            _data.options.popovers = _data.options.popover;
                        _this.setPopovers(_data.options.popovers);

                        if(_data.options.cursor)
                            _this.setCursor(_data.options.cursor);


                        $(document).ready(function(){
                            _this.setMenu();
                            _this.setMenuMarkers();

                        });

                        /* EVENTS */

                        _this.setEventHandlers();


                        loading.hide();


                        setTimeout(function(){
                            _this.updateSize();
                            setTimeout(function() {
                                _data.$map.removeClass('no-transitions');
                            },200);
                        },100);

                        // Select region from URL
                        if( match = RegExp('[?&]mapsvg_select=([^&]*)').exec(window.location.search)){
                            var select = decodeURIComponent(match[1].replace(/\+/g, ' '));
                            _this.selectRegion(select);
                        }



                        if(_data.options.afterLoad)
                            _data.options.afterLoad.call(_this);

                });// end of AJAX

                return _this;

            } // end of init

        }; // end of methods

        var _this = this.methods;



    }; // end of mapSVG class


    /** $.FN **/
    $.fn.mapSvg = function( opts ) {

        var id = $(this).attr('id');

        if(typeof opts == 'object' && instances[id] === undefined){
            instances[id] = new mapSVG(this, opts);
            return instances[id].methods.init(opts, this);
        }else if(instances[id]){
            return instances[id].methods;
        }else{
            return instances;
        }



    }; // end of $.fn.mapSvg

})( jQuery );


// Tiny color
// MapSVG.tinycolor v1.3.0
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function(Math) {

    var trimLeft = /^\s+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        mathRound = Math.round,
        mathMin = Math.min,
        mathMax = Math.max,
        mathRandom = Math.random;

    function tinycolor (color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
            return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color,
            this._r = rgb.r,
            this._g = rgb.g,
            this._b = rgb.b,
            this._a = rgb.a,
            this._roundA = mathRound(100*this._a) / 100,
            this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    }

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
            return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            //http://www.w3.org/TR/AERT#color-contrast
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        getLuminance: function() {
            //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            var rgb = this.toRgb();
            var RsRGB, GsRGB, BsRGB, R, G, B;
            RsRGB = rgb.r/255;
            GsRGB = rgb.g/255;
            BsRGB = rgb.b/255;

            if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
            if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
            if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
            return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100*this._a) / 100;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
            "hsv("  + h + ", " + s + "%, " + v + "%)" :
            "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
            "hsl("  + h + ", " + s + "%, " + l + "%)" :
            "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
            "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
            "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
            "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
            "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },
        clone: function() {
            return tinycolor(this.toString());
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
    function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b and a are contained in the set [0, 255]
// Returns an 8 character hex
    function rgbaToHex(r, g, b, a) {

        var hex = [
            pad2(convertDecimalToHex(a)),
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        return hex.join("");
    }

// `equals`
// Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };

    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (hsl.h + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

// Utility Functions
// ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
    };

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
    tinycolor.isReadable = function(color1, color2, wcag2) {
        var readability = tinycolor.readability(color1, color2);
        var wcag2Parms, out;

        out = false;

        wcag2Parms = validateWCAG2Parms(wcag2);
        switch (wcag2Parms.level + wcag2Parms.size) {
            case "AAsmall":
            case "AAAlarge":
                out = readability >= 4.5;
                break;
            case "AAlarge":
                out = readability >= 3;
                break;
            case "AAAsmall":
                out = readability >= 7;
                break;
        }
        return out;

    };

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
    tinycolor.mostReadable = function(baseColor, colorList, args) {
        var bestColor = null;
        var bestScore = 0;
        var readability;
        var includeFallbackColors, level, size ;
        args = args || {};
        includeFallbackColors = args.includeFallbackColors ;
        level = args.level;
        size = args.size;

        for (var i= 0; i < colorList.length ; i++) {
            readability = tinycolor.readability(baseColor, colorList[i]);
            if (readability > bestScore) {
                bestScore = readability;
                bestColor = tinycolor(colorList[i]);
            }
        }

        if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
            return bestColor;
        }
        else {
            args.includeFallbackColors=false;
            return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
        }
    };


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

// Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

// Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

// Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

// Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

// Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

// Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

// Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

// Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

// Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
// Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            CSS_UNIT: new RegExp(CSS_UNIT),
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
    function isValidCSSUnit(color) {
        return !!matchers.CSS_UNIT.exec(color);
    }

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    function validateWCAG2Parms(parms) {
        // return valid WCAG2 parms for isReadable.
        // If input parms are invalid, return {"level":"AA", "size":"small"}
        var level, size;
        parms = parms || {"level":"AA", "size":"small"};
        level = (parms.level || "AA").toUpperCase();
        size = (parms.size || "small").toLowerCase();
        if (level !== "AA" && level !== "AAA") {
            level = "AA";
        }
        if (size !== "small" && size !== "large") {
            size = "small";
        }
        return {"level":level, "size":size};
    }

// Node: Export function
    if (typeof module !== "undefined" && module.exports) {
        module.exports = tinycolor;
    }
// AMD/requirejs: Define the module
    else if (typeof define === 'function' && define.amd) {
        define(function () {return tinycolor;});
    }
// Browser: Expose to window
    else {
        MapSVG.tinycolor = tinycolor;
    }

})(Math, MapSVG);

