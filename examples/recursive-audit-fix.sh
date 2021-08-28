#!/bin/bash
FILE=package.json
for d in ./*/
do
    (
        cd "$d";
        if [[ -f "$FILE" ]];
        then
            echo $d;
            npm audit fix;
        else
            echo "This directory does not contain a node project"
        fi
        
    )
done
