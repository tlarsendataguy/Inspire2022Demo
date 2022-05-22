# Inspire 2022 Demo

This repository contains the web app code (HTML and Javascript), as well as the workflows, used in the [height map demo](https://ayxrunner.tlarsendataguy.com/public/heightmap).

The height map demo presented at Alteryx Inspire 2022 highlighted how the code-friendly side of Alteryx can supercharge Analytics Engineering and enhance Alteryx's partnership with Snowflake. In the demo, a web application runs an Alteryx workflow that generates heightmap data. The data is returned to the web application in an image file, which the web app uses to generate an interactive 3D scene.

As mentioned in the presentation, the elevation data used for the demo came from geotiff files published by the US Geological Survey. The custom tool used to parse geotiffs is not located in this repository. You can find the custom tool code in [its own repository](https://github.com/tlarsendataguy/import_geotiff).

A big thank you goes to Nick Haylund, who collaborated on this project and co-presented with me at Inspire.
