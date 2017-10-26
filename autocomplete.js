/*
=====================
Auto Complete Feature
=====================
configuration_object: {
    textField: (string) id of the textfield
    cacheResult: (boolean) save the result of search
    showAllResult: (boolean) filter the result based on input
    events: (object) list of events to bind with list
    getEntity: (function) [optional] extra on server filter
    getSuggestion: (function) server method to retrieve suggestion result
 }

How to use:
1. Include this script into html
2. Create configuration object
3. Run init() in window.onload event. Example:
        window.onload = function() {
            var ac = autoComplete(configuration);
            ac.init();
        };
*/

var autoComplete = function(configObj) {
    // Initialization
    var selectionContainer, listContainer;
    var config = configObj;
    var textField = document.getElementById(config.textField);
    var cacheResult = config.cacheResult;
    var showAllResult = config.showAllResult;
    var events = config.events || {};

    // Functions list
    // E.g.: #server(%BI.iKnow.iKnow.GetSelectedIds(elem.value, elem.data_selectedData.connectedIds))#;
    var fgetEntity = config.getEntity;
    // E.g.: #server( % BI.iKnow.iKnow.GetSuggestionTerm(val, selectedId))#;
    var fgetSuggestion = config.getSuggestion;

    var init = function() {
        if (textField == null) {
            return false;
        }

        /*if ((fgetEntity && typeof(fgetEntity) == "function") == false) {
            return false;
        }*/

        if ((fgetSuggestion && typeof(fgetSuggestion) == "function") == false) {
            return false;
        }

        generateDiv();
        var toggleDisplay = toggleOverlay(selectionContainer);
        addEvent("keyup", textField, showSelection);
        addEvent("click", document, toggleDisplay);
        addEvent("keydown", document, moveUpandDown);
        window.onresize = function() {
            resizeList();
        };
        return true;
    };

    /** Generate dropdown selection **/
    var generateDiv = function() {
        selectionContainer = document.createElement("div");
        selectionContainer.id = "overSel";
        listContainer = document.createElement("ul");
        listContainer.id = "selList";
        selectionContainer.appendChild(listContainer);
        document.body.appendChild(selectionContainer);
    };

    /**Timeout Management**/
    var timeoutId = 0;
    var setTheTimeout = function(f) {
        timeoutId = window.setTimeout(function() {
            f(textField);
        }, 500);
    };

    var clearTheTimeout = function() {
        window.clearTimeout(timeoutId);
    };

    /* Toggle Selection */
    var showSelection = function showSelection() {

        // In case manual entered query equals to result query
        var appendManuallySelectedData = function() {
            var data = entityIds.getAll();
            var txt = textField.value;
            var matchPattern = function(item) {
                var patt = new RegExp("^" + txt + "$", "i");
                return patt.test(item.fullText);
            };
            var foundData = data.find(matchPattern);
            textField.data_selectedData = typeof(foundData) == "undefined" ? null : foundData;
        };

        clearTheTimeout();
        var entityList, objToAppend;
        var UP = 38,
            DOWN = 40,
            ENTER = 13,
            BACKSPACE = 8,
            DELETE = 46;
        var event = event || window.event;

        // Timeout will only be triggered if other than these 3 keys are pressed
        var pressedKey = getKey(event);
        if (pressedKey == UP || pressedKey == DOWN || pressedKey == ENTER) {
            return;
        } else {
            if (pressedKey == DELETE || pressedKey == BACKSPACE) {
                if (textField.value == "") {
                    textField.data_selectedData = null;
                    selectionContainer.style.display = "none";
                    return;
                }
                // now go find new entity
                if (textField.data_selectedData && textField.data_selectedData.connectedIds) {
                    entityList = fgetEntity(textField.value, textField.data_selectedData.connectedIds);
                    textField.data_selectedData.connectedIds = entityList;
                }
            } else { // type forward
                appendManuallySelectedData();
            }
            timeoutId = setTheTimeout(genDropList);
        }
    };

    // item structure { id,value,type,fullText }
    var entityIds = function() {
        var idList = [];

        var getFullObj = function() {
            return idList;
        };

        var getIds = function() {
            return idList.map(function(i) {
                return i.id;
            });
        };

        var addId = function(itemToAdd) {
            var idx = ifExist(itemToAdd.value);
            if (idx == -1) {
                idList.push(itemToAdd);
            }
        };

        var removeId = function(itemToRemove) {
            var idx = ifExist(itemToRemove);
            if (idx != -1) {
                idList.splice(idx, 1);
            }
        };

        var ifExist = function(a) {
            var condition = function(b) {
                var strToFind = new RegExp(b, 'i');
                return function(item) {
                    return strToFind.test(item.value);
                };
            }(a);

            return idList.findIndex(condition);
        };

        var resetNAdd = function(array) {
            idList = [];
            idList = array;
        };

        var removeAll = function() {
            idList = [];
        };

        return {
            getAll: getFullObj,
            getIds: getIds,
            add: addId,
            remove: removeId,
            setAll: resetNAdd,
            removeAll: removeAll
        };
    }();

    // Use to filter results
    var filterText = function filterText(data, f) {
        var txt = textField.value.trim();
        var matchPattern = function(item) {
            var patt = new RegExp("^" + txt + "\s?", "i");
            if (f && typeof(f) == "function") {
                return f(item);
            } else {
                return patt.test(item.fullText);
            }
        };
        return data.filter(matchPattern);
    };

    var genDropList = function(elem) {
        var buildList = function(txtRef, val) {
            // Remove all children            
            while (listContainer.firstChild) { listContainer.removeChild(listContainer.firstChild); }

            var selectedId = function getSelectedEntity() {
                if (textField.data_selectedData && textField.data_selectedData.connectedIds) {
                    return textField.data_selectedData.connectedIds;
                }
                return "";
            }();

            // Get data from server
            var strData = fgetSuggestion(val, selectedId);
            var data = JSON.parse(strData);

            if (cacheResult == true) {
                if (data.length == 0) {
                    // only filter based on entered input
                    data = filterText(entityIds.getAll());
                } else {
                    entityIds.setAll(data);
                }
            }

            /*Build list*/
            if (data && data.length > 0) {
                if (showAllResult) {
                    data = filterText(data);
                }
                data.forEach(function(item) {
                    listContainer.appendChild(genChildren(item));
                });
                return true;
            } else {
                return false;
            }
        };

        var show = buildList(textField, textField.value);
        if (show) {
            resizeOverlay(elem);
        } else {
            selectionContainer.style.display = "none";
        }
    };

    var genChildren = function(data) {
        // for clearing selected highlight in list
        var clearfSelect = function() {
            var rowArray = listContainer.children;
            Array.prototype.forEach.call(rowArray, function(row, rowIdx) {
                row.className = "";
            });
        };

        var li = document.createElement("li");
        li.innerHTML = data.fullText;

        // Setting data to element
        var bindData = function(e, data) {
            for (var d in data) {
                e["data_" + d] = data[d];
            }
        };

        // Setting event to element
        var bindEvent = function(e, events) {
            var defaultMOver = function(e) {
                var thisElement = e;
                return function() {
                    clearfSelect();
                    thisElement.className = "fSelect";
                };
            };

            var defaultClick = function(e) {
                var thisElement = e;
                return function() {
                    textField.value = e.data_fullText;
                };
            };

            for (var ev in events) {
                addEvent(ev, e, events[ev]);
            }

            if (e.onmouseover == null) {
                e.onmouseover = defaultMOver(e);
            }

            if (e.onclick == null) {
                e.onclick = defaultClick(e);
            }
        };

        bindData(li, data);
        bindEvent(li, events);
        return li;
    };

    var resizeOverlay = function() {
        var setListPos = function() {
            // Adjust the position of list according to page height
            var overlay = selectionContainer;

            // Get max height of the page
            var bodyHeight = function getBodyHeight() {
                var body = document.body,
                    html = document.documentElement;
                var height = Math.max(body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight);
                return height;
                //return body.offsetHeight;
            };

            // Calculate list height
            var listH = function calcListH() {
                var list = listContainer;
                var numOfChild = (list.children) ? list.children.length : 0;

                // Get an element's height in the list
                var childH = function getChildHeight() {
                    var fChild = list.firstChild;
                    return fChild.offsetHeight;
                };

                return {
                    "childH": childH(),
                    "number": numOfChild,
                    "totalH": numOfChild * childH()
                };
            };

            // Check remaining height under element
            var elemProp = textField.getBoundingClientRect();
            var pageH = bodyHeight();
            var remainingB = pageH - elemProp.bottom;

            // Add another 2px to include padding & border
            var elemTop = remainingB + (elemProp.bottom - elemProp.top) + 2;

            // If less than move up, but up to specific height only, then overflow
            var listDetail = listH();
            var listHeight = listDetail.totalH + 2;

            // Will push the list down if list height is at least 6 child elements
            if (remainingB >= listDetail.childH * 6) {
                // Subtract 2 because of border & padding
                overlay.style.top = (elemProp.bottom - 2) + "px";
                overlay.style.height = (listHeight > remainingB) ? remainingB + "px" : listHeight + "px";
                //overlay.style.overflow = "auto";
            }
            // If cannot fit more than 6 children, then push up
            else if (listHeight > remainingB) {
                overlay.style.top = "";
                overlay.style.bottom = elemTop + "px";
                if (listHeight > elemProp.top) {
                    overlay.style.height = elemProp.top + "px";
                } else {
                    // If less than remaining top height, then list should have relative size to its content
                    overlay.style.height = listHeight + "px";
                }

            }
            // Default behaviour
            else {
                // Subtract 2 because of border & padding
                overlay.style.top = (elemProp.bottom - 2) + "px";
                overlay.style.height = listHeight + "px";
            }
        };

        var selDiv = selectionContainer;
        var obj = textField.getBoundingClientRect();

        selDiv.style.width = (obj.right - obj.left) + "px";
        //selDiv.style.width = (obj.right - obj.left - 2) + "px"; //Minus 2 to fit with the textbox
        selDiv.style.left = (obj.left) + "px";
        selDiv.style.display = "block";

        setListPos();
    };

    /**Event Management**/
    /*Event Listener*/
    var addEvent = function(evnt, elem, func) {
        if (elem.addEventListener) // W3C DOM
            elem.addEventListener(evnt, func, false);
        else if (elem.attachEvent) { // IE DOM
            elem.attachEvent("on" + evnt, func);
        } else { // No much to do
            elem["on" + evnt] = func;
        }
    };

    var getKey = function(e) {
        if (window.event) { return e.keyCode; } // IE
        else if (e.which) { return e.which; } // Netscape/Firefox/Opera
    };

    var checkStyle = function(element) {
        return (element.currentStyle) ? element.currentStyle : getComputedStyle(element, null);
    };

    var toggleOverlay = function(container) {
        var overlay = container;
        return function toggleOverlay(event) {
            event = event || window.event;
            var elemId = event.srcElement.id;

            var style = checkStyle(overlay);
            if (style.display === "block") {
                overlay.style.display = "none";
            }
        };
    };

    var moveUpandDown = function(event) {
        event = event || window.event;
        var UP = 38,
            DOWN = 40,
            ENTER = 13,
            BACKSPACE = 8,
            DELETE = 46;
        var overlay = selectionContainer;

        // Find highlighted option 
        var getSelected = function getHL(dataOnly) {
            var i = 0;
            var list = listContainer.childNodes;
            var listLen = list.length;
            var returnObj = {};
            if (listLen !== 0) {
                for (i; i < listLen; i++) {
                    if (list[i].className === "fSelect") {
                        if (dataOnly) {
                            for (var prop in list[i]) {
                                returnObj[prop.split('_')[1]] = list[i][prop];
                            }
                            return returnObj;
                        }
                        return list[i];
                    }
                }
            }
            return null;
        };

        // Find highlighted option 
        var getEqualsText = function getEqualsText(textToMatch) {
            var i = 0;
            var list = listContainer.childNodes;
            var listLen = list.length;
            var returnObj;
            if (listLen !== 0) {
                for (i; i < listLen; i++) {
                    if (list[i].data_fullText === textToMatch) {
                        for (var prop in list[i]) {
                            returnObj[prop.split('_')[1]] = list[i][prop];
                        }
                        return returnObj;
                    }
                }
            }
            return null;
        };

        var setFirst = function setFirstinList() {
            var fChild = listContainer.firstChild;
            fChild.className = "fSelect";
        };

        // Check if scrollIntoView valid
        var scrollViewState = function getScrollViewState(elem) {
            var overlayProp = overlay.getBoundingClientRect(),
                elemProp = elem.getBoundingClientRect();

            if (elemProp.top < overlayProp.top) {
                return true;
            } else if (elemProp.bottom > overlayProp.bottom) {
                return false;
            } else {
                return null;
            }
        };

        // Switch highlight according to key pressed
        var move = function moveHL(elem, direction, txtElem) {
            var sibling;
            var setHL = function setHL() {
                var state = scrollViewState(sibling);
                sibling.className = "fSelect";
                elem.className = "";
                state = null;
                if (state != null) {
                    sibling.scrollIntoView(state);
                }
            };
            if (direction === "up") {
                sibling = elem.previousSibling;
                if (sibling) {
                    setHL();
                }
            } else if (direction === "down") {
                sibling = elem.nextSibling;
                if (sibling) {
                    setHL();
                }
            } else {
                // do nothing
            }
        };

        var setText = function setText(elemToSet) {
            var data = getSelected(true);
            elemToSet.data_selectedData = data;
            elemToSet.focus();
            // to adjust the cursor to the end of text
            elemToSet.value = "";
            elemToSet.value = data.fullText;
        };

        var qryBox = textField;
        var style = checkStyle(overlay);
        var pressedKey = getKey(event);
        var hlElem, hlElemData;
        if (style.display === "block") {
            hlElem = getSelected(false);
            if (hlElem && pressedKey === UP) {
                move(hlElem, "up");
                setText(qryBox, hlElemData);
            }
            if (hlElem && pressedKey === DOWN) {
                move(hlElem, "down");
                setText(qryBox, hlElemData);
            }
            if (hlElem && pressedKey === ENTER) {
                setText(qryBox, hlElemData);
                search();
            }
            if (!hlElem && (pressedKey === UP || pressedKey === DOWN)) {
                setFirst();
                hlElem = getSelected(false);
                setText(qryBox, hlElemData);
            }
            // set matching text to options
            if (!hlElem && getEqualsText(qryBox.value) != null) {
                console.log(getEqualsText(qryBox.value));
                console.log('asdasd');
            }
        }
    };

    var resizeList = function() {
        var style = checkStyle(selectionContainer);
        if (style.display === "block") {

        }
    };

    return {
        init: init
    };
};