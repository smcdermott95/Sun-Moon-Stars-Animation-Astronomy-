/*
This program will take cities15000.txt and create a javascript file
that creates a JS LocationDB object. This object includes a
vector containing a Location object for each city selected from the .txt
file.

Note: cities15000.txt is a tab-seperated file provided from GeoNames containing
information for cities all over with world with a population over 15,000.
It is not included with the github repository because it is too large. 
Find it at:
http://download.geonames.org/export/dump/
*/


#include <fstream>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <vector>
#include <math.h>

using namespace std;

class Location
{
      public:
             string name;
             string state;
             string country;
             string region;
             double latitudeDegrees;
             double latitudeMinutes;
             char hemisphereNS;
             double longitudeDegrees;
             double longitudeMinutes;
             char hemisphereEW;
             int population;
             int timezone;
             bool observeDST;
      
      void print(void)
      {
           cout<<name<<" "<<latitudeDegrees<<" , "<<longitudeDegrees<<endl;
      }
};

bool compareLocation(Location a, Location b)
{
     return ((a.name).compare(b.name)<0);     
}

int main () {
    cout<<"Starting Program"<<endl;
    
    string inString;
    string subStr;
    Location inLocation;
    vector<Location> locationVec;
    ifstream inFile;
    int lineCount=1;
    inFile.open("cities15000.txt");
    
    while(getline(inFile, inString))
    {
                  stringstream ss(inString);
                  inLocation=Location();
                  while(getline(ss, subStr,'\t'))
                  {
                                    if(lineCount%19==2)
                                    {
                                        inLocation.name=subStr;
                                    }
                                   else if(lineCount%19==5)
                                   {
                                        double latitude=atof(subStr.c_str());
                                        inLocation.latitudeDegrees=floor(fabs(latitude));
                                        inLocation.latitudeMinutes=round(fmod(latitude, 1.0)*60.0);
                                        if(inLocation.latitudeMinutes==60)
                                        {
                                            inLocation.latitudeDegrees++;
                                            inLocation.latitudeMinutes=0;
                                        }
                                        if(latitude>=0)
                                        {
                                           inLocation.hemisphereNS='n';
                                        }
                                        else
                                        {
                                            inLocation.hemisphereNS='s';
                                        }    
                                   }
                                   else if(lineCount%19==6)
                                   {
                                        double longitude=atof(subStr.c_str());
                                        inLocation.longitudeDegrees=floor(fabs(longitude));
                                        inLocation.longitudeMinutes=round(fmod(fabs(longitude), 1.0)*60.0);
                                        if(inLocation.longitudeMinutes==60)
                                        {
                                            inLocation.longitudeDegrees++;
                                            inLocation.longitudeMinutes=0;
                                        }
                                        if(longitude>=0)
                                        {
                                           inLocation.hemisphereEW='e';
                                        }
                                        else
                                        {
                                            inLocation.hemisphereEW='w';
                                        }
                                   }
                                   else if(lineCount%19==9)
                                   {
                                        inLocation.country=subStr;
                                   }
                                   else if(lineCount%19==11)
                                   {
                                        inLocation.state=subStr;
                                   }
                                   else if(lineCount%19==15)
                                   {
                                        inLocation.population=atoi(subStr.c_str());
                                   }
                                   else if(lineCount%19==18)
                                   {
                                        inLocation.region=subStr;
                                   }
                                   lineCount++;
                  }
                  /*
                  if(inLocation.population>800000)
                  {
                       if(  !inLocation.country.compare("GB")
                          ||!inLocation.country.compare("DE")
                          ||!inLocation.country.compare("FR"))
                       {
                            //inLocation.print();         
                            locationVec.push_back(inLocation);                    
                       }
                  }
                  else */ if(inLocation.population>300000&&!inLocation.country.compare("US"))
                  {
                       if(!inLocation.region.compare("America/New_York")||!inLocation.region.compare("America/Detroit")||!inLocation.region.compare("America/Indiana/Indianapolis"))
                       {
                           inLocation.timezone=-5;
                           inLocation.observeDST=true;
                       }
                       else if(!inLocation.region.compare("America/Chicago"))
                       {
                           inLocation.timezone=-6;
                           inLocation.observeDST=true;
                       }
                       else if(!inLocation.region.compare("America/Denver"))
                       {
                           inLocation.timezone=-7;
                           inLocation.observeDST=true;
                       }
                       else if(!inLocation.region.compare("America/Los_Angeles"))
                       {
                           inLocation.timezone=-8;
                           inLocation.observeDST=true;
                       }
                       else if(!inLocation.region.compare("America/Phoenix"))
                       {
                           inLocation.timezone=-7;
                           inLocation.observeDST=false;
                       }
                       else if(!inLocation.region.compare("Pacific/Honolulu"))
                       {
                           inLocation.timezone=-10;
                           inLocation.observeDST=false;
                       }
                       cout<<inLocation.name<<" "<<inLocation.timezone<<endl;
                       locationVec.push_back(inLocation); 
                  }
    }
    
    inFile.close();
    
    sort(locationVec.begin(), locationVec.end(), compareLocation);
    
    ofstream outFile;
    outFile.open("locationDB.js");
    outFile<<"class LocationDB {"<<endl;
    outFile<<"  constructor() {"<<endl;
    outFile<<"    this.locationVec=\n      ["<<endl;
    
    for(int i=0; i<locationVec.size(); i++)
    {
        outFile<<"        new Location(\""<<locationVec[i].name<<"\","<<locationVec[i].latitudeDegrees<<","<<locationVec[i].latitudeMinutes<<",\""<<locationVec[i].hemisphereNS<<"\","<<locationVec[i].longitudeDegrees<<","<<locationVec[i].longitudeMinutes<<",\""<<locationVec[i].hemisphereEW<<"\","<<locationVec[i].timezone<<","<<locationVec[i].observeDST<<")";
        if(i+1<locationVec.size()) 
        {
            outFile<<",";
        }
        outFile<<endl;
    }
    
    outFile<<"      ];"<<endl;
    outFile<<"  }"<<endl;
    outFile<<"}"<<endl;
    outFile.close();
    
    
    cout<<"Completed: "<<locationVec.size()<<" cities found"<<endl;
    while(1);
    return 0;
}
