/* Copyright (c) 2013 John Krasnay */

var sysdash = (function ($) {

  var c = {
        gutter: 10,
        interval: 30,
        width: 1920
      },
      page;


  /**
   * Builds the structure based on the `page` variable.
   *
   * This happens once when the web page loads, and must be triggered
   * again when the page is changed.
   */
  var buildPage = function () {

    $('body').empty();

    $.each(page.tiles, function () {

      var tile = this,
      colSpan = tile.size ? tile.size[0] : 1,
      rowSpan = tile.size ? tile.size[1] : 1;

    var $tile = $('<div class="tile"/>')
      .appendTo($('body'))
      .data('tile', tile)
      .css('left', (c.gutter + (tile.col - 1) * (c.tileWidth + c.gutter)) + 'px')
      .css('top', (c.gutter + (tile.row - 1) * (c.tileWidth + c.gutter)) + 'px')
      .css('width', (c.tileWidth * colSpan + (colSpan - 1) * c.gutter) + 'px')
      .css('height', (c.tileWidth * rowSpan + (rowSpan - 1) * c.gutter) + 'px')
      .append('<div class="tile-hd">' + tile.title + '</div>')
      .append('<div class="tile-bd"/>');

    tile.width = $tile.find('.tile-bd').width();
    tile.height = $tile.height() - $tile.find('.tile-hd').outerHeight()
      - ($tile.width() - tile.width); // Assume vertical padding is the same as horiz padding

    });

    drawTiles();

  };


  /**
   * Draws all the tiles on the current page. This is called regularly
   * based on the page's interval.
   *
   * @param {String} feed Name of the feed for which to draw the tiles. If
   * specified, only tiles bound to the given feed will be drawn. These
   * will be called with the data from the feed. If not specified, only
   * tiles not bound to feeds are drawn.
   */
  var drawTiles = function (feedName) {

    $('.tile').each(function () {

      var $e = $(this),
          tile = $e.data('tile')
          $bd = $e.find('.tile-bd');


      var data;

      if (feedName) {
        if (feedName == tile.feed) {
          //console.log('Drawing bound tile at row ' + tile.row + ', col ' + tile.col);
          $bd.empty();
          sysdash.widget[tile.widget]($bd, tile, sysdash.feed[feedName].data);
        }
      } else {
        if (!tile.feed) {
          //console.log('Drawing unbound tile at row ' + tile.row + ', col ' + tile.col);
          $bd.empty();
          sysdash.widget[tile.widget]($bd, tile);
        }
      }

    });
  };


  /**
   * Formats a number to include thousands separator.
   */
  var formatNumber = function (number) {

    var s = '' + number,
        x = s.split('.'),
        s1 = x[0],
        s2 = x.length > 1 ? '.' + x[1] : '',
        rgx = /(\d+)(\d{3})/;

    while (rgx.test(s1)) {
        s1 = s1.replace(rgx, '$1' + ',' + '$2');
    }

    return s1 + s2;

  }


  /**
   * Requests each of the feeds, and sets up a timer to re-request each
   * feed at the desired interval.
   */
  var initFeeds = function () {

    sysdash.feed = {};

    $.each(c.feeds, function () {

      var feed = this;

      sysdash.feed[feed.name] = feed;

      var acceptFeed = function (data) {
        console.log('received feed ' + feed.name, data);
        sysdash.feed[feed.name].data = data;
        drawTiles(feed.name);
      };

      var requestFeed = function () {

        console.log('requesting feed ' + feed.name);

        var req = {
          url: feed.url,
          dataType: 'jsonp',
          success: acceptFeed,
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('Error on feed ' + feed.name, textStatus, errorThrown);
          }
        };

        if (feed.dataType) {
          req.dataType = feed.dataType;
        }

        if (feed.username) {
          req.username = feed.username;
        }

        if (feed.password) {
          req.password = feed.password;
        }

        $.ajax(req);

      };

      requestFeed();
      sysdash.feed[feed.name].intervalId = setInterval(requestFeed, feed.interval * 1000);

    });

  };


  /**
   * Invoked after page load to kick the whole thing off.
   */
  var start = function (options) {

    if (typeof timezoneJS !== 'undefined') {
      timezoneJS.timezone.init({ async: false });
    }

    $.extend(c, options);

    c.cols = Math.round(c.width / 160);

    c.tileWidth = (c.width - (c.cols + 1) * c.gutter) / c.cols;
    //c.tileHeight = ($(window).height() - (c.rows + 1) * c.gutter) / c.rows;

    page = c.pages[0];

    initFeeds();
    buildPage();

    setInterval(drawTiles, c.interval * 1000);

  };

  return {
    formatNumber: formatNumber,
    start: start,
    widget: {}
  };

})(jQuery);




