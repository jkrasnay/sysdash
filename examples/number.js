
var homePage = {
  title: 'Home',
  tiles: [
  {
    title: 'West Region - Dollars',
    row: 1,
    col: 1,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    prefix: '$',
    context: 'over previous MTD',
    value: function (data) {
      return data.west.mtd.dollars;
    },
    previous: function (data) {
      return data.west.prevMtd.dollars;
    }

  },
  {
    title: 'West Region - Units',
    row: 2,
    col: 1,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    suffix: 'units',
    context: 'over previous MTD',
    value: function (data) {
      return data.west.mtd.units;
    },
    previous: function (data) {
      return data.west.prevMtd.units;
    }

  },
  {
    title: 'Central Region - Dollars',
    row: 1,
    col: 3,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    prefix: '$',
    context: 'over previous MTD',
    value: function (data) {
      return data.central.mtd.dollars;
    },
    previous: function (data) {
      return data.central.prevMtd.dollars;
    }

  },
  {
    title: 'Central Region - Units',
    row: 2,
    col: 3,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    suffix: 'units',
    context: 'over previous MTD',
    value: function (data) {
      return data.central.mtd.units;
    },
    previous: function (data) {
      return data.central.prevMtd.units;
    }

  },
  {
    title: 'East Region - Dollars',
    row: 1,
    col: 5,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    prefix: '$',
    context: 'over previous MTD',
    value: function (data) {
      return data.east.mtd.dollars;
    },
    previous: function (data) {
      return data.east.prevMtd.dollars;
    }

  },
  {
    title: 'East Region - Units',
    row: 2,
    col: 5,
    size: [2,1],
    widget: 'number',
    feed: 'sales',
    suffix: 'units',
    context: 'over previous MTD',
    value: function (data) {
      return data.east.mtd.units;
    },
    previous: function (data) {
      return data.east.prevMtd.units;
    }

  },
  ]
};

var salesFeed = {
  name: 'sales',
  url: 'number.json',
  dataType: 'json',
  interval: 30
}

$(function () { 
  sysdash.start({
    interval: 5,
  feeds: [ salesFeed ],
  pages: [ homePage ]
  });
});
