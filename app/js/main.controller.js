var app = angular.module('G5Data',[]);

app.controller("MainController", function($scope, $http){

    $scope.gamesWanted = ['hidden city', 'mahjong journey', 'secret society', 'twin moons society', 'supermarket mania'];

    $scope.add = function() {
        var f = document.getElementById('file').files[0],
            r = new FileReader();

        r.onloadend = function(e) {
            var data = e.target.result;
            $scope.parseInData(decode_utf8(data));
        }

        r.readAsBinaryString(f);
    }

    $scope.iphone = function(){
        getData($http, 'http://www.g5info.se/php/chartiphone.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.ipad = function(){
        getData($http, 'http://www.g5info.se/php/chart.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.google = function(){
        getData($http, 'http://www.g5info.se/php/chart_googleplay_topgrossing.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.parseInData = function(data){
        var lines, lineNumber, length;
        $scope.games = [];
        lines = data.split('\n');
        lineNumber = 0;
        for (var i = lines.length - 1; i >= 0; i--) {
            l = lines[i];

            lineNumber++;
            data = l.split(';');

            var name = data[0];
            var place = data[1];
            var countryName = data[2];
            var date = data[3];

            if(!name || !_.find($scope.gamesWanted, function(gameWanted){ return name.toLowerCase().indexOf(gameWanted) !== -1})){
                continue; //if no name or game not wanted (not in gamesWanted list), move on
            }

            var game = _.find($scope.games, function(game){ return game.name === name});

            if(!game){
                game = { name: name, countries : [], sortedData:[]}
                $scope.games.push(game);
            }

            var country = _.find(game.countries, function(country){ return country.name === countryName});

            if(!country){
                country = {name : countryName, gameData: []};
                game.countries.push(country);
            }

            country.gameData.push({placement: parseInt(place), date: new Date(date)});
        }

        console.log($scope.games);
        $scope.$apply();
    }

    $scope.countrySelected = function(game){
        var country = _.find(game.countries, function(c){ return c.name === game.selectedCountry});

        var gameData = country.gameData;

        for(var i = 0; i < gameData.length; i++){
            var data = gameData[i];
            data.quarter = moment(data.date).utc().quarter();
            data.year = moment(data.date).year();
        }

        gameData = _.chain(gameData)
                    .sortBy('year')
                    .sortBy('quarter')
                    .sortBy('date').value();

        var years = _(gameData).chain().flatten().pluck('year').unique().value()

        _.each(years, function(year){
            if(!year){
                return;
            }

            var firstQuarter = _.filter(gameData, function(data) { return data.quarter === 1 && data.year === year});
            var secondQuarter = _.filter(gameData, function(data) { return data.quarter === 2 && data.year === year});
            var thirdQuarter = _.filter(gameData, function(data) { return data.quarter === 3 && data.year === year});
            var fourthQuarter = _.filter(gameData, function(data) { return data.quarter === 4 && data.year === year});
            
            game.sortedData.push(
                {
                    country:country.name,
                    year: year,
                    quarters: [
                        {
                            quarter: 1,
                            data: firstQuarter,
                            average: average(_.map(firstQuarter, function(data){return data.placement})),
                            min: _.min(_.pluck(firstQuarter, 'placement')),
                            max: _.max(_.pluck(firstQuarter, 'placement'))
                        },
                        {
                            quarter: 2,
                            data: secondQuarter,
                            average: average(_.map(secondQuarter, function(data){return data.placement})),
                            min: _.min(_.pluck(secondQuarter, 'placement')),
                            max: _.max(_.pluck(secondQuarter, 'placement'))
                        },
                        {
                            quarter: 3,
                            data: thirdQuarter,
                            average: average(_.map(thirdQuarter, function(data){return data.placement})),
                            min: _.min(_.pluck(thirdQuarter, 'placement')),
                            max: _.max(_.pluck(thirdQuarter, 'placement'))
                        },
                        {
                            quarter: 4,
                            data: fourthQuarter,
                            average: average(_.map(fourthQuarter, function(data){return data.placement})),
                            min: _.min(_.pluck(fourthQuarter, 'placement')),
                            max: _.max(_.pluck(fourthQuarter, 'placement'))
                        },
                    ]
                });
        })

        console.log(game);
    }
});

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function average(array){
    return Math.round(_.reduce(array, function(memo, num) {
        return memo + num;
      }, 0) / (array.length === 0 ? 1 : array.length), 0);
}

function getData(http, url){
    return http({
    method: 'GET',
    headers: {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers' : 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With',
        'Access-Control-Allow-Methods' : 'GET, PUT, POST',
    },
    url: url
    });
}