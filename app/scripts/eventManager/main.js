/**
 * Created by Lorenzo on 09/03/2016.
 */

/**
 * Generate 50 random microcycles
 * @returns {Array}
 */
function randomData() {

  var data = [];

  for (var i = 0; i < 50; i++) {
    data.push({
      "id": Math.floor(Math.random() * 111111),
      "name": "Micro 3",
      "description": "Evento de prueba",
      "startDate": "2016-03-02 19:00",
      "endDate": "2016-03-09 19:00",
      "eventType": {
        "itemValue": "MICROCICLE",
        "itemLabel": "microcicle"
      },
      "status": {
        "itemValue": "NOT_DEFINED",
        "itemLabel": "not defined"
      },
      "eventGroup": {
        "id": 31,
        "name": "Evento 1",
        "description": "Evento de prueba",
        "additionalInfo": null
      },
      "configuration": {
        "data": [
          {
            "conceptType": {
              "itemValue": "INTENSITY",
              "itemLabel": "intensity"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": {
              "itemValue": "VOLUME",
              "itemLabel": "volume"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": {
              "itemValue": "RESISTANCE",
              "itemLabel": "resistance"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": {
              "itemValue": "RHYTHM",
              "itemLabel": "rhythm"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": {
              "itemValue": "SWIMMING",
              "itemLabel": "swimming"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": {
              "itemValue": "RUN",
              "itemLabel": "run"
            },
            "value": Math.floor(Math.random() * 11),
            "label": "Prueba",
            "note": "Loren ipsum"
          }
        ]
      },
      "content": {
        "data": [
          {
            "conceptType": null,
            "value": null,
            "label": "Prueba",
            "note": "Loren ipsum"
          },
          {
            "conceptType": null,
            "value": null,
            "label": "Prueba",
            "note": "Loren ipsum"
          }
        ]
      }
    });
  }
  return data;
}

/**
 * Generate the data of draggableChart
 * @param data
 * @returns {{dataProvider: Array, graphs: Array, categoryField: string}}
 */
function renderChart(data) {

  var amChartsData = [];
  var parameters = {};
  var dataGraph = {
    "dataProvider": [],
    "graphs": [],
    "categoryField": "date"
  };

  $.each(data, function (key, micro) {
    var contentData = {
      "date": moment(micro.startDate).locale(window.navigator.language).format('L'),
      "id": micro.id
    };
    $.each(micro.configuration.data, function (key1, content) {
      contentData[content.conceptType.itemValue] = content.value;
      parameters[content.conceptType.itemValue] = content.conceptType.itemLabel;
    });
    amChartsData.push(contentData);
  });

  $.each(parameters, function (value, label) {
    dataGraph.graphs.push({
      "lineColor": $.dwecProject.gFunctions.getRandomColor(),
      "bullet": "round",
      "title": label,
      "valueField": value,
      "type": "line"
    });
  });


  dataGraph.dataProvider = amChartsData;
  return dataGraph;
}

/**
 * Generate the table data
 * @param data
 * @returns {Array}
 */
function renderTable(data) {

  var returnament = [];
  returnament[0] = [];
  var parameters = {};


  $.each(data, function (index, object) {

    returnament[0].push({
      value: index,
      itemLabel: moment(object.startDate).locale(window.navigator.language).format('L')
    });

    $.each(object.configuration.data, function (index2, object2) {
      (!parameters[object2.conceptType.itemValue]) ?
        parameters[object2.conceptType.itemValue] = [] : null;

      parameters[object2.conceptType.itemValue].push({
        microId: object.id,
        value: object2.value,
        itemLabel: object2.conceptType.itemLabel,
        itemValue: object2.conceptType.itemValue
      });
    })
  });

  $.each(parameters,function(key, value){
    returnament.push(value);
  });

  return returnament;
};


/**
 * Init demo
 */
$(document).ready(function(){

  var data = randomData();

  $('#liveTable').on('LiveTableReady', function(){
    new $.dwecProject.draggableChart($('#am-graph'), renderChart(data),{});
  });

  $('#am-graph').on('DraggableChartReady', function(){
    new $.dwecProject.dragAndLiveSync($('#am-graph'),$('#liveTable'),{});
  });

  new $.dwecProject.liveTable($('#liveTable'), renderTable(data),{});

});
