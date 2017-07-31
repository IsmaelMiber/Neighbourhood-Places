var map;
var infoWindow;
var markers = [];
// Model
var Location = function (data) {
    'use strict';
    var self = this;
    self.title = data.title;
    self.latlng = data.latlng;
    self.visible = ko.observable(true);
    self.article;
    self.marker = new google.maps.Marker({
        position: data.latlng,
        map: map,
        title: data.title,
        animation: google.maps.Animation.DROP
    });
    markers.push(self.marker);

    // WikiPedia API
    var wikiRequestTimeout = setTimeout(function () {
            self.article = "No Article";
        },
        8000);
    var url =
        "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + data.title + "&format=json&callback=wikiCallback";

    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (response) {
            var articletitle = response[0];
            var articlelink = response[3][0];

            self.article = '<a target="_blank" href="' + articlelink + '">' + articletitle + '</a>'

            clearTimeout(wikiRequestTimeout);
        }

    }); //End of WikiPedia Api

    self.marker.addListener('click', function () {
        infoWindow.open(map, self.marker);
        infoWindow.setContent('Name: ' + data.title + '<br><br>WikiLink: ' + self.article);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 1000);

    });

    infoWindow.addListener('closeclick', function () {
        self.marker.setAnimation(null);
    });

    self.clickAble = function (L) {
        google.maps.event.trigger(self.marker, 'click');
    };

    self.viewMaker = ko.computed(function () {
        if (self.visible() === true) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
        return true;
    }, self);

};


// ViewModel
var ViewModel = function () {
    'use strict';
    var self = this;

    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 28.369822,
            lng: -81.549518
        },
        zoom: 15
    });

    self.listOfLocations = ko.observableArray([]);

    locations.forEach(function (L) {
        self.listOfLocations.push(new Location(L));
    });

    self.searchValue = ko.observable("");

    self.filterList = ko.computed(function () {
        var FilterValue = self.searchValue().toLowerCase();
        if (FilterValue === "") {
            self.listOfLocations().forEach(function (locationItem) {
                locationItem.visible(true);
            });

            return self.listOfLocations();
        } else {
            return ko.utils.arrayFilter(self.listOfLocations(), function (L) {
                var convertTitle = L.title.toLowerCase();
                var result = (convertTitle.search(FilterValue) >= 0);
                L.visible(result);
                return result;
            });
        }
    }, self);


};


function initMap() {
    'use strict';
    infoWindow = new google.maps.InfoWindow();
    ko.applyBindings(new ViewModel());
}

function errorHandlingMap() {
    'use strict';
    alert("Google Maps has failed, Please Refresh Your WebPage by clicking 'F5 Key'");
}


// HumBurger Icon To Show & Hide List Of Locations
function burgerIcon() {

    if (document.getElementById('places-list').style.display === 'none')
        document.getElementById('places-list').style.display = 'block';
    else
        document.getElementById('places-list').style.display = 'none';
}
