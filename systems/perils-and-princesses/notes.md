# TODO

I need to implement a way for Features and Spells to access the number of Gift Dice and spend them
to determine how many dice are rolled.

I think there is probably a way to use `this.owner` to access the Actor and its attributes.

Then, I need to create a popup for the user to choose the number of dice to spend, which also prints
how many they have and errors if they try to spend more than they have.

Finally, I need to process this somehow. This includes a couple of steps:
- SUM the dice
- If it's an ability that affects DICE number of creatures, then print out number of creatures 
affected in the description

I think for now I'll save Spells for the end, since that seems the most complicated.