/**
 * Time widget
 */

sysdash.widget.time = function ($e, tile) {

  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
      d = timezoneJS && tile.tz ? new timezoneJS.Date(tile.tz) : new Date(),
      h = d.getHours(),
      m = d.getMinutes(),
      ampm;

  if (h > 11) {
    ampm = 'PM';
    h = h - 12;
  } else {
    ampm = 'AM';
  }

  if (h == 0) {
    h = 12;
  }

  if (m < 10) {
    m = '0' + m;
  }

  $e.append('<span class="time">' + h + ':' + m + '</span>')
    .append('<span class="time-ampm">' + ampm + '</span>')
    .append('<div class="time-weekday">' + days[d.getDay()] + '</div>')
    .append('<div class="time-date">' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</div>')
    ;

};



/**
 * Number widget
 */
sysdash.widget.number = function ($e, tile, data) {

  var value = tile.value,
      previous = tile.previous;

  if ($.isFunction(value)) {
    value = value(data);
  }

  if (value !== undefined) {

    var $number = $('<div class="number">')
      .appendTo($e)
      .text(sysdash.formatNumber(value));

    if (tile.prefix) {
      $('<span class="prefix">')
      .prependTo($number)
      .text(tile.prefix);
    }

    if (tile.suffix) {
      $('<span class="suffix">')
      .appendTo($number)
      .text(tile.suffix);
    }

    if ($.isFunction(previous)) {
      previous = previous(data);
    }

    if (previous !== undefined && previous != 0) {

      var change = Math.round(100 * (value - previous) / previous);

      var cssClass = 'change-none';
      if (change < 0) {
        cssClass = 'change-down';
      } else if (change > 0) {
        cssClass = 'change-up';
      }

      if (change > 0) {
        change = '+' + sysdash.formatNumber(change);
      } else {
        change = sysdash.formatNumber(change);
      }

      var $chDiv = $('<div>')
        .appendTo($e)
        .addClass(cssClass + ' change')
        .text(change)
        .prepend('<span class="change-ind">')
        .append('<span class="change-pct">%</div>');

      if (tile.context) {
        $('<div class="change-ctx">')
          .appendTo($e)
          .text(tile.context);
      }

    }
  }

}


/**
 * Graphite widget
 */

sysdash.widget.graphite = function ($e, tile) {

  var url = tile.url + '?_t=' + Math.random();

  $.each(tile.targets, function () {
    url += '&target=' + this;
  });

  url += '&from=' + tile.from;
  url += '&to=' + tile.to;
  url += '&format=json';

  $.ajax(url, { dataType: 'jsonp', jsonp: 'jsonp' })
  .done(function (data) {

    var series = [];

    $.each(data, function () {

      var values = [];

      $.each(this.datapoints, function () {
        values.push([ this[1] * 1000, this[0] ]);
      });

      series.push({
        label: this.target,
        data: values
      });

    });

    var $block = $('<div/>')
    .appendTo($e)
    .css('width', tile.width + 'px')
    .css('height', tile.height + 'px');

    $.plot($block, series, { xaxis: { mode: 'time', timezone: 'browser', minTickSize: [30, 'minute'] } });

  })
  .fail(function (jqxhr, status) {
    console.log('Ajax failed: ' + status);
  });
}


/**
 * Nagios widget
 */

sysdash.widget.nagios = function ($e, tile) {

  var data = sysdash.feed[tile.feed].data,
      classes = { 0: 'nagios-ok', 1: 'nagios-warning', 2: 'nagios-critical' };

  if (data) {

    var hosts = tile.hosts,
        level = tile.level || 0;

    if (!hosts) {
      hosts = [];
      for (var hostname in data.hosts) {
        hosts.push(hostname);
      }
      hosts.sort();
    }

    $.each(hosts, function () {

      var hostname = this,
      host = data.hosts[hostname],
      hasServices = false;

    $.each(host.services, function () {
      if (this.current_state >= level) {
        hasServices = true;
        return false;
      }
    });

    if (hasServices) {

      if (hosts.length > 1) {
        $e.append('<div class="nagios-host">' + hostname + '</div>');
      }

      $.each(host.services, function () {
        var service = this;
        if (service.current_state >= level) {
          $('<div class="nagios-service">' + service.service_description + '</div>')
        .appendTo($e)
        .prepend($('<div/>').addClass(classes[service.current_state]))
        .append('<div class="nagios-output">' + service.plugin_output + '</div>');
        }
      });
    }

    });
  }

}



