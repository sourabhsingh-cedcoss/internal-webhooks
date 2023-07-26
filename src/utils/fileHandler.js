import fs from 'fs';

const base_path = "src/logs/";

// Function to write JSON data to a .log file asynchronously
export function writeJSONToFileAsync(filename, jsonData) {
  return new Promise((resolve, reject) => {
    // const jsonString = JSON.stringify(jsonData, null, 2); // Convert JSON data to a formatted string
    fs.writeFile(base_path+filename+'.json', jsonData, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`JSON data written to ${base_path+filename}`);
        resolve();
      }
    });
  });
}

// Function to read JSON data from a .log file asynchronously
export function readJSONFromFileAsync(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(base_path+filename, 'utf8', (err, jsonString) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(jsonString); // Parse the JSON string back into an object
          console.log(`JSON data read from ${base_path+filename}`);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
