The following are the implemented features of the Sugbu Resto web app using Google Maps API (NOTE: Items are based on the coding exercise instructions):

☑︎ ❶　Plot restaurants across Cebu.
- [Show Sugbu Restos] button is displayed initially after launching the page. Once clicked, it will display all the restaurants in Cebu.
	- Plotted custom markers are based on the results of the <nearbySearch> and <textSearch> methods for the PlaceService class instance. For the request parameter of these methods, the [type] specified is "restaurant".
	- After clicking [Show Sugbu Restos], the following buttons at the top part of the app are displayed:
		- DrawingManager buttons: cursor and circle options (please see item ❻ for more details about the circle option)
		- [Clear Circle] button, which clears all the circles drawn in the map
		- Restaurant Type toggle buttons: [All Restos], [Operational], and [Closed] (for more details, please see item ❸)
☑︎ ❷ Each restaurant will have at least 1 food specialty.
- Each restaurant is assigned a food specialty that is randomly selected from the <foodSpecialtyList> array. A resto's food specialty can be viewed in its Info Window, displayed after clicking its marker in the map.
☑︎ ❸ A layer panel can filter the restaurant type to show.
- For the Sugbu Resto web app, two types of restaurants can be displayed:
	- [OPERATIONAL] Operational restaurants
	- [CLOSED] Restaurants that are closed temporarily
- After clicking the [Show Sugbu Restos] button, the following Restaurant Type toggle buttons are displayed:
	- [All Restos]: shows all custom markers, representing Cebu restos
	- [Operational]: shows all red custom markers, representing operational Cebu restos
	- [Closed]: shows all black custom markers, representing closed Cebu restos
☑︎ ❹ Each restaurant can keep track of the number of customers that visited.
- The # of customers that visited a particular resto can be viewed in the Info Window, which is displayed after clicking the resto's marker.
- Figure is based on the <user_ratings_total> data retrieved from <nearbySearch>/<textSearch> results.
☑︎ ❺ Customers can get directions to the restaurant from the current location.
- When a user clicks a resto marker in the map and the Info Window is subsequently displayed, a [Get Direction] button is also shown in the said window.
- Pressing [Get Direction] will plot a course from the user's current location to the said resto.
☑︎ ❻ Draw a circle or rectangle on the map and show the number of restaurants within the circle or rectangle.
- After pressing the [Show Sugbu Restos] button, cursor and circle option buttons are displayed (at the left of the [Clear Circles] button).
	- Pressing the circle option allows the user to create multiple circles in the map.
	- Pressing the cursor option allows the user to interact with the map normally (e.g., drag, click a location)
- A user can drag the circle across the map, and can also expand/shrink it.
- A drawn circle can detect the # of restos within its domain. This figure can be viewed via an Info Window that is displayed by hovering the cursor over the said circle.
	- Counting depends on the # of visible markers within the circle's domain. For example, if the circle encompasses 3 operational restos and 2 closed ones, the following info will be displayed in the Info Window, depending on the toggled Restaurant Type button:
	- [All Restos] # of Restos Within the Circle: 5
	- [Operational] # of Restos Within the Circle: 3
	- [Closed] # of Restos Within the Circle: 2