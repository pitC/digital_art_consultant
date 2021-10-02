
# What is Artific?

Artific is a free personal art recommendation tool. We recommend you artworks matching your color scheme and taste, let you preview them on your wall with augmented reality and share and / or download them in a high-resolution in order to print at a local print shop. For some artworks you can even order a high-quality print with one click!
# What kind of artworks can I find on Artific?

Artific features digitized artworks from art museums and other GLAM institutions worldwide (galleries, libraries, archives, museums). All the artworks are published under a licence conformant with the principles set forth in the Open Definition, which means you are allowed to reuse and remix them. Most of the artworks are licenced as public domain / Creative Commons CC0 or Creative Commons Attribution 4.0 (CC-BY-4.0) or Creative Commons Attribution Share-Alike 4.0 (CC-BY-SA-4.0). You will find the information about the licence on the screen where you can download the artwork.
How come I can download these artworks for free?

The purpose of a museum is to acquire, conserve, research, communicate and exhibit the heritage of humanity (ICOM). One of a way of conserving and communicating the art is the process of digitization. It basically means that the artworks are being scanned or photographed in a very high quality and then described in a very meticulous and standardized manner (this is metadata). More and more museums decide to put their digitized artworks online in order to make it accessible for more people. Some museums go even a step further and publish the results of the digitization under an open licence, so that everybody can get creative with their artwork. You can mix it up and make your own artwork out of it. You can make Instagram stickers out of it. Or you can make use of the high resolution the museum provide us with and print out an artwork for your home.

If you are interested in this subject, please visit the Europeana Collections. Europeana lets you explore artworks from all European museums and other GLAM Institutions!
# How does Artific work?

This is where it gets interesting...

Artific is web-application, which means it pretty much offers you the same functionality as an app would do, but you do not have to install it on your phone and everybody can access it through their browser. We are taking the metadata provided by museums and scan it in order to supplement it with further information on the colours in the artworks. Then we need your input. One way to do it is for you to make a photo, which we scan as well in order to find information on the colours, or you provide us directly with three colours. Either way, we match your chosen colours with the colours in the painting (this is where the magic – and the math – happens) and recommend you five paintings. The algorithm for the colour matching was written by us. It basically counts how near to one another the desired colours are and the colours in the paintings based on a Delta-E-Formula and the 60-30-10 rule. In the photo you provided we are looking for the main colour, the secondary colour and the contrast colour (we use the vibrant.JS library for that). Then we are trying to match an artwork which has 60% of the desired vibrant colour, 30% of the desired secondary colour and 10% of your apartment’s main colour. This way we hope to achieve an effect pleasing to the human eye.

Another way to find an artwork is to click on “Discover". Here we ask you a couple of questions and match your answer to the provided metadata records about an artwork, for example the subject, the genre, the atmosphere etc. For each question and each answer we use different metadata records.

Once you chose an artwork, you can preview it on your wall with augmented reality, which is really nice. For that feature we used the A-Frame library.

The whole code is published under a GNU licence, so feel free to check it out and play around with it.

# What’s the trick? How come the whole thing is free?

We are a team of three people who believe that everybody can enjoy art and we should be seeking new ways to access it. Artific was developed as a part of Coding da Vinci Hackathon in our spare time. There are no ads, we do not collect your data and do not sell it to anyone. We do not save the pictures you made. We are just happy if you were able to discover some art. Feel free to share your results with the #artificapp and make sure everybody knows what a great tool it is.

We do have some small costs of running this website like hosting and the domain, so we wouldn’t mind you buying as a coffee if you feel like it!
