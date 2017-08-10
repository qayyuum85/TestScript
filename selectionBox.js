function queryServer(query, type) {
  return #server(% BI.Graph.Connector.Query(query, type))#;
}

var data;
function submitQry() {
  var errStr;
  var query = $("#txtQry").val();
  var result = queryServer(query, "graph");
  var res = JSON.parse(result);
  if (res.errors.length > 0) {
    res.errors.forEach(function(o) {
      errStr += "Status Code: " + o.code + "\n" + "Error Message: " + o.message + "\n";
    });
    $("#resultBox").text(errStr);
    return;
  }
  $("#resultBox").text(result);
  var data = convert(result);
  buildGraph(data);
}

function edgesColor(c) {
  var colorTemplate = {
    "CALLS": "#ff0000",
    "FRIEND_OF": "#27ae60",
    "WORKS_AT": "#dc7633"
  };

  return colorTemplate[c];
}

function nodesColor(c) {
  var colorTemplate = {
    "Person": "#00FF00",
    "Company": "#FFC0CB",
    "BankAccount": "#85c1e9",
    "CreditCard": "#bb8fce",
    "Loan": "#FFC300"
  };

  return colorTemplate[c];
}

var nodes,
  links,
  nodeIds,
  dataSetNodes,
  dataSetEdges;

function convert(stringJSON) {

  nodes = [],
  links = [],
  nodeIds = [];

  var res = JSON.parse(stringJSON);
  convertData(res.results[0].data);
  dataSetNodes = new vis.DataSet(nodes);
  dataSetEdges = new vis.DataSet(links);

  var viz = {
    nodes: dataSetNodes,
    edges: dataSetEdges
  };

  return viz;
}

function convertData(res, getEnterSet) {
  var newNodes = [],
    newLinks = [];

  var idIndex = function idIndex(a, id) {
    for (var i = 0; i < a.length; i++) {
      if (a[i].id == id)
        return id;
      }
    return null;
  };

  var hasLinks = function hasLinks(a, id) {
    for (var j = 0; j < a.length; j++) {
      if (a[j].id == id)
        return false;
      }
    return true;
  };

  res.forEach(function(row) {

    // Get unique nodes
    row.graph.nodes.forEach(function(n) {
      if (idIndex(nodes, n.id) == null) {
        var currNode = {
          id: parseInt(n.id),
          label: n.properties.name || n.properties.bank,
          title: n.labels[0],
          color: nodesColor(n.labels[0]),
          _att1: "asdadasd"
        };
        nodes.push(currNode);
        newNodes.push(currNode);
        nodeIds.push(parseInt(n.id));
      }
    });

    // Make sure only unique relationship exists
    var filteredRelationship = row.graph.relationships.filter(function(r) {
      return (hasLinks(links, r.id));
    });

    // Convert found, unique relationships to edges object
    var mappedRelationship = filteredRelationship.map(function(r) {
      var currLink = {
        from: r.startNode,
        to: r.endNode,
        id: parseInt(r.id),
        label: r.type,
        font: {
          align: 'top'
        },
        color: edgesColor(r.type)
      };
      return currLink;
    });
    links = links.concat(mappedRelationship);
    newLinks = newLinks.concat(mappedRelationship);
  });

  if (getEnterSet) {
    return {nodes: newNodes, edges: newLinks};
  }
}

var network;
function buildGraph(jsonData) {

  // create a network
  var container = document.getElementById('vis');

  // provide the data in the vis format
  var data = {
    nodes: jsonData.nodes,
    edges: jsonData.edges
  };
  var options = {
    autoResize: true,
    width: "100%",
    height: "480px",
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1,
          type: 'arrow'
        }

      },
      length: 200,
      physics: true,
      width: 3
    },
    nodes: {
      borderWidth: 2,
      font: {
        size: 20
      },
      shape: 'circle'
    }
  };

  // initialize your network!
  if (typeof(network) !== "undefined") {
    network.destroy();
  }

  network = new vis.Network(container, data, options);
  network.on("click", function(params) {
    // TO DO : show properties of selected node
  });

  network.on("doubleClick", extendGraph);
}

function showAllNodes() {
  var resultStr = #server(% BI.Graph.BasicQueries.GetAllNodesandRelationships())#;
  var data = convert(resultStr);
  buildGraph(data);
}

function findShortestPath() {
  var selectedNodes = nodeList();
  if (selectedNodes.length != 2) {
    alert("Please choose 2 nodes only");
    return;
  }

  var resultStr = #server(% BI.Graph.BasicQueries.GetShortestPath(selectedNodes[0], selectedNodes[1]))#;
  var data = convert(resultStr);
  buildGraph(data);
}

