# goog-amd

An AMD plugin that loads arbitrary things from the [Google Loader](https://developers.google.com/loader/)

## Quickstart
Add goog-amd to your paths:

    require({
        paths: {
            'goog': 'path/to/goog-amd',
        }
    });

Load stuff from Google:

    require([
        'goog!name:"visualization",version:"1.0",packages:["charteditor"]'
    ], function(visualization) {
        console.info(typeof visualization.AreaChart === 'function'); // true
    });


    require([
        'goog!name:"maps",version:"3.13",other_params:"sensor=false"'
    ], function(maps) {
        console.info(typeof maps.Map === 'function'); // true
    });

Profit!?


