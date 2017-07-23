angular.module('G5Data').service('ChartService', function(UtilService) {

    var vm = this;

    vm.addChart = function(game){
        var ctx = document.getElementById(game.name).getContext('2d');
        var datasets = getDataForChart(game);
        var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["1", "2", "3", "4"],
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
        });
    }

    function getDataForChart(game){
        var dataSet = [];

        for(var i = 0; i < game.sortedData.length; i++){
            var data = game.sortedData[i];
            var color = UtilService.getRandomColor();
            var set = {
                label: data.country,
                data: _.map(data.quarters, function(quarter){return quarter.average}),
                fill:false,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }
            dataSet.push(set);
        }
        return dataSet;    
    }
});