function getDistinctNodeLabels() {
  var result = JSON.parse(#server(% BI.Graph.BasicQueries.GetAllNodesLabel())#);

  if (result.errors.length > 0) {
    console.log(result.errors);
    return;
  }

  var labels = result.results[0].data;
  populateDropDown(labels, "#drpNodeType");
}

function getNodesbyType() {
  var nodesVal = $("#drpNodeType").val();
  if (nodesVal == "") {
    return;
  }

  var result = JSON.parse(#server(% BI.Graph.BasicQueries.GetNodesbyLabelType(nodesVal, "name"))#);

  if (result.errors.length > 0) {
    console.log(result.errors);
    return;
  }

  var nodes = result.results[0].data;
  //populateDropDown(nodes, "#drpNodes");
  return nodes;
}

function populateDropDown(array, elem) {
  var clearOptions = function clearOptions(e) {
    $(e).find("option").remove().end().append("<option value=''></option>");
  };

  clearOptions(elem);
  array.forEach(function(item) {
    var val = item.row[0];
    $(elem).append($('<option>', {
      value: val,
      text: val
    }));
  });
}

var toArray = function toArray(obj) {
  var array = [];
  // iterate backwards ensuring that length is an UInt32
  for (var i = obj.length >>> 0; i--;) {
    array[i] = obj[i];
  }
  return array;
};

var currNodeList;
function getNodes() {
  var nodeType = $("#drpNodeType").val();
  if (nodeType == "") {
    return;
  }

  var nodeList = getNodesbyType();

  // Save nodeIds in external array
  currNodeList = nodeList.map(function(obj) {
    return parseInt(obj.row[1]); // obj.row[1] contains id of the node
  });

  var getSelected = function getSelected() {
    var selectedArr = [];
    var selDiv = document.getElementById("nodeSelected");
    Array.prototype.forEach.call(selDiv.children, function(elem, elemIdx) {
      var batchId = parseInt(elem.id.split("||")[1]);
      selectedArr.push(batchId);
    });
    return selectedArr;
  };

  var td = document.getElementById("nodeList");

  var clearHl = function clearHl(elem) {
    var parentId = elem.parentNode.id;
    var otherParent;
    var remClass = function remClass(parent) {
      //var selectedElem = getElementsByClassName("selected", null, parent);
      var selectedElem = $(".selected");
      var arrayOfElem = toArray(selectedElem);
      arrayOfElem.forEach(function(obj, objIdx) {
        dehighlight(obj);
      });
    };

    //Qayyuum 03032016 - Remove existing highlighted element
    remClass(elem.parentNode);

    if (parentId === "nodeSelected") {
      otherParent = document.getElementById("nodeList");
      remClass(otherParent);
      btnDirection("&lt;");
    } else if (parentId === "nodeList") {
      otherParent = document.getElementById("nodeSelected");
      remClass(otherParent);
      btnDirection("&gt;");
    } else {
      // do nothing
    }
  };

  var opt = function createSelection(o, order) {
    var div = document.createElement("div");
    div.innerHTML = o.name;
    div.id = "nodeDiv||" + o.id;
    div.order = order;
    div.onclick = function() {
      var elem = div;
      return function() {
        clearHl(elem);
        hl(elem);
      };
    }();
    div.ondblclick = function() {
      var elem = div;
      return function() {
        swapCol(elem);
      };
    }();
    return div;
  };

  while (td.firstChild) {
    td.removeChild(td.firstChild);
  }

  var selectedNodes = getSelected();

  var convertObj = function(o) {
    return {id: o.row[1], name: o.row[0]};
  };

  nodeList.forEach(function(item, itemIdx) {
    var row,
      currObj;
    // Exclude items that have been selected previously
    if (selectedNodes.indexOf(parseInt(item.row[1])) == -1) {
      currObj = convertObj(item);
      row = opt(currObj, itemIdx);
      td.appendChild(row);
    }
  });
}

var hl = function toggleHlight(elem) {
  if (elem.className.match(/(?:^|\s)selected(?!\S)/g)) {
    elem.className = elem.className.replace(/(?:^|\s)selected(?!\S)/g, "");
  } else {
    elem.className += " selected";
  }
};

var dehighlight = function dehighlight(elem) {
  if (elem.className.match(/(?:^|\s)selected(?!\S)/g)) {
    elem.className = elem.className.replace(/(?:^|\s)selected(?!\S)/g, "");
  }
}

var btnDirection = function btnDirection(direction) {
  var btn = document.getElementById("btnMove");
  btn.innerHTML = direction;
};

var btnDirectionAll = function btnDirectionAll(direction) {
  var btn = document.getElementById("btnMoveAll");
  btn.innerHTML = direction;
};

var swapCol = function swapCol(elem) {
  var temp,
    sel;
  var parentClassId = elem.parentNode.id;
  var contLen = function contLen(id) {
    var child = document.getElementById(id).children;
    return child.length;
  };

  dehighlight(elem);
  temp = elem.parentNode.removeChild(elem);
  if (parentClassId === "nodeSelected") {
    sel = document.getElementById("nodeList");
    // Add back to the list if the batch year is same
    if (currNodeList.indexOf(parseInt(temp.id.split("||")[1])) != -1) {
      sel.appendChild(temp);
    }
    // Update button direction
    if (contLen("nodeSelected") === 0) {
      btnDirection("&gt;");
      btnDirectionAll("&gt;&gt;");
    }
  } else if (parentClassId === "nodeList") {
    sel = document.getElementById("nodeSelected");
    sel.appendChild(temp);
    if (contLen("nodeList") === 0) {
      btnDirection("&lt;");
      btnDirectionAll("&lt;&lt;");
    }
  } else {
    // do nothing
  }
};

function moveSelection(selectAll) {
  var getDirection = function getDirection() {
    var btn = document.getElementById("btnMove");
    return btn.innerHTML;
  };

  var getHl = function getHl(parent) {
    var selectedElem = $(".selected");
    var arrayOfElem = toArray(selectedElem);
    return arrayOfElem;
  };

  var moveSelected = function moveSelected(r) {
    r.forEach(function(i, idx) {
      swapCol(i);
    });
  };

  var getParent = function getParent(direction) {
    if (direction === "&lt;") {
      return document.getElementById("nodeSelected");
    } else if (direction === "&gt;") {
      return document.getElementById("nodeList");
    } else {
      alert("Cannot found any");
    }
  };

  var getSelected = function getSelected(selectAll) {
    var direction = getDirection(),
      parent = getParent(direction);
    var collection,
      child;

    if (selectAll && selectAll == 1) {
      child = parent.children;
      collection = toArray(child);
    } else {
      collection = getHl(parent);
    }

    moveSelected(collection);
  }

  getSelected(selectAll);
}

var nodeList = function getSelectedNodeList() {
  var c = $("#nodeSelected");
  if (c.children.length == 0) { // in case nothing is selected
    c = $("#nodeList");
  };

  var selectedNodeIds = [];
  c.children().each(function() {
    var nodeId = $(this).attr("id").split("||")[1];
    selectedNodeIds.push(nodeId);
  });

  return selectedNodeIds;
};

function showGraphbySelectedNodes() {
  var strNodeList = nodeList().join(",");
  var resultStr = #server(% BI.Graph.BasicQueries.GetGraphByNodeCollection(strNodeList))#;

  var result = JSON.parse(resultStr);
  if (result.errors.length > 0) {
    console.log(result.errors);
    return;
  }

  $("#resultBox").text(result);
  var data = convert(resultStr);
  buildGraph(data);
}

function extendGraph(params) {
  // Get nodes to exclude
  var getExcludeNode = function getExcludeNode(id) {
    var itemToExclude = links.filter(function(item) {
      return item.from == id || item.to == id;
    });
    return itemToExclude;
  };

  var getExistingNode = function getExistingNode(excludeNode) {
    var filteredNodes = nodes.filter(function(i) {
      return i.id != excludeNode;
    });
    return filteredNodes.map(function(i) {
      return i.id;
    });
  };

  var excludeObj,
    excludeIds,
    results,
    data;
  var node = this.getNodeAt(params.pointer.DOM);
  var existingNodes = getExistingNode(node);

  if (node != undefined) {
    excludeObj = getExcludeNode(node);
    excludeIds = excludeObj.map(function(obj) {
      return obj.from == node
        ? obj.to
        : obj.from;
    });

    results = JSON.parse(#server(% BI.Graph.BasicQueries.ExtendGraph(node, excludeIds.join(","), existingNodes.join(",")))#);
    if (results.errors.length > 0) {
      console.log(result.errors);
      return;
    }

    // Need to iterate since this query has multiple statements
    results.results.forEach(function(result) {
      data = convertData(result.data, 1);
      dataSetNodes.update(data.nodes);
      dataSetEdges.update(data.edges);
    });
  }
}
