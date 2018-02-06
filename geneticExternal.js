//This tutorial helped me understand genetic algorithms and was the basis for this code
//https://www.codecademy.com/courses/javascript-beginner-en-pqhEw/1/2

//I have made 3 copies of this patch each with slightly different settings and buffers

//The aim of this external is to search for and approximate a string of
//characters which are then fed into the patch 3 at a time which control
//the playback segment speed and duration of vocal samples
inlets = 1;
//first outlet spits out a genome sequence, the second outlet spits out
//instructions
outlets = 2;

//In the TARGET string each beat is tied to a group of 3 numbers, the first number decides from which position in the sample we are going to start playback,
//The second number in the string, controls the direction of the playback and the final one controls pitch (x44 would play the sample at x position forwards at recorded pitch)
var TARGET = "044144244344444544644744";
var ALPHABET= "01234567";

//MUTPROB is the probability of a mutation occuring within a gene
var MUT_PROB= 5;
var generations = 0;
var fittest = generateGenome();
//ATTEMPT is the array by which the genome is spat out of the external
var ATTEMPT=[];
//ValueRepeats is to keep track of where we are in the genome
var valueRepeats= 0;

var stateTrigger1 = false;

//Bangs tell the external to spit out the latest attempt at cracking the genome.
function bang(){
  outlet(0,ATTEMPT);
}

//Used for debugging
function clear(){
  fittest=generateGenome();
  ATTEMPT=[];
  valueRepeats= 0;
  bang();
}

//Generates a random string
function generateGenome(){
 var genome = [];
 for (i=0; i<TARGET.length; ++i){
    genome[i]=ALPHABET[Math.floor(Math.random()*ALPHABET.length)];
 }
 return genome.join("");
}

// Uses loops to check how close the genetic algo. is to completion.
function getFitness(genome){
    var fitness=0;
    for (var i=0; i<TARGET.length;++i){
        if (genome[i]===TARGET[i]){
            fitness++;
        }
    }
    return fitness;
}

//Creates 100 members of an array with the same genome
function getGenePool(genome){
    var genePool= [];
    for(var i=0; i<100;i++){
        genePool[i]= genome;
    }
    return genePool;
}

//Determines which geneome is the closest to matching TARGET
function getFittest(genePool){
    var fitness = 0;
    var fitLoc;
    for(var i=0;i<genePool.length;i++){
     if (getFitness(genePool[i])>fitness){
     fitness = getFitness(genePool[i]);
     fitLoc = i;
     }
    }
    return genePool[fitLoc];
}

//Replaces an incorrect character with a random one.
function doMutation(genome){
 var newGenome ="";
 for (var i=0;i<genome.length;i++){
  if(Math.floor(Math.random()*MUT_PROB)>1){
      if(genome[i]!=TARGET[i]){
          newGenome+=ALPHABET[Math.floor(Math.random()*ALPHABET.length)];
      }
      else{
       newGenome+=genome[i];
      }
  }
  else{
      newGenome+=genome[i];
 }
}
return newGenome;
}

//"Upgrades" the genepool to the next generation
function evolve(){
//if statement triggers something musical to play when the genome gets partway solved
  if(getFitness(fittest)>6 && !stateTrigger1){
    outlet(1, "bang");
	stateTrigger1 = true;
  }
//if statement stops the loop when we get to a certian threshold of fitness, an artistic decision to help keep an air of mystery
//And uncannyness to the samples that is lost if the sample is repeated in full to the audience
  if(getFitness(fittest)>15){
    return;
  }
  //resets the genome tracker, important for the data flow of the patch 
  valueRepeats = 0;

//Gets the fittest gene pool and then mutates it
for (var i = 0; i<10;i++){
    generations++;
    var pool = getGenePool(fittest);
    var pool2= [];
    for (var i=0;i<pool.length;++i){
      pool2[i]=doMutation(pool[i]);
    }
    fittest = getFittest(pool2);

    }
    //Starts the miniloop
  getValues();
  return fittest;

}

function getValues(){
	//3 * 8 = 24, this ensures that all of the values from the current fittest genome have been outputted before evolving futher
  if (valueRepeats===24){
    //stops the function loop in case the genome gets solved faster than expected and slips through the evolve() kill switch
    if(getFitness(fittest)===TARGET.length){
      return;
    }
    //changes the genepool and resets the genome tracker
    evolve();
  }
  else {
    //records 3 genes in the fittest genome and then spits it out of the program
    ATTEMPT=fittest.slice(valueRepeats, valueRepeats+3);
	//value repeats is used to
    valueRepeats+= 3;
    bang();
    }
    return;
}
