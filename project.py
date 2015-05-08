from project_module import project_object, image_object, link_object, challenge_object

p = project_object('LGBT_map', 'LGBT map')
p.domain = 'http://www.aidansean.com/'
p.path = 'LGBT_map'
p.preview_image_ = image_object('http://placekitten.com.s3.amazonaws.com/homepage-samples/408/287.jpg', 408, 287)
p.folder_name = 'aidansean'
p.github_repo_name = 'LGBT_map'
p.mathjax = True
p.links.append(link_object(p.domain, 'LGBT_map', 'Live page (Google Maps)'))
p.links.append(link_object(p.domain, 'LGBT_map', 'Live page (Colourblind safe)'))
p.introduction = 'One of my more far reaching projects is the LGBT CERN group. It is a diverse group with people from across the world, and one of the issues that we care about is safety in different nations.  This project keeps track of progress in different nations.'
p.overview = '''The information is stored in xml files which are then read and used to create maps.  The user can step forward and backward through the history, or let it autoplay.  There are two versions of the page, once which uses Google Maps and one which has a custom map which is more colourblind friendly.

There is scope to extend this project for other uses, and I also have maps showing the state of the EU and its history.

This project is currently unfinished and needs some further cleaning up of code when time allows.'''

p.challenges.append(challenge_object('Finding vectors for the national borders was not easy.', 'After much searching I found some useful vectors for the national borders. They are used here with two caveats: they are not my intectual property, and they are not small in size.  As a result I am not too keen to share this project with the wider world.', 'Resolved'))

p.challenges.append(challenge_object('Making a colourblind friendly Google Map is not easy.', 'I wanted to make the map colourblind friendly, and the simplest way to do this was to use striped fills.  This is not a satisfctory solution using Google Maps, so I made a second page where is is a reasonable solution.  This meant that I had make a page that writes maps from scratch, including panning and zooming.  This was easier than expected and may lead to other map-based projects in the future.', 'Resolved'))

p.challenges.append(challenge_object('This project used striped fills in the polygons.', 'One of the more difficult parts of this project was developing an algorithm that intersected multiple polygons in a consistent and sensible way.  After much experimentation and development, this was achieved.  This used knowledge developed on a previous and unfinihsed project that creates city skyline graphics.', 'Resolved'))

p.challenges.append(challenge_object('I needed an xml reader.', 'There are xml readers available in Javascript, but I chose to use my previously developed library that I had used for the Marble Hornets project.  This should probably be replaced with a json solution later.', 'Resolved'))
