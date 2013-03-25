# Sysdash Dashboard

Sysdash is a browser-based dashboard written in Javascript. In sysdash,
a __dashboard__ is defined as a layout of rectangular __tiles__, each of which
displays some data about a system. The page is refreshed periodically to
display updated information.

Each tile on the dashboard is rendered by a __widget__, which is just a
Javascript function that creates HTML DOM elements to display the
desired information. Sysdash comes with some standard widgets:

- `time`, which displays a timezone-sensitive time and date
- `number`, which displays an integer number, optionally with an
  indication of percentage increase/decrease
- `nagios`, which displays alerts from a Nagios 3 server
- `graphite`, which displays graphs from a Graphite server using the
  Flot graphing library

Sysdash can be easily extended with custom widgets.

Sysdash assumes that data can be retrieved from external systems via
Ajax. Explicit support is provided for JSONP feed protected with HTTP
Basic authentication.

## License

Sysdash is copyright (c) 2013 by John Krasnay, and licensed under the
[Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0.html).

## Quick Start

- Create a directory somewhere under your web server's document root.
  (For now, you can't run your dashboard directly from the filesystem
since we have to load the timezone files as separate resources. More on
this below.)

- Check out the latest version of sysdash.

- Create a Javascript file, say `mydash.js`, that initializes the
  dashboard. Here's trivial dashboard to get you started:

    var homePage = {
        title: 'Home',
        tiles: [
            {
                title: 'Vancouver',
                row: 1,
                col: 1,
                widget: 'time',
                tz: 'America/Vancouver'
            },
            {
                title: 'Chicago',
                row: 1,
                col: 2,
                widget: 'time',
                tz: 'America/Chicago'
            },
            {
                title: 'Toronto',
                row: 1,
                col: 3,
                widget: 'time',
                tz: 'America/Toronto'
            },
        ]
    };

    sysdash.init({
        interval: 30,
        pages: [ homePage ]
    });

- Create an HTML file to hold your dashboard, say `mydash.html`:

    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard 1</title>
        <link rel="stylesheet" href="../sysdash.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <script src="sysdash/sysdash.js"></script>
        <script src="sysdash/date.js"></script>
        <script>timezoneJS.timezone.zoneFileBasePath = 'sysdash/tz'</script>
        <script src="mydash.js"></script>
      </head>
      <body>
      </body>
    </html>


## Initialization

Sysdash is initialized vi the `init` method, which takes an object with
the following properties:

- `interval`: Number of seconds between page refreshes. Optional.
  Default is 30 seconds.
- `pages`: An array of page objects comprising the dashboard. Required.
- `feeds`: An array of feed objects. Optional.
- `width`: Width for the target display device, in pixels. Optional.
  Default is 1920 pixels.


## Pages

A page object has the following properties:

- `title`: The page title. Required.
- `tiles`: An array of tiles on the page. Required.


## Tiles

A tile object has the following properties:

- `row`: The row of the top-left corner of the tile. The first row is 1.
- `col`: The column of the top-left corner of the tile. The first column
  is 1.
- `size`: An array of two numbers indicating the number of columns and
  rows (respectively) spanned by the tile. Optional. Defaults to `[1,1]`. Sysdash
arranges for rows and columns to be around 160 pixels, such that an even
number of columns fit into the configured display width.
- `widget`: A string indicating which widget to use to render the tile.

Tile objects may contain additional properties as required by the given
widget.


## Feeds

A __feed__ describes a URL from which the dashboard can retrieve
information about an external system. By isolating feeds from widgets we
can have information from the feed displayed on multiple widgets without
having to repeat the request from each widget.

A feed is a Javascript object with the following properties.

- `name`: Name of the feed. This should typically be a valid Javascript
  identifier.
- `url`: URL from which to retrieve the data.
- `interval`: Number of seconds between requests for the feed.

Widgets can access the feed data from
`sysdash.feed.`__feedname__`.data`. Note that the widget may be rendered
before the feed has been first retrieved, so the widget should check
that this information is available before using it.


## Custom Widgets

A widget is just a function that renders the content of a tile. Sysdash
calls the widget with two parameters:

- `$e`: JQuery wrapper around a `div` representing the body of the
  widget. The widget appends new elements to this element as required.
Sysdash takes care of destroying any previous content before calling the
widget.
- `tile`: The tile object from the page definition. The widget can
  access any properties in this object as required.

Aside from properties in the original tile definition, the `tile`
parameter includes the following generated properties:

- `height`: Tile height, in pixels, excluding the title block and padding.
- `width`: Tile width, in pixels, excluding padding.

Here is a very simple widget that just renders some text:

    sysdash.widget.text = function ($e, tile) {
        $('<div>')
        .text(tile.text);
        .appendTo($e);
    }

A tile definition that invokes this widget might look like this:

    {
        title: 'Hello',
        row: 1,
        col: 1,
        widget: 'text',
        text: 'Hello, world'
    }

Static text isn't very interesting. We'd like to have our widget display
some dynamic text, such as the status of an external system. Here's an
improved version of the widget:

    sysdash.widget.text = function ($e, tile) {

        var $tile = $('<div>').appendTo($e);

        if ($.isFunction(tile.text)) {
            $tile.text(tile.text());
        } else {
            $tile.text(tile.text);
        }

    }

Now we can change our tile object to access the field. Note that we have
to check to make sure the feed is ready.

    {
        title: 'Hello',
        row: 1,
        col: 1,
        widget: 'text',
        text: function () {
            if (sysdash.feed.myfeed.data) {
                return sysdash.feed.myfeed.data.myserver.status;
            } else {
                return '';
            }
        }
    }


