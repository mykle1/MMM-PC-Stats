var debug=false
const path=require('path')
var local_text="";
if(debug)
{
  var fn=path.resolve(__dirname,'sensors.dat');
  var fs = require("fs");
  // get the data content separated by the empty line between
  local_text = fs.readFileSync(fn)+ '';
  
  console.log(convertToJson(local_text))
}


// add the double quotes around the json data
function wrap(str)
{
  return "\""+str.trim()+"\""
}

      
module.exports.convertToJson= function convertToJson(text)
{
//if(text===null)
//  text=local_text;
//console.log("local-text="+text);
  // default line end character
var lineend="\n";
var carriage_return="\r"
// watch out, this character MUST match what is used in the regex
var end_of_line_marker="!"  // <-------, have code below to fix this automagically
var expression_line_marker="!"
// watch out
var started=false;
var v;
var limit='';
var global="g"
var l;
var r;
var r1;
let match_offset=0;
var begin_array="[";
var end_array="]"
var begin_structure="{"
var end_structure="}"
var colon=":"
var literal_comma=","
var open_paren=")"
var empty_string=""
var not_found=-1
var expressions=["([^!]*)!([^:]*):\\s+([^!]*)!(.*)",                           // 0, name and type
                 "([^:]*):\\s+([^!]*)!(.*)",                                   // 1, colon separated data before paren
                 "\\((\\w*)\\s+=\\s+([^,]*),\\s+(\\w*)\\s+=\\s+([^\\)]*)\\)",      // 2, data contains paren wrapped limits
                 "([^:]*):\\s+([^\\s]*)\\s+(.*)",                               // 3, data up to the paren wrapped limits
                 "([^:]*):\\s+([^\\s]*)\\s+\\((\\w*)\\s+=\\s+([^,]*),\\s+(\\w*)\\s+=\\s+([^\\)]*)\\)!"  
                ]                              

// space for output
var output=[]

// lets do some setup first

// if the data looks like it contains a windows end of line (cr/lf) instead of linux (lf)
if(text.indexOf(carriage_return+lineend)>0)
  // adjust the line end character 
  lineend=carriage_return+lineend; 
 
// if the end of line marker is not what is used in the expressions
if(end_of_line_marker!==expression_line_marker)
{
  // update the expressions with the selected character
  var e=new RegExp(expression_line_marker,global)
  // loop thru the array of expressions used
  for(var i=0; i<expressions.length;i++)
  {    
    // apply the change
    expressions[i]=expressions[i].replace(e,end_of_line_marker)
    if(debug)
      console.log("new exp="+expressions[i])
  }
}

// split sensors output based on blank line between adapters   
var textForAdapter = text.split(lineend+lineend);

// assume we will have an array of adapters..  only 1, still works
output.push(begin_structure);
// loop thru the adapters of info
// note that here the adapter info is still delimited as normal lines, which will make it harder to parse
for( var i in textForAdapter)
{
   // watch out for empty lines.. shouldn't have any but
   // editing manually may produce one we didn't see
   if(textForAdapter[i].length>0) 
   {
      var rr = new RegExp(lineend,global)
      // replace all the default line end chars with the specified marker, 
      // puts the adapter data all on one 'line'
      textForAdapter[i] = textForAdapter[i].replace(rr,end_of_line_marker)+end_of_line_marker;         // replace all line ends with ! , so we don't get caught with the $ end of line problem
      // remove the unusable 'ALARM' token
      rr = new RegExp(" ALARM")
      textForAdapter[i] = textForAdapter[i].replace(rr,empty_string);     
      
      if(started==false)
      {
        // adapter is a json structure
        //output.push(begin_structure);
        started=true;         
      }

      
      // if no paren
      if(textForAdapter[i].indexOf(open_paren)==not_found)
      {
        // and no colon
        if(textForAdapter[i].indexOf(colon)==not_found)
        {
          // just a json label
          output.push(wrap("Name")+colon+wrap(textForAdapter[i])+literal_comma);
        }
        else 
        {          
          // get the adapter name and type
          var re=new RegExp(expressions[0]);
          r=textForAdapter[i].match(re)
          output.push(
                      wrap(r[1])+
                      colon+begin_structure+
                      wrap(r[2])+
                      colon+
                      wrap(r[3])
                      +literal_comma);
          // remaining data will be in results array index 4
          l=r[4]+empty_string;  

          // check for and strip off unusable info
          if(l.indexOf(colon)==l.indexOf(end_of_line_marker)-1)
          {     
            l=l.substring(l.indexOf(end_of_line_marker)+1)
          }
          // assume first time we don't need a preceding comma
          comma=empty_string
          // loop thru the rest of the data
          do{
            // get any individual data elements
            re=new RegExp(expressions[1]);
            r1=l.trim().match(re)
            // add a comma between last and this entry
            output.push(comma)
            // format the data element
            output.push(wrap(r1[1])+colon+wrap(r1[2]))
            // indicate we will need a comma between items
            comma=literal_comma
            // get any remaining data from the match regex
            l=r1[3];
            // while there is data left
          } while (l.length>0)
          output.push(end_structure+end_structure)         
        }
      }
      else  // this data DOES have paren  
      {
        // get the adapter name and type
        var re = new RegExp(expressions[0])          
        r =textForAdapter[i].match(re)
        output.push(
                      wrap(r[1])+
                      colon+begin_structure+
                      wrap(r[2])+
                      colon+
                      wrap(r[3])
                      +literal_comma);
          // get the remaining data from match results, index 4 of the array
          l=r[4]+empty_string;   // rest of the line after regex
          
          // loop thru the result of the data for this adapter
          do 
          {
            // there is colon separated data before the open paren still to process
            if(l.indexOf(colon)>0 && l.indexOf(open_paren)>l.indexOf(colon) )
            {
              // paren further down the line
              if(l.indexOf(open_paren)>l.indexOf(end_of_line_marker))
              {
                // get any data before the 1st paren, could be repeating
                re=new RegExp(expressions[1]);
                r1=l.match(re)
                // format the data element (regex match elements 1 and 2)
                output.push(wrap(r1[1])+colon+wrap(r1[2])+literal_comma)
                // reset the remaining data
                l=r1[3]; // rest of the line after regex
              }
              else // have some parenthesized data, no leading info
              {
                // by default the 1st match will be offset 3 in the returned match array
                // offset 0 is the input
                // offset 1 and 2 are used above
                match_offset=3;
                // set the work data variable
                v=l;
                
                // pick the right regex expression            
                if(v.indexOf(colon) == v.lastIndexOf(colon))   
                {  
                  re=new RegExp(expressions[3])
                }
                else
                {
                  re=new RegExp(expressions[4],global)
                  match_offset=0;
                }
                // get the number of matches
                r1=v.match(re);
                // if more than 1, and it better be!
                if(r1.length>1)
                {
                  let r2;
                  // again, useful match info will be offset 3 of the returned macth array
                  if(match_offset==3)
                  {
                    // output the item and value before the parens   "Core 0: +44c "
                   output.push(wrap(r1[1])+colon+" "+begin_structure+ wrap("current")+colon+wrap(r1[2])+literal_comma)
                   // parse out the subgroups of paren wrapped info
                   re=new RegExp(expressions[2],global)
                   // each prior match has the text of each paren wrapped group, so parse those one at a time
                   for(; match_offset <r1.length;match_offset++)
                   {
                    // create a new array of values to hold the limts info)
                    output.push(wrap("limits")+colon+begin_array);
                    var comma=empty_string;
                    // have to use exec for groups
                    while(r2=re.exec(r1[match_offset]))
                    {
                      // if the exec results length is an odd number of things
                      if(r2.length & 1 >0)
                      {
                        // write the 'trailing' comma at the front,  null first time.
                        // we will break the loop on no more data so won't have the extra trailing comma
                        output.push(comma)
                        output.push(begin_structure)
                        for(var q3=1; q3< r2.length; q3+=2)
                        {
                          output.push(wrap(r2[q3])+colon+wrap(r2[q3+1]))
                          if(q3< r2.length-2)
                          {
                            output.push(literal_comma)
                          }
                        }
                        output.push(end_structure)
                        comma=literal_comma;
                      }
                    }
                    output.push(end_array);
                    output.push(end_structure);                       
                    if(match_offset <r1.length-1)
                      output.push(literal_comma);                    
                   }
                  }
                  else    // doing a different paren wrapped string approach, 
                  {       // just paren wrapped "temp1: +34.5°C (high = +70.0°C, hyst = +60.0°C)!"
                    for(; match_offset <r1.length;match_offset++)
                    {
                      while(r2=re.exec(r1[match_offset]))
                      {
                        // format the element and its current value
                        output.push(wrap(r2[1])+colon+" "+begin_structure+ wrap("current")+colon+wrap(r2[2])+literal_comma)
                        // start a limits array
                        output.push(wrap("limits")+colon+begin_array+begin_structure);
                        comma=empty_string
                        if(r2.length & 1 >0)
                        {
                          // loop thru the list
                          for(var q3=3; q3< r2.length; q3+=2)
                          {
                            output.push(comma)
                            output.push(wrap(r2[q3])+colon+wrap(r2[q3+1]))
                            comma=literal_comma
                          }
                        }
                        output.push(end_structure);
                        output.push(end_array);
                        output.push(end_structure);
                          
                        if(match_offset <r1.length-1)
                          output.push(literal_comma);
                      }
                    }
                  }
                  // done with this line (block/adapters) of data
                  break;
                }
                else
                {
                  // shouldnt get here.. means data doesn't match the reg ex
                  output.push("there are "+r1.length+" matches="+r1[0]+ " "+ JSON.stringify(r1))
                  // get the remaining data from the regex match array
                  l=r1[3];
                }
              } 
            }
            else
              break;
          } while(true)
            
          output.push(end_structure);     // close all the open structures for this adapter
          started=false;          // tell start of new adapter to wrap with structure
          if(i<textForAdapter.length-1) // don't add comma for last adapter
            output.push(literal_comma)          
      }
    }
}
output.push(end_structure)
return output.join(' ');
}
