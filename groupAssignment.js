function drawDashboard(){
  var genCharts = function genCharts(){
    var drawGID = function drawGID() {
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/17faaJlkN3H3OeGz2k-fdHAJp_beJFBC9gRCSuY-eu9E/gviz/tq?range=A1:F12');
      query.send(responseHandler);
    };

    var responseHandler = function handleQueryResponse(response) {
      var data;
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return null;
      }
      else {
        data = response.getDataTable();
        overallChart(data);
      }
    };

    var overallChart = function overallChart(data){
      genTable(data);
      genMap(data);
      genPieChart(data);
      genColchart(data);
    };

    // Query Spreadsheet for dengue in week
    var drawGIDDengue = function drawGIDDengue(){
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/17faaJlkN3H3OeGz2k-fdHAJp_beJFBC9gRCSuY-eu9E/gviz/tq?gid=332701110&range=A1:L54');
      query.send(responseHandler2);
    };

    var responseHandler2 = function handleQueryResponse(response) {
      var data;
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return null;
      }
      else {
        data = response.getDataTable();
        dengueTableChart(data);
        //dengueChart(data);
      }
    };

    // Query Spreadsheet for hemorrhagic dengue in week
    var drawGIDDengueH = function drawGIDDengueH(){
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/17faaJlkN3H3OeGz2k-fdHAJp_beJFBC9gRCSuY-eu9E/gviz/tq?gid=270303305&range=A1:L54');
      query.send(responseHandlerH);
    };

    var responseHandlerH = function handleQueryResponse(response) {
      var data;
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return null;
      }
      else {
        data = response.getDataTable();
        dengueChartH(data);
      }
    };

    // Query Spreadsheet for dengue death in week
    var drawGIDDengueD = function drawGIDDengueD(){
      var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/17faaJlkN3H3OeGz2k-fdHAJp_beJFBC9gRCSuY-eu9E/gviz/tq?gid=771069282&range=A1:L54');
      query.send(responseHandlerD);
    };

    var responseHandlerD = function handleQueryResponse(response) {
      var data;
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return null;
      }
      else {
        data = response.getDataTable();
        dengueChartD(data);
      }
    };

    var dengueChartH = function dengueChartH(data){
      var container = document.getElementById('linechartDengueH_div');
      var title = 'Weekly Dengue Hemorrhagic Cases in KL';
      dengueColChart(data, container, title);
    };
    var dengueChartD = function dengueChartD(data){
      var container = document.getElementById('linechartDengueD_div');
      var title = 'Weekly Dengue Death Cases in KL';
      dengueColChart(data, container, title);
    };

    drawGID();
    drawGIDDengue();
    drawGIDDengueH();
    drawGIDDengueD();
  };

  var genTable = function genTable(data){
    var tableView = new google.visualization.DataView(data);
    tableView.setColumns([0,3,4,5]);

    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(tableView, {showRowNumber: true, width: 800, height: '100%'});

    google.visualization.events.addListener(table, 'select', function tabSelect() {
      var selection = table.getSelection();
      if (selection){
        console.log(selection);
      }
    });
  };

  var genMap = function genMap(data) {
    var mapView = new google.visualization.DataView(data);
    mapView.setColumns([1, 2]);

    var map = new google.visualization.Map(document.getElementById('map_div'));
    map.draw(mapView, {width: 500, height: 400, mapType:'normal'});

    var geomapView =  new google.visualization.DataView(data);
    geomapView.setColumns([1, 2, 3]);

    var geomap = new google.visualization.GeoChart(document.getElementById('geomap_div'));
    geomap.draw(geomapView, {width: 500, height: 400, region: 'MY', resolution:'provinces', region:'MY'});
  };

  var genPieChart = function genPieChart(data) {
    var piechartView = new google.visualization.DataView(data);
    piechartView.setColumns([0, 3]);

    var piechartDengueCase = new google.visualization.PieChart(document.getElementById('piechart1_div'));
    piechartDengueCase.draw(piechartView, {width: 400, height: 400, title: 'Dengue Cases in KL (2014)'});

    var dengueHemorrhageView = new google.visualization.DataView(data);
    dengueHemorrhageView.setColumns([0, 4]);

    var piechartHemorrhagicCase = new google.visualization.PieChart(document.getElementById('piechart2_div'));
    piechartHemorrhagicCase.draw(dengueHemorrhageView, {width: 400, height: 400, title: 'Dengue Hemorrhagic Cases in KL (2014)'});

    var dengueDeathView = new google.visualization.DataView(data);
    dengueDeathView.setColumns([0, 5]);

    var piechartDeathCase = new google.visualization.PieChart(document.getElementById('piechart3_div'));
    piechartDeathCase.draw(dengueDeathView, {width: 400, height: 400, title: 'Dengue Death Cases in KL (2014)'});
  };

  var genColchart = function genColchart(data) {
    var dengueView = new google.visualization.DataView(data);
    dengueView.setColumns([0, 3]);

    var colDengueChart = new google.visualization.ColumnChart(document.getElementById('colchart1_div'));
    colDengueChart.draw(dengueView, {
      title: 'Dengue Cases in KL (2014)',
      series: {
        0:{color: 'blue', visibleInLegend: false}
      }
    });

    var dengueHemorrhageView = new google.visualization.DataView(data);
    dengueHemorrhageView.setColumns([0, 4]);

    var colDengueHemorrhageChart = new google.visualization.ColumnChart(document.getElementById('colchart2_div'));
    colDengueHemorrhageChart.draw(dengueHemorrhageView,  {
      title: 'Dengue Hemorrhagic Cases in KL (2014)',
      series: {
        0:{color: 'purple', visibleInLegend: false}
      }
    });

    var dengueDeathView = new google.visualization.DataView(data);
    dengueDeathView.setColumns([0, 5]);

    var colDengueDeathChart = new google.visualization.ColumnChart(document.getElementById('colchart3_div'));
    colDengueDeathChart.draw(dengueDeathView, {title: 'Dengue Death Cases in KL (2014)',
      series: {
        0:{color: 'red', visibleInLegend: false}
      }
    });

    google.visualization.events.addListener(colDengueChart, 'select', function(){
      colDengueDeathChart.setSelection(colDengueChart.getSelection());
    });
  };

  var dengueTableChart = function dengueTableChart(rawData){
    var rawData = rawData;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'District');
    data.addColumn('number', 'ColumnsToRefer');
    data.addRows([
      ['Segambut', 1],
      ['Kepong', 2],
      ['Batu', 3],
      ['Setiawangsa', 4],
      ['Wangsa Maju', 5],
      ['Titiwangsa', 6],
      ['Bukit Bintang', 7],
      ['Seputeh', 8],
      ['Lembah Pantai', 9],
      ['Cheras', 10],
      ['Bandar Tun Razak', 11]
    ]);

    var genTableDengue = function (d){
      var dataView = new google.visualization.DataView(d);
      dataView.setColumns([0]);
      var table = new google.visualization.Table(document.getElementById('tableDengue_div'));
      table.draw(dataView, {
        showRowNumber: true,
        width: 200,
        height: 500
      });

      var selectRow = function selectRow() {
        var selection = table.getSelection();
        console.log(selection);
        for (var i = 0; i < selection.length; i++) {
          var item = selection[i];
          if (item.row != null){
            var selectedCol = data.getFormattedValue(item.row, 1);
            dengueLineChart(rawData, parseInt(selectedCol), document.getElementById('linechartDengue_div'), 'Weekly Dengue Cases in KL');
          }
        }
      };

      google.visualization.events.addListener(table, 'select', selectRow);
    };

    genTableDengue(data);
  };

  var dengueLineChart = function dengueLineChart(data, coltoShow, elem, title){
    var dataView = new google.visualization.DataView(data);
    dataView.setColumns([0, coltoShow]);

    var linechart = new google.visualization.LineChart(elem);
    var options = {
      height: 500,
      hAxis: {
        title: 'Week'
      },
      vAxis: {
        title: 'Cases'
      },
      title: title,
      legend: {
        position: 'none'
      }
    };

    linechart.draw(dataView, options);
  };

  var dengueColChart = function dengueLineChart(data, elem, title){
    var linechart = new google.visualization.ColumnChart(elem);
    var options = {
      height: 500,
      hAxis: {
        title: 'Week'
      },
      vAxis: {
        title: 'Cases'
      },
      title: title
    };

    linechart.draw(data, options);
    google.visualization.events.addListener(linechart, 'select', function seriesAlert() {
      //console.log(linechart.getSelection());
    });
  };
  genCharts();
